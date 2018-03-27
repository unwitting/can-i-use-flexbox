const fs = require("fs-extra");
const path = require("path");
const request = require("request-promise-native");

const BUILD_DIR = path.join(".", "build");
const SRC_DIR = path.join(".", "src");

async function build() {
  await ensureBuildDir();
  await copyHtml();
}

async function copyHtml() {
  await fs.copy(
    path.join(SRC_DIR, "index.html"),
    path.join(BUILD_DIR, "index.html")
  );
}

async function ensureBuildDir() {
  await fs.ensureDir(BUILD_DIR);
}

build().catch(err => {
  console.error("Build failed, exiting status 1");
  console.error(err);
  process.exit(1);
});
