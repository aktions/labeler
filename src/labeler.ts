import * as core from "@actions/core";
import { GitHub, context } from "@actions/github";
import { Configuration } from "./configuration";

export class Labeler {

  private github: GitHub | undefined;

  constructor(github?: GitHub) {
    this.github = github;
  }

  async diff(): Promise<string[]> {

    const response = await this.github!.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: this.getPullRequestNumber()
    });

    core.debug("found changed files:");
    return response.data.map(f => {
      core.debug("  " + f.filename);
      return f.filename
    });
  }

  match(config: Configuration, files: string[]): string[] {
    const labels = new Set<string>();

    for (const [label, matchers] of config) {
      for (const matcher of matchers) {
        core.debug(` checking ${matcher}`);
        for (const file of files) {
          if (matcher.match(file)) {
            const replaced = matcher.replace(file, label);
            labels.add(replaced);
            core.debug(` - ${file} [${replaced}]`);
          } else {
            core.debug(` - ${file}`);
          }
        }
      }
    }

    return Array.from(labels);
  }

  getPullRequestNumber(): number {
    const pullRequest = context.payload.pull_request;
    if (!pullRequest) {
      throw Error(`pull request not found`);
    }
    return pullRequest.number;
  }

  async addLabels(labels: string[]) {
    await this.github!.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: this.getPullRequestNumber(),
      labels: labels
    });
  }
}

