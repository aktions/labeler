import { GitHub, context } from "@actions/github";
import * as yaml from "js-yaml";
import { isRegExp, isString } from "util";
import { Matcher, GlobMatcher, RegExpMatcher } from "./matcher";

export class Configuration implements ReadonlyMap<string, Matcher[]> {
  
  private github: GitHub | undefined;

  private config: Map<string, Matcher[]>;

  constructor(github?: GitHub) {
    this.github = github;
    this.config = new Map();
  }

  /**
   * Loads configuration from github pull request context using the oktokit 
   * client.
   * 
   * @param github GitHub
   */
  async load(path: string) {
    const response = await this.github!.repos.getContents({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: path,
      ref: context.sha
    });
    this.parse(Buffer.from(response.data.content, "base64").toString());
  }

  /**
   * Parses configuration from a raw yaml formatted string.
   * 
   * @param raw string
   */
  parse(raw: string) {

    const labelMatchers = yaml.load(raw);
    for (let label in labelMatchers) {
      let matchers = labelMatchers[label];
      if (!Array.isArray(matchers)) { 
        matchers = [matchers]; 
      }

      this.config.set(label, matchers.map((matcher: any) => {
        if (isRegExp(matcher)) {
          return new RegExpMatcher(matcher as RegExp);
        } else if (isString(matcher)) {
          return new GlobMatcher(matcher as string);
        }
        throw Error(`found unexpected type ${matcher} in label ${label} (should be a string or regexp)`);
      }));

      this.size = this.config.size;
    }
  }

  size: number = 0;

  forEach(callbackfn: (value: Matcher[], key: string, map: ReadonlyMap<string, Matcher[]>) => void, thisArg?: any) {
    this.config.forEach(callbackfn);
  }

  get(key: string): Matcher[] | undefined {
    return this.config.get(key);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  [Symbol.iterator](): IterableIterator<[string, Matcher[]]> {
    return this.config.entries();
  }
  
  entries(): IterableIterator<[string, Matcher[]]> {
    return this.config.entries();
  }
  
  keys(): IterableIterator<string> {
    return this.config.keys();
  }

  values(): IterableIterator<Matcher[]> {
    return this.config.values();
  }
}