import $ from 'jquery';
import { GitHubCodeBlockFinder, GitHubFileBlockFinder } from './Finder';
import { Mutator } from './Mutator';

$(document).ready(() => {
  chrome.runtime.sendMessage({ command: 'validityRequest' }, pluginIsValid => {
    console.log(pluginIsValid);
    if (pluginIsValid) activatePlugin();
  });
});

function activatePlugin() {
  const activeFinders = [new GitHubCodeBlockFinder(), new GitHubFileBlockFinder()];
  Mutator.embedPlantUmlImages(activeFinders, location.href, $(document.body));

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        Mutator.embedPlantUmlImages(activeFinders, location.href, $(document.body));
      }
    }
  });
  observer.observe(document.body, { childList: true });
}
