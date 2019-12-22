import { Minimatch, IMinimatch } from "minimatch";

export interface Matcher {
    match(str: string): boolean;
    replace(str: string, replace: string): string;
}

export class GlobMatcher implements Matcher {

    private m: IMinimatch;

    constructor(pattern: string) {
        this.m = new Minimatch(pattern);
    }

    match(str: string): boolean {
        return this.m.match(str);
    }

    replace(_: string, replace: string): string {
        return replace;
    }

    toString(): string {
        return `glob ${this.m.pattern}`;
    }
}

export class RegExpMatcher implements Matcher {

    private regex: RegExp;

    constructor(regex: RegExp) {
        this.regex = regex;
    }

    match(str: string): boolean {
        return str.match(this.regex) !== null;
    }

    replace(str: string, replace: string): string {
        return str.replace(this.regex, replace);
    }

    toString(): string {
        return `regex ${this.regex}`;
    }
}