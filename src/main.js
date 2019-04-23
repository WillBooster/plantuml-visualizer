import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  render() {
    return <div> The number of div elements: {$('div').length}</div>;
  }
}

// Message Listener function
chrome.runtime.onMessage.addListener((request, sender, response) => {
  // If message is injectApp
  if (request.injectApp) {
    // Inject our app to DOM and send response
    injectApp();
    response({
      startedExtension: true,
    });
  }
});

function injectApp() {
  const newDiv = document.createElement('div');
  newDiv.setAttribute('id', 'chromeExtensionReactApp');
  document.body.appendChild(newDiv);
  ReactDOM.render(<App/>, newDiv);
}

$("pre[lang='uml']").click(function() {
  window.alert('hello');
});
