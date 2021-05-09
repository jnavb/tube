# TUBE
[![TypeScript version][ts-badge]][typescript-4-2]
[![Build Status - Travis][travis-badge]][travis-ci]
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/c29a6e18767e41ed8d47c5d295305afd)](https://www.codacy.com/gh/jnavb/TUBE/dashboard?utm_source=github.com&utm_medium=referral&utm_content=jnavb/TUBE&utm_campaign=Badge_Coverage)
![Latest version](https://img.shields.io/github/v/release/jnavb/TUBE)




Tube is a declarative, auto-curried, completely unneeded, functional language that compiles into Javascript.

## Motivation

After reading the amazing [super tiny compiler](https://github.com/jamiebuilds/the-super-tiny-compiler) repository I became more interested about compilers. The idea of build one yourself for a made up language kept growing and this is the result.

It is a subset of Javascript, you still need some JS code in order to work.

## Installation


```shell
$ npm i -g npm
$ npm i lodash
```

## Usage

```js
const __tube_lang__ = require('tube-lang')

const jsCode = a.compile(tubeCode)

eval(jsCode)
```

## Roadmap

### April 2021

:white_check_mark:  Compiler

:white_check_mark:  Test coverage 100%

### May 2021

:white_check_mark:  NPM package

:black_square_button:  Web Editor 


[ts-badge]: https://img.shields.io/badge/TypeScript-4.2-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2014.16-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v14.x/docs/api/
[travis-badge]: https://travis-ci.org/jsynowiec/node-typescript-boilerplate.svg?branch=main
[travis-ci]: https://travis-ci.org/jsynowiec/node-typescript-boilerplate
[gha-ci]: https://github.com/jsynowiec/node-typescript-boilerplate/actions
[typescript]: https://www.typescriptlang.org/
[typescript-4-2]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-2.html
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/jsynowiec/node-typescript-boilerplate/blob/main/LICENSE
[sponsor-badge]: https://img.shields.io/badge/♥-Sponsor-fc0fb5.svg
[sponsor]: https://github.com/sponsors/jsynowiec
[jest]: https://facebook.github.io/jest/
[eslint]: https://github.com/eslint/eslint
[wiki-js-tests]: https://github.com/jsynowiec/node-typescript-boilerplate/wiki/Unit-tests-in-plain-JavaScript
[prettier]: https://prettier.io
[volta]: https://volta.sh
[volta-getting-started]: https://docs.volta.sh/guide/getting-started
[volta-tomdale]: https://twitter.com/tomdale/status/1162017336699838467?s=20
[gh-actions]: https://github.com/features/actions
[travis]: https://travis-ci.org
[repo-template-action]: https://github.com/jsynowiec/node-typescript-boilerplate/generator
