window.onload = () => {
  const startButtonElement = document.querySelector('.start');
  startButtonElement!.addEventListener('click', () => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      tabs => {
        if (tabs[0].id !== undefined) {
          chrome.tabs.sendMessage(tabs[0].id, { hello: true }, () => window.close());
        }
      }
    );
  });
};
