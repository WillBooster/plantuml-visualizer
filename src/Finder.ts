export interface PlantUmlContent {
  $text: JQuery<Node>;
  texts: string[];
}

export interface Finder {
  find(webPageUrl: string, $root: JQuery<Node>): Promise<PlantUmlContent[]>;
}
