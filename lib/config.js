const path = require("path");

module.exports = {
  ICONS_CONFIG_URL: "https://material.io/tools/icons/static/data.json",
  ICON_SVG_BASE_URL: "https://material.io/tools/icons/static/icons",
  MATERIAL_THEMES: ["baseline", "outline", "round", "twotone", "sharp"],
  SVG_DIRECTORY: path.resolve("./svg"),
  REACT_DIRECTORY: path.resolve("./react")
};
