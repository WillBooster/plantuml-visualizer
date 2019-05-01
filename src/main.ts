import $ from 'jquery';
import { getCodeBlockTexts } from './text_capturer';

// Message Listener function
chrome.runtime.onMessage.addListener((request, sender, response) => {
  // If message is injectDiv
  if (request.injectApp) {
    // Inject our app to DOM and send response
    injectDiv();
    response({
      startedExtension: true,
    });
  }
});

const injectDiv = () => {
  const newDiv = document.createElement('div');
  newDiv.setAttribute('id', 'chromeExtensionReactApp');
  newDiv.innerText = `The number of div elements: {$('div').length}`;
  document.body.appendChild(newDiv);
};

console.log(getCodeBlockTexts());

const viewedFilename = $('#blob-path > .final-path');

if (viewedFilename && viewedFilename.text().match('(.*.pu)|(.*.puml)|(.*.plantuml)')) {
  $("div[itemprop='text'][class='Box-body p-0 blob-wrapper data type-text ']").click(() => {
    window.alert('hello');
  });
}
