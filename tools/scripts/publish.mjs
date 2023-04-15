/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import pkg from '@nrwl/devkit';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

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
  tag = "next";
}
if(update === "undefined") {
  update = 'patch';
}
if(!['minor', 'major', 'patch'].includes(update)) {
  invariant(project, '"minor", "major" or "patch" are valid arguments for --update')
}

const graph = pkg.readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`
);

process.chdir(outputPath);

// Updating the version in "package.json" before publishing
try {
  const json = JSON.parse(readFileSync(`package.json`).toString());  
  const elements = json.version.split('.');  
  switch(update) {
    case 'major':
      elements[0]++;
      break;
    case 'minor':
      elements[1]++;
      break;
    case 'patch':
      elements[2]++
    break;
  }  
  json.version = elements.join('.');
  console.log(json.version);
  writeFileSync(`package.json`, JSON.stringify(json, null, 2));
} catch (e) {
  console.error(
    chalk.bold.red(`Error reading package.json file from library build output.`)
  );
}

// Execute "npm publish" to publish
execSync(`npm publish --access public --tag ${tag}`);
