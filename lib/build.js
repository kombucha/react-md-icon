const fs = require("fs");
const path = require("path");
const util = require("util");
const babel = require("babel-core");

const { default: svgr } = require("@svgr/core");
const SVGO = require("svgo");
const pAll = require("p-all");
const camelcase = require("camelcase");
const Progress = require("progress");
const mkdirpCb = require("mkdirp");
const del = require("del");

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

const getComponentName = iconFileName => camelcase(iconFileName.match(/.*\/(.*)\.svg$/)[1], { pascalCase: true });

const transformToReactComponent = async (componentName, svgContent) =>
  svgr(svgContent, { icon: true, svgo: false }, { componentName });

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

  await del(`${DIST_DIRECTORY}`);
  await mkdirp(DIST_DIRECTORY);

  await pAll(
    svgFiles.map(svgFile => async () => {
      const fileBuffer = await readFile(svgFile);
      const svgContent = fileBuffer.toString();
      const componentName = getComponentName(svgFile);
      const outputPath = path.resolve(DIST_DIRECTORY, `${componentName}.js`);

      try {
        const optimizedSvg = await svgo.optimize(svgContent);
        const optimizedSvgContent = optimizedSvg.data;
        const reactComponentContent = await transformToReactComponent(componentName, optimizedSvgContent);
        const babelResult = await babel.transform(reactComponentContent, babelOptions);
        const compiledReactComponent = babelResult.code;

        await writeFile(outputPath, compiledReactComponent);
        createdComponents.push(componentName);
      } catch (error) {
        errors.push(error);
      } finally {
        progressBar.tick();
      }
    }),
    { concurrency: 20 }
  );

  const statusIcon = errors.length === 0 ? "✅" : "⚠️";
  console.log(`${statusIcon} Done !`);
  if (errors.length) {
    errors.forEach(err => console.error(err));
  }
}

program();
