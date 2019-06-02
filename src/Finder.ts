export interface PlantUmlContent {
  $text: JQuery<Node>;
  text: string;
}

export interface Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[];
}

export interface PlantUmlDiffContent {
  $diff: JQuery<Node>;
  baseTexts: string[];
  headTexts: string[];
}

// DiffFinder is not a sub-interface of Finder
export interface DiffFinder {
  find(webPageUrl: string, $root: JQuery<Node>): Promise<PlantUmlDiffContent[]>;
}
