/* eslint-disable unicorn/no-array-method-this-argument */

import $ from 'jquery';

import { Constants } from '../../constants';
import type { DiffFinder, UmlDiffContent } from '../finder';

import { GitHubFileViewFinder } from './gitHubFileViewFinder';

export class GitHubPullRequestDiffFinder implements DiffFinder {
  private static getBaseHeadFilePaths($diff: JQuery<Node>): [string, string] {
    const title = $diff.find('div.file-info a').attr('title');
    if (!title) return ['', ''];
    const separator = ' → ';
    const fragments = title.split(separator);
    const filePaths = [];
    let filePath = '';
    for (const fragment of fragments) {
      filePath += fragment;
      if (/^.*\.(plantuml|pu|puml|wsd)$/.test(filePath)) {
        filePaths.push(filePath);
        filePath = '';
      } else {
        filePath += separator;
      }
    }
    if (filePaths.length === 1) return [filePaths[0], filePaths[0]];
    if (filePaths.length === 2) return [filePaths[0], filePaths[1]];
    return ['', ''];
  }

  private static async getTexts(fileUrl: string): Promise<string[]> {
    const response = await fetch(fileUrl);
    if (!response.ok) return [];
    const htmlString = await response.text();
    const $body = $(new DOMParser().parseFromString(htmlString, 'text/html')).find('body');
    const fileBlockFinder = new GitHubFileViewFinder();
    const contents = await fileBlockFinder.findContents(fileUrl, $body);
    return contents.map((content) => content.text);
  }

  private readonly URL_REGEX = /^https:\/\/github\.com\/.*\/pull\/\d+\/files/;

  canFind(webPageUrl: string): boolean {
    return this.URL_REGEX.test(webPageUrl);
  }

  async findContents(webPageUrl: string, $root: JQuery<Node>): Promise<UmlDiffContent[]> {
    const blobRoot = webPageUrl.replace(/pull\/\d+\/files.*/, 'blob');
    const [baseBranchName, headBranchName] = this.getBaseHeadBranchNames($root);
    const diffs = this.getDiffs($root);
    const result = await Promise.all(
      diffs.map(($diff) => this.getDiffContent(blobRoot, baseBranchName, headBranchName, $diff))
    );
    return result.filter((content) => content.$diff.length > 0);
  }

  private getBaseHeadBranchNames($root: JQuery<Node>): [string, string] {
    const $baseRef = $root.find(this.getBranchNameSelector('base'));
    const $headRef = $root.find(this.getBranchNameSelector('head'));
    return [$baseRef.text(), $headRef.text()];
  }

  private getBranchNameSelector(baseOrHead: 'base' | 'head'): string {
    return `span.commit-ref.css-truncate.user-select-contain.expandable.${baseOrHead}-ref span.css-truncate-target`;
  }

  private getDiffs($root: JQuery<Node>): JQuery<Node>[] {
    const $diffs = $root.find(`div[id^='diff-']:not([${Constants.ignoreAttribute}])`);
    return [...Array.from({ length: $diffs.length }).keys()].map((i) => $diffs.eq(i));
  }

  private async getDiffContent(
    blobRoot: string,
    baseBranchName: string,
    headBranchName: string,
    $diff: JQuery<Node>
  ): Promise<UmlDiffContent> {
    const [baseFilePath, headFilePath] = GitHubPullRequestDiffFinder.getBaseHeadFilePaths($diff);
    const $diffBlock = $diff.find('div.js-file-content.Details-content--hidden');
    if (
      (!baseFilePath && !headFilePath) ||
      $diffBlock.length === 0 ||
      $diffBlock.find('div.data.highlight.empty').length > 0
    ) {
      return { $diff: $(), baseBranchName, headBranchName, baseTexts: [], headTexts: [] };
    }
    const fileUrls = [
      blobRoot + '/' + baseBranchName + '/' + baseFilePath,
      blobRoot + '/' + headBranchName + '/' + headFilePath,
    ];
    const [baseTexts, headTexts] = await Promise.all(
      fileUrls.map((fileUrl) => GitHubPullRequestDiffFinder.getTexts(fileUrl))
    );
    return { $diff: $diffBlock, baseBranchName, headBranchName, baseTexts, headTexts };
  }
}
