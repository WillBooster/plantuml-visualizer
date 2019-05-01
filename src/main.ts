import { CodeBlocksUmlVisualizer, ViewedFileUmlVisualizer } from './Visualizer';
import { PlantUmlEncoder } from './PlantUmlEncoder';

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

const codeBlocksUmlVisualizer = new CodeBlocksUmlVisualizer();
const viewedFileUmlVisualizer = new ViewedFileUmlVisualizer();
codeBlocksUmlVisualizer.repaceTextWithImage();
viewedFileUmlVisualizer.repaceTextWithImage();

const umlString = '@startuml\nclass A\n@enduml';
console.log(PlantUmlEncoder.getImageUrl(umlString));
