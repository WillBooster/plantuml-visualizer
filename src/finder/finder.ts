export interface UmlCodeContent {
  $text: JQuery<Node>;
  text: string;
}

export interface CodeFinder {
  canFind(webPageUrl: string): boolean;
  find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlCodeContent[]>;
}

export interface UmlDiffContent {
  $diff: JQuery<Node>;
  baseBranchName: string;
  headBranchName: string;
  baseTexts: string[];
  headTexts: string[];
}

export interface DiffFinder {
  canFind(webPageUrl: string): boolean;
  find(webPageUrl: string, $root: JQuery<Node>): Promise<UmlDiffContent[]>;
}
