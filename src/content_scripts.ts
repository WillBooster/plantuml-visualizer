import $ from 'jquery';
import { GitHubCodeBlockFinder, GitHubFileBlockFinder } from './Finder';
import { Mutator } from './Mutator';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.hello) {
    if (window) {
      window.alert('Hello World!');
    }
    response({
      startedExtension: true,
    });
  }
});

const activeFinders = [new GitHubCodeBlockFinder(), new GitHubFileBlockFinder()];
Mutator.embedPlantUmlImages(activeFinders, location.href, $(document.body));

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      Mutator.embedPlantUmlImages(activeFinders, location.href, $(node));
    }
  }
});
observer.observe(document.body, { childList: true });
