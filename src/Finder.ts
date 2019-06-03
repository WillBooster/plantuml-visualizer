export interface UmlContent {
  $text: JQuery<Node>;
  text: string;
}

export interface Finder {
  find(webPageUrl: string, $root: JQuery<Node>): UmlContent[];
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
  find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlDiffContent[]>;
}
