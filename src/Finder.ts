export interface PlantUmlContent {
  $text: JQuery<Node>;
  text: string;
}

export interface Finder {
  find(webPageUrl: string, $root: JQuery<Node>): PlantUmlContent[];
}
