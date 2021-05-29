# ![Latest version](https://img.shields.io/npm/v/tube-lang) [![TypeScript version][ts-badge]][typescript-4-2] [![Build Status - Travis][travis-badge]][travis-ci] [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/c29a6e18767e41ed8d47c5d295305afd)](https://www.codacy.com/gh/jnavb/TUBE/dashboard?utm_source=github.com&utm_medium=referral&utm_content=jnavb/TUBE&utm_campaign=Badge_Coverage)


<p align="center">
  <img src="assets/logo.png" alt="tube-logo" width="120px" height="120px"/>
  <br>
  <br>
Tube is a declarative, completely unneeded, functionalish language that transpiles into Javascript.
  <br>
  <br>
</p>



## Motivation

After reading the amazing [super tiny compiler](https://github.com/jamiebuilds/the-super-tiny-compiler) repository I became more interested about compilers. The idea of build one yourself kept growing and this is the result.

 Note: Tube is a subset of Javascript, you still need some JS code in order to work.

## Documentation

You can learn the fundamentals and see some examples on the [documentation website](https://tube-lang.netlify.app/)

## Online editor

Compile and run your tube code on the online [playground](https://tube-lang.netlify.app/playground)
## Installation


```shell
$ npm i tube-lang
```

## Usage

```js
const __tube_lang__ = require('tube-lang')
const { compile } = __tube_lang__

const greet = str => 'Hello' + str + '!'
const tubeCode = `greet to 'World'`

const compiledTubeCode = compile(tubeCode)

eval(compiledTubeCode) // Hello World!
```

## Roadmap

### April 2021

:white_check_mark:  Compiler

:white_check_mark:  Test coverage 100%

### May 2021

:white_check_mark:  NPM package

:white_check_mark:  Web Editor 

### TBD
:black_square_button: Right Left for handling errors

:black_square_button: Switch clauses with arguments

:black_square_button: Async support via keywords

:black_square_button: Comments


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
