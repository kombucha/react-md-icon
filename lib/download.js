const fs = require("fs");
const path = require("path");
const util = require("util");
const stream = require("stream");

const got = require("got");
const pAll = require("p-all");
const Progress = require("progress");

const {
  ICONS_CONFIG_URL,
  ICON_SVG_BASE_URL,
  MATERIAL_THEMES,
  SVG_DIRECTORY
} = require("./config");

const pipeline = util.promisify(stream.pipeline);

// TODO: Clean up files on fail
async function saveIcon(iconId, theme = "baseline") {
  const iconUrl = `${ICON_SVG_BASE_URL}/${theme}-${iconId}-24px.svg`;
  const targetFile = path.resolve(SVG_DIRECTORY, `${theme}-${iconId}.svg`);

  await pipeline(got.stream(iconUrl), fs.createWriteStream(targetFile));
}

async function program() {
  const response = await got(ICONS_CONFIG_URL, { json: true });
  const config = response.body;
  const iconIds = config.categories.reduce(
    (acc, category) => acc.concat(category.icons.map(icon => icon.id)),
    []
  );
  const iconIdsWithThemes = iconIds.reduce(
    (acc, iconId) => acc.concat(MATERIAL_THEMES.map(theme => [theme, iconId])),
    []
  );

  const progressBar = new Progress(
    "Downloading icons [:bar] :current/:total :elapsed s",
    {
      complete: "=",
      incomplete: " ",
      width: 20,
      total: iconIdsWithThemes.length
    }
  );

  const errors = [];
  await pAll(
    iconIdsWithThemes.map(([theme, iconId]) => async () => {
      try {
        await saveIcon(iconId, theme);
      } catch (error) {
        errors.push({ iconName: `${theme}-${iconId}`, error });
      } finally {
        progressBar.tick();
      }
    }),
    { concurrency: 10 }
  );

  console.log("✅ Done !");
  if (errors.length) {
    errors.forEach(err => console.log(`Failed to load ${err.iconName}`));
  }
}

program();
