import { compile } from './compiler/compile';
import { curry } from './runtime/curry';
import { flip } from './runtime/flip';
import { negate } from './runtime/negate';
import { pipe } from './runtime/pipe';
import { sideEffect } from './runtime/side-effect';
import { union } from './runtime/union';

export { compile, curry, negate, pipe, sideEffect, union, flip };
