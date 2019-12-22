import * as core from "@actions/core";
import { GitHub } from "@actions/github";
import { Labeler } from "./labeler";
import { Configuration } from "./configuration";

async function run() {
  try {
    const githubToken = core.getInput("github-token", { required: true });
    const github = new GitHub(githubToken);

    const configPath = core.getInput("configuration-path", { required: true });
    const config = new Configuration(github);
    config.load(configPath);

    const labeler = new Labeler(github);
    const files = await labeler.diff();
    const labels = labeler.match(config, files);
    
    if (labels.length > 0) {
      await labeler.addLabels(labels);
    }

  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
