const autoprefixer = require("autoprefixer");
const fs = require("fs-extra");
const mustache = require("mustache");
const path = require("path");
const postcss = require("postcss");
const request = require("request-promise-native");

const BUILD_DIR = path.join(".", "build");
const SRC_DIR = path.join(".", "src");

const CANIUSE_JSON_CDN =
  "https://cdn.rawgit.com/Fyrd/caniuse/2f6c1df9/features-json/flexbox.json";

async function build() {
  await ensureBuildDir();
  await templateHtml();
  await buildCSS();
}

async function buildCSS() {
  const css = (await fs.readFile(
    path.join(SRC_DIR, "css", "index.css")
  )).toString();
  const processed = (await postcss([
    autoprefixer({
      browsers: ["cover 99.5%"]
    })
  ]).process(css)).css;
  await fs.writeFile(path.join(BUILD_DIR, "index.css"), processed);
}

async function ensureBuildDir() {
  await fs.ensureDir(BUILD_DIR);
}

async function getCanIUseJson() {
  return await request(CANIUSE_JSON_CDN).json();
}

async function getSupportPercentages() {
  const supportData = await getCanIUseJson();
  return {
    global: supportData.usage_perc_y,
    partial: supportData.usage_perc_y + supportData.usage_perc_a
  };
}

async function getTemplateData() {
  return {
    support: await getSupportPercentages()
  };
}

async function templateHtml() {
  const templateData = await getTemplateData();
  const indexHtml = (await fs.readFile(
    path.join(SRC_DIR, "index.mst")
  )).toString();
  const rendered = mustache.render(indexHtml, templateData);
  await fs.writeFile(path.join(BUILD_DIR, "index.html"), rendered);
}

build().catch(err => {
  console.error("Build failed, exiting status 1");
  console.error(err);
  process.exit(1);
});
