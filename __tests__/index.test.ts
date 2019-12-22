import { Labeler } from "../src/labeler";
import { Configuration } from "../src/configuration";
import { GlobMatcher, RegExpMatcher } from "../src/matcher";

const yaml = `
core:
- core/*.js
- core/**/*.js
resource/$1:
- !!js/regexp /package\/resource_(\\w*?)(_test)?.go/
docs:
- !!js/regexp docs/(\\w*?).md
`;

describe("Configuration", () => {
  it("should parse yaml configuration correctly", async () => {

    const config = new Configuration();
    config.parse(yaml);

    expect(config.size).toBe(3);
    expect(config.has("core")).toBeTruthy();
    expect(config.get("core")).toBeInstanceOf(Array);
    expect(config.get("core")![0]).toBeInstanceOf(GlobMatcher);
    expect(config.has("resource/$1")).toBeTruthy();
    expect(config.get("resource/$1")).toBeInstanceOf(Array);
    expect(config.get("resource/$1")![0]).toBeInstanceOf(RegExpMatcher);
  });
});

describe("Matcher", () => {
  it("should match patterns correctly", async () => {
    const matchers = [
      { file: "foo.js", matcher: new GlobMatcher("*.js") },
      { file: "foo/bar.js", matcher: new GlobMatcher("**/*.js") },
      { file: "foo/bar/baz.js", matcher: new GlobMatcher("**/*.js") },
      { file: "foo.js", matcher: new RegExpMatcher(/\w+\.js/) },
      { file: "foo/bar.js", matcher: new RegExpMatcher(/(\w+\/)+\w+\.js/) },
      { file: "foo/bar/baz.js", matcher: new RegExpMatcher(/(\w+\/)+\w+\.js/) }
    ];
    for (const test of matchers) {
      // console.log(`${test.file} ${test.matcher}`);
      expect(test.matcher.match(test.file)).toBeTruthy();
    }
  });
});

describe("Labeler", () => {
  it("should produce the correct labels", async () => {

    const config = new Configuration();
    config.parse(yaml);

    const labeler = new Labeler();

    const files = [
      "package/resource_foo.go",
      "package/resource_foo_test.go",
      "package/resource_bar.go",
      "docs/introduction.md",
      "docs/installation.md",
      "core/foo.js",
      "core/foo/foo.js",
      "README.md"
    ];

    const labels = labeler.match(config, files);

    expect(labels).toHaveLength(4);
    expect(labels).toContain("core");
    expect(labels).toContain("resource/foo");
    expect(labels).toContain("resource/bar");
    expect(labels).toContain("docs");
  });
});
