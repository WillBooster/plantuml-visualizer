import $ from 'jquery';
import { GitHubCodeBlockFinder, GitHubFileBlockFinder, GitHubPullRequestDiffFinder } from './GitHubFinder';
import { Mutator } from './Mutator';
import { Constants } from './Constants';

chrome.runtime.sendMessage({ command: Constants.toggleEnabled }, extensionEnabled => {
  if (extensionEnabled) activatePlugin();
});

function activatePlugin() {
  const activeFinders = [new GitHubCodeBlockFinder(), new GitHubFileBlockFinder(), new GitHubPullRequestDiffFinder()];
  Mutator.embedPlantUmlImages(activeFinders, location.href, $(document.body));

  const observer = new MutationObserver(mutations => {
    const addedSomeNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (addedSomeNodes) {
      Mutator.embedPlantUmlImages(activeFinders, location.href, $(document.body));
    }
  });
  observer.observe(document.body, { childList: true });
}
