# PlantUML Visualizer

[![Test](https://github.com/WillBooster/plantuml-visualizer/actions/workflows/test.yml/badge.svg)](https://github.com/WillBooster/plantuml-visualizer/actions/workflows/test.yml)
[![Release](https://github.com/WillBooster/plantuml-visualizer/actions/workflows/release.yml/badge.svg)](https://github.com/WillBooster/plantuml-visualizer/actions/workflows/release.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

:factory: A Chrome / Firefox extension for visualizing PlantUML descriptions.

## Release Pages

- Chrome: https://chrome.google.com/webstore/detail/plantuml-visualizer/ffaloebcmkogfdkemcekamlmfkkmgkcf
- Firefox: https://addons.mozilla.org/firefox/addon/plantuml-visualizer/

## Visualizable Pages

### GitHub

- File Viewer
  - https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/class.pu
  - `!include` directive: https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/including.pu
  - `!includesub` directive: https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/subincluding.pu
- Issues: https://github.com/WillBooster/plantuml-visualizer/issues/54
- Pull Requests
  - Added: https://github.com/WillBooster/plantuml-visualizer/pull/49/files
  - Deleted: https://github.com/WillBooster/plantuml-visualizer/pull/50/files
  - Changed: https://github.com/WillBooster/plantuml-visualizer/pull/24/files
  - `!include` directive: https://github.com/WillBooster/plantuml-visualizer/pull/423/files
- Code blocks in README or something
  - README.md: https://github.com/WillBooster/plantuml-visualizer/blob/master/puml-sample/README.md

### GitLab

- Any page containing `<pre>` tag with prefix `@startuml` and suffix `@enduml`

(We will list GitLab pages with testing urls later)

### .pu / .puml / .plantuml / .wsd files

- GitHub Raw Files (only Chrome)
  - https://raw.githubusercontent.com/WillBooster/plantuml-visualizer/master/puml-sample/class.pu
  - `!include` directive: https://raw.githubusercontent.com/WillBooster/plantuml-visualizer/master/puml-sample/including.pu
  - `!includesub` directive: https://raw.githubusercontent.com/WillBooster/plantuml-visualizer/master/puml-sample/subincluding.pu
  - IMPORTANT NOTE: any extension on Firefox cannot work on GitHub Raw Files due to https://bugzilla.mozilla.org/show_bug.cgi?id=1411641
- Local Files
  - file:///C:/Users/XXX/Projects/plantuml-visualizer/puml-sample/class.pu
  - `!include` directive for local files will NOT be supported because of security problems
  - Please use another software for rich rendering of local files (e.g. the official PlantUML renderer: https://plantuml.com/en/starting)
  - IMPORTANT NOTE: if you use Google Chrome, you need to allow this extension to access file URLs
    1. Open chrome://extensions/?id=ffaloebcmkogfdkemcekamlmfkkmgkcf in Chrome
    2. Enable "Allow access to file URLs"
       ![marked-settings](allow-access.png)

### Improve Default Allow/Deny Lists

The default lists are defined at https://github.com/WillBooster/plantuml-visualizer/blob/main/src/constants.ts
Please help us to improve the default lists for enabling/disabling visualization on specific web pages!

## Visualization Examples

The visualization result of https://github.com/WillBooster/plantuml-visualizer/pull/24/files is as follows.

![Example](example.png)

## Default Visualization Server

The default server is https://plantuml-service-willbooster.fly.dev
([source code](https://github.com/WillBooster/plantuml-service)).
You may check the PlantUML version via [this link](https://plantuml-service-willbooster.fly.dev/version).

You may use another **HTTPS** PlantUML server by changing settings in the configuration window.

## Requirements for Development

- [Node.js](https://nodejs.org/)
  - We define a recommended version on https://github.com/WillBooster/plantuml-visualizer/blob/main/.node-version
- [Yarn v1](https://classic.yarnpkg.com/)

## Development Preparation

1. `yarn` to install the latest dependencies
2. `yarn build`
3. Open Chrome browser
4. Open [chrome://extensions](chrome://extensions)
5. Enable `Developer Mode`
6. Click `Load Unpacked` and open `dist` directory (`plantuml-visualizer/dist`)
   - `Load Unpacked` is `パッケージ化されていない拡張機能を読み込む` in Japanese

## Development

1. `yarn` to install the latest dependencies
2. `yarn start`
3. Open Chrome
4. Rewrite some code files
5. Close and Reopen Chrome browser (not only tabs)
   - or reload this extension in [chrome://extensions](chrome://extensions) and reload pages
6. Debug code
7. Go to `step 4`

## Deployment for Chrome

1. Bump version in `manifest.json` and `package.json`
2. `yarn package`
3. Open https://chrome.google.com/webstore/developer/dashboard
4. Upload `dist.zip`

## Deployment for Firefox

1. Bump version in `manifest.json` and `package.json`
2. `yarn package`
3. Open https://addons.mozilla.org/en-US/developers/addon/plantuml-visualizer/edit
4. Upload `dist.zip` file
