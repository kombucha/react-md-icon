const fs = require("fs");
const path = require("path");
const util = require("util");

const { default: svgr } = require("@svgr/core");
const SVGO = require("svgo");
const pAll = require("p-all");
const camelcase = require("camelcase");
const Progress = require("progress");
const mkdirpCb = require("mkdirp");
const del = require("del");

const { SVG_DIRECTORY, REACT_DIRECTORY } = require("./config");

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
          }

          if (!item.isElem(["path", "circle"])) return true;
          if (item.hasAttr("fill", "none")) return false;

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

  await del(`${REACT_DIRECTORY}`);
  await mkdirp(REACT_DIRECTORY);

  await pAll(
    svgFiles.map(svgFile => async () => {
      const fileBuffer = await readFile(svgFile);
      const svgContent = fileBuffer.toString();
      const componentName = getComponentName(svgFile);
      const outputPath = path.resolve(REACT_DIRECTORY, `${componentName}.js`);

      try {
        const optimizedSvg = await svgo.optimize(svgContent);
        const optimizedSvgContent = optimizedSvg.data;

        const reactComponentContent = await transformToReactComponent(componentName, optimizedSvgContent);

        await writeFile(outputPath, reactComponentContent);
        createdComponents.push(componentName);
      } catch (error) {
        errors.push(error);
      } finally {
        progressBar.tick();
      }
    }),
    { concurrency: 20 }
  );

  try {
    const indexPath = path.resolve(REACT_DIRECTORY, "index.js");
    const indexContent = createdComponents
      .map(componentName => `export { default as ${componentName} } from "./${componentName}";`)
      .join("\n");
    await writeFile(indexPath, indexContent);
  } catch (error) {
    errors.push(error);
  }

  const statusIcon = errors.length === 0 ? "✅" : "⚠️";
  console.log(`${statusIcon} Done !`);
  if (errors.length) {
    errors.forEach(err => console.error(err));
  }
}

program();
