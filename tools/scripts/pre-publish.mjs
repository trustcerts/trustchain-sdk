/**
 * This script will set the next version in the package.json file so when the building step is happending all proejcts will use the latest version of the dependancy.
 */
import pkg from '@nrwl/devkit';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';
import axios from 'axios';

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

// Executing publish script: node path/to/publish.mjs {name} --update {version} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
let [, , name, update, tag] = process.argv;
if(tag === 'undefined') {
  tag = "latest";
}
if(update === "undefined") {
  update = 'patch';
}

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
if(!['minor', 'major', 'patch'].includes(update) && !validVersion.test(update)) {
  invariant(project, '"minor", "major", "patch" or a specific version like "14.0.0" are valid arguments for --update')
}

const graph = pkg.readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

// TODO we also need to update the package.json file to make sure we get persist the latest version

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`
);

const projectPackageJson = project.data?.targets?.build?.options?.project;

// Updating the version in "package.json" before publishing
try {
  const json = JSON.parse(readFileSync(projectPackageJson).toString());
  if(["major", "minor", "patch"].includes(update)) {
    // get the latest version from npm. In this case we do not need to persist it locally and make another push to changed code or manage it via tags in git.
    const version = (await axios.get(`https://registry.npmjs.org/${json.name}/latest`)).data.version;
    const elements = version.split('.');
    switch(update) {
      case 'major':
        elements[0]++;
        elements[1] = 0;
        elements[2] = 0;
        break;
      case 'minor':
        elements[1]++;
        elements[2] = 0;
        break;
      case 'patch':
        elements[2]++
      break;
    }
    json.version = elements.join('.');
  } else {
    json.version = update;
  }
  // json.version = "13.5.23";
  writeFileSync(projectPackageJson, JSON.stringify(json, null, 2));
} catch (e) {
  console.error(
    chalk.bold.red(`Error reading package.json file from library build output.`)
  );
}
