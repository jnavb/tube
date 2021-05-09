import {
  AST,
  FunctionExpression,
  Method,
  Node,
  NumberLiteral,
  PipeExpression,
  PipeInvocation,
  StringLiteral,
  SwitchCase,
  SwitchExpression,
  Token,
  Variable
} from '../models';

export const parser = (tokens: Token[]): AST => {
  let current = 0;
  let currentLevel = 0;
  let nodeByLevel: FunctionExpression[] = [];
  let insidePipeInvocation = false;
  let insidePipeExpression = false;
  let insideSwitch = false;
  let insideUnion = false;

  const ast: AST = {
    type: 'Program',
    childs: [],
  };

  while (current < tokens.length) {
    const child = walk();
    child && ast.childs.push(child);
  }

  return ast;

  function walk(): Node {
    let token = tokens[current];
    let negated = false;

    if (!token || token.type === 'EmptyLine') {
      currentLevel = 0;
      current++;
      return null;
    }

    if (!token || token.type === 'NewLine') {
      current++;
      currentLevel = token.level;
      return null;
    }

    if (token.type === 'Union') {
      if (insideUnion) {
        current++;
        return null;
      }

      const unionNode: any = {
        type: 'UnionExpression',
        childs: [],
      };

      insideUnion = true;
      current++;
      let unionLevel = currentLevel;

      while (unionLevel === currentLevel) {
        const node = walk();
        node && unionNode.childs.push(node);
      }

      insideUnion = false;

      return unionNode;
    }

    if (token.type === 'SwitchCase' || token.type === 'DefaultSwitchCase') {
      const switchCase: SwitchCase = {
        type: token.type,
        case: token.case,
        value: token.value,
      };

      current++;

      if (insideSwitch) {
        return switchCase;
      }

      let switchExpression: SwitchExpression = {
        type: 'SwitchExpression',
        cases: [],
      };

      if (token.type === 'SwitchCase') {
        switchExpression.cases.push(switchCase);
      } else if (token.type === 'DefaultSwitchCase') {
        switchExpression.default = switchCase;
      }

      insideSwitch = true;

      while (
        token?.type === 'SwitchCase' ||
        token?.type === 'DefaultSwitchCase' ||
        token?.type === 'NewLine'
      ) {
        const switchCase = walk() as SwitchCase;
        const type = switchCase?.type;

        if (type === 'SwitchCase') {
          switchExpression.cases.push(switchCase);
        } else if (type === 'DefaultSwitchCase') {
          switchExpression.default = switchCase;
        }

        token = tokens[current];
      }

      insideSwitch = false;

      return switchExpression;
    }

    if (token.type === 'Negation') {
      negated = true;
      token = tokens[++current];
    }

    if (token.type === 'Arrow') {
      token = tokens[++current];

      if (token.type !== 'Function') {
        throw new Error('Invalid PipeExpression format');
      }

      let pipeExpression: PipeExpression = {
        type: 'PipeExpression',
        value: token.value,
        childs: [],
      };

      insidePipeExpression = true;
      current++;

      while (token && token.type !== 'EmptyLine') {
        const child = walk();
        child && pipeExpression.childs.push(child);
        token = tokens[current];
      }

      insidePipeExpression = false;

      return pipeExpression;
    }

    if (token.type === 'Function') {
      let fnNode: FunctionExpression = {
        type: 'Function',
        value: token.value,
        args: [],
        ...(negated && { negated }),
      };

      negated = false;

      token = tokens[++current];

      while (token && token.type !== 'NewLine' && token.type !== 'EmptyLine') {
        const args = walk() as NumberLiteral | StringLiteral | Variable;
        args && fnNode.args.push(args);
        token = tokens[current];
      }

      if (!fnNode.args.length) {
        delete fnNode.args;
      }

      /*
        Is an if/else block if indentation is greater than initial indendation:
        1 for pipeExpressions due initial indendation
        1 for unionExpressions due initial indendation
        0 for pipeInvocations
      */
      nodeByLevel[currentLevel] = fnNode;
      const baseLevel = insidePipeExpression || insideUnion ? 1 : 0;
      if (currentLevel > baseLevel) {
        let parentLevel = currentLevel - 1;

        if (!nodeByLevel[parentLevel].if) {
          nodeByLevel[parentLevel].if = fnNode;
        } else {
          nodeByLevel[parentLevel].else = fnNode;
        }

        return null;
      }

      if (insidePipeInvocation || insidePipeExpression) {
        return fnNode;
      }

      let pipe: PipeInvocation = {
        type: 'PipeInvocation',
        childs: [fnNode],
      };

      insidePipeInvocation = true;

      while (token && token.type !== 'EmptyLine') {
        const child = walk();
        child && pipe.childs.push(child);
        token = tokens[current];
      }

      insidePipeInvocation = false;

      current++;

      return pipe;
    }

    if (
      token.type === 'String' ||
      token.type === 'Number' ||
      token.type === 'Variable'
    ) {
      current++;

      return {
        type: token.type,
        value: token.value,
      };
    }

    if (token.type === 'Method') {
      let methodNode: Method = {
        type: 'Method',
        value: token.value,
        args: [],
      };

      token = tokens[++current];

      while (token && token.type !== 'NewLine' && token.type !== 'EmptyLine') {
        const args = walk() as NumberLiteral | StringLiteral | Variable;
        args && methodNode.args.push(args);
        token = tokens[current];
      }

      if (!methodNode.args.length) {
        delete methodNode.args;
      }

      return methodNode;
    }

    if (token.type === 'SideEffect') {
      current++;

      return {
        type: 'SideEffect',
        ...(token.value && { value: token.value }),
      };
    }

    throw new SyntaxError(token.type + ' token type not supported');
  }
};
