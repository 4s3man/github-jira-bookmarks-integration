#Installation
- Download
- Open GoogleChrome and go to [chrome://extensions/](chrome://extensions/)
- Set developer mode on, in to right corner
- Click "Load unpacked"
- Choose dist folder, from downloaded extension



## Core doc below
### TypeScript / React / Webpack / Chrome Extension Boilerplate

You can use this boilerplate code to start developing a Chrome extension using [TypeScript](https://www.typescriptlang.org/)/JS, [React](https://reactjs.org/) for the frontend, and [Webpack](https://webpack.js.org/) as the build system.

At Duo Labs, we found ourselves creating Chrome extensions with this stack frequently enough that we thought it would be nice to have a consistent starting point. Getting all the individual pieces configured from scratch can be a pain.

## Get started

Clone this repository, and then, in this directory:

1. `npm install`
2. `npx webpack`

Your unpacked Chrome extension will be compiled into `dist/`. You can load it into Chrome by enabling developer mode on the "Extensions" page, hitting "Load unpacked", and selecting the `dist/` folder. You can pack the extension into a `.crx` by using the "Pack extension" button on the same page.

Use `npx webpack` to recompile after editing.

## Source layout

The default source layout looks like this:

```
src
├── app
│   ├── background.ts
│   └── content.ts
├── styles
│   └── popup.css
└── ui
    └── popup.tsx
```

* `background.ts` will get loaded as the extension background script, and will run persistently in the background
* `content.ts` will be injected into the URLs matched by `dist/manifest.json`'s `matches` entry (see [Match Patterns](https://developer.chrome.com/extensions/match_patterns) documentation)
* `popup.tsx` will become the extension's "browser action" popup
    * NOTE: `popup.tsx` compiles into `dist/js/popup.js`. It is loaded into `dist/popup.html` by an explicit `<script>` tag on that page. `dist/popup.html` is static and is not automatically generated by the build process.
* `popup.css` contains styles for the popup. These styles are loaded with `style-loader` via the `import` line at the top of `popup.tsx` (and directly injected into the popup via JavaScript)

## Dist layout

```
dist
├── _locales
│   └── en
│       └── messages.json
├── icons
│   ├── icon128.png
│   ├── icon16.png
│   ├── icon19.png
│   └── icon48.png
├── js
│   ├── background.js
│   ├── content.js
│   └── popup.js
├── manifest.json
└── popup.html
```

`dist` contains the Chrome extension. You can delete `js/*`, as its contents will be regenerated by `webpack`, but the rest of the contents of `dist` will not.

## Why these choices?

We wanted a boilerplate from which we could be productive immediately, without including components we wouldn't immediately need.

* TypeScript: We chose TypeScript because it grants us the safety of a type system while still being accessible to developers who are only familiar with JavaScript. TypeScript is a typed superset of JavaScript, so all valid JavaScript is also valid TypeScript. You can use TypeScript's extra functionality only when you want to.
* React: Writing UI state transitions can be buggy and tedious. We like that React allows us to declaratively describe our UI without being overly bulky.
* Webpack: Webpack allows us to define a build pipeline that can be easily extended in the future.

## Acknowledgments

This work is inspired by [Extensionizr](https://github.com/altryne/extensionizr/), and the icons in `dist/icons` remain under the Extensionizr license.
