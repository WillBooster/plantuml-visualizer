import { GitHubCodeBlockFinder, GitHubFileBlockFinder } from './Finder';
import { Mutator } from './Mutator';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.hello) {
    window.alert('Hello World!');
    response({
      startedExtension: true,
    });
  }
});

const activeFinders = [new GitHubCodeBlockFinder(), new GitHubFileBlockFinder()];
Mutator.registerOnClickEvents(activeFinders, location.href);
