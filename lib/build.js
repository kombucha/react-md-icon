const fs = require("fs");
const path = require("path");
const util = require("util");

const algoliasearch = require("algoliasearch");
const babel = require("babel-core");
const camelcase = require("camelcase");
const del = require("del");
const mkdirpCb = require("mkdirp");
const pAll = require("p-all");
const Progress = require("progress");
const SVGO = require("svgo");
const { default: svgr } = require("@svgr/core");
const { getProps } = require("@svgr/core/lib/templates/util");

const { SVG_DIRECTORY, DIST_DIRECTORY } = require("./config");

const babelOptions = {
  presets: ["react"],
  plugins: ["transform-es2015-modules-commonjs"]
};

const svgoConfig = {
  plugins: [
    { removeViewBox: false },
    { removeXMLNS: true },
    {
      materialDesign: {
        type: "perItem",
        name: "materialDesign",
        fn: function(item) {
          if (item.isElem("svg")) {
            item.addAttr({
              name: "width",
              value: "1em",
              prefix: "",
              local: "width"
            });
            item.addAttr({
              name: "height",
              value: "1em",
              prefix: "",
              local: "height"
            });

            return true;
          }

          if (item.hasAttr("fill", "none")) return false;

          if (!item.isElem(["path", "circle"])) return true;

          item.addAttr({
            name: "fill",
            value: "currentColor",
            prefix: "",
            local: "fill"
          });

          return true;
        }
      }
    }
  ]
};

const svgrOptions = {
  icon: true,
  svgo: false,
  prettier: false,
  template: (code, config, state) => `
      const React = require('react');
      module.exports = function ${state.componentName}(${getProps(config)}) {
        return ${code};
      };`
};

const algoliaClient = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex("react-md-icon");

const buildIconMetadata = iconFileName => {
  const [, theme, name] = iconFileName.match(/.*\/(.*?)-(.*)\.svg$/);
  const componentName = camelcase(`${theme}-${name}`, { pascalCase: true });

  return {
    id: componentName,
    objectID: componentName,
    theme,
    name,
    componentName
  };
};

const transformToReactComponent = async (componentName, svgContent) => svgr(svgContent, svgrOptions, { componentName });

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readDir = util.promisify(fs.readdir);
const mkdirp = util.promisify(mkdirpCb);

async function program() {
  const svgo = new SVGO(svgoConfig);
  const dirFiles = await readDir(SVG_DIRECTORY);
  const svgFiles = dirFiles.filter(f => f.endsWith(".svg")).map(f => path.resolve(SVG_DIRECTORY, f));

  const progressBar = new Progress("Optimizing icons [:bar] :current/:total :elapsed s", {
    complete: "=",
    incomplete: " ",
    width: 20,
    total: svgFiles.length
  });

  const errors = [];
  const createdComponents = [];

  // Prepare folder
  await del(`${DIST_DIRECTORY}`);
  await mkdirp(DIST_DIRECTORY);

  // Process icons
  await pAll(
    svgFiles.map(svgFile => async () => {
      const fileBuffer = await readFile(svgFile);
      const svgContent = fileBuffer.toString();
      const iconMetadata = buildIconMetadata(svgFile);
      const outputPath = path.resolve(DIST_DIRECTORY, `${iconMetadata.componentName}.js`);

      try {
        const optimizedSvg = await svgo.optimize(svgContent);
        const optimizedSvgContent = optimizedSvg.data;
        const reactComponentContent = await transformToReactComponent(iconMetadata.componentName, optimizedSvgContent);
        const compiledReactComponent = babel.transform(reactComponentContent, babelOptions).code;

        await writeFile(outputPath, compiledReactComponent);
        createdComponents.push({ ...iconMetadata, svg: optimizedSvgContent });
      } catch (error) {
        errors.push(error);
      } finally {
        progressBar.tick();
      }
    }),
    { concurrency: 20 }
  );

  // Index in algolia
  try {
    await algoliaIndex.addObjects(createdComponents);
  } catch (e) {
    errors.push(e);
  }

  const statusIcon = errors.length === 0 ? "✅" : "⚠️";
  console.log(`${statusIcon} Done !`);
  if (errors.length) {
    errors.forEach(err => console.error(err));
  }
}

program();
