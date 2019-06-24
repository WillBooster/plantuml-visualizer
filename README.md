# PlantUML Visualizer

[![wercker status](https://app.wercker.com/status/a6c8380156a0f46acd284e60c6d689d1/m/master 'wercker status')](https://app.wercker.com/project/byKey/a6c8380156a0f46acd284e60c6d689d1)
[![CircleCI](https://circleci.com/gh/WillBooster/plantuml-visualizer.svg?style=svg&circle-token=79199228c723770d4b343c6be8cfa1d915e34a0e)](https://circleci.com/gh/WillBooster/plantuml-visualizer)

:factory: A Chrome / Firefox exntesion for visualizing PlantUML code.

## Release Pages

- Chrome: https://chrome.google.com/webstore/detail/plantuml-visualizer/ffaloebcmkogfdkemcekamlmfkkmgkcf
- Firefox: https://addons.mozilla.org/firefox/addon/plantuml-visualizer/

## Supported Pages

- GitHub
  - Issues
  - Pull requests
  - Code blocks in README or something
- Any .pu / .puml / .plantuml files

## Development Preparation

1. `yarn` to install the latest dependencies
1. `yarn build`
1. Open Chrome browser
1. Open [chrome://extensions](chrome://extensions)
1. Enable `Developer Mode`
1. Click `Load Unpacked` and open `dist` directory (`plantuml-visualizer/dist`)

![Screenshot](screen.png)

## Development

1. `yarn` to install the latest dependencies
1. `yarn watch`
1. Open Chrome
1. Rewrite some code files
1. Close and Reopen Chrome browser (not only tabs)
   - or reload this extension in [chrome://extensions](chrome://extensions) and reload pages
1. Debug code
1. Go to `step 4`

## Deployment for Chrome

1. Bump version in `manifest.json` and `package.json`
1. `yarn package`
1. Open https://chrome.google.com/webstore/developer/dashboard
1. Upload `dist.zip`

## Deployment for Firefox

1. Download `.crx` file via https://chrome-extension-downloader.com/
1. Open https://addons.mozilla.org/en-US/developers/addon/plantuml-visualizer/edit
1. Upload `.crx` file
