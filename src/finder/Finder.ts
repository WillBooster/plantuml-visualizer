export interface UmlContent {
  $text: JQuery<Node>;
  text: string;
}

export interface Finder {
  canFind(webPageUrl: string): boolean;
  find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlContent[]>;
}

export interface UmlDiffContent {
  $diff: JQuery<Node>;
  baseBranchName: string;
  headBranchName: string;
  baseTexts: string[];
  headTexts: string[];
}

// DiffFinder is not a sub-interface of Finder
export interface DiffFinder {
  canFind(webPageUrl: string): boolean;
  find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlDiffContent[]>;
}
