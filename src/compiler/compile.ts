import { generator } from './generator';
import { parser } from './parser';
import { tokenizer } from './tokenizer';
import { transformer } from './transformer';

export const compile = (x: string): string =>
  generator(transformer(parser(tokenizer(x))));
