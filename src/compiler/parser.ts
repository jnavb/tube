import {
  AST,
  DisableAutoCurrying,
  FlipArguments,
  FunctionStatement,
  Method,
  Node,
  NumberLiteral,
  PipeInvocation,
  PipeStatement,
  StringLiteral,
  SwitchCase,
  SwitchStatement,
  Token,
  UnionStatement,
  Variable
} from '../models';

export const parser = (tokens: Token[]): AST => {
  let current = 0;
  let currentLevel = 0;
  let nodeByLevel: FunctionStatement[] = [];
  let insidePipeInvocation = false;
  let insidePipeStatement = false;
  let insideSwitch = false;
  let insideUnion = false;

  const ast: AST = {
    type: 'Program',
    children: [],
  };

  while (current < tokens.length) {
    const child = walk();
    child && ast.children.push(child);
  }

  return ast;

  function walk(): Node {
    let token = tokens[current];
    let negated = false;
    let defer = false;
    let wrap = false;

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

      const unionNode: UnionStatement = {
        type: 'UnionStatement',
        children: [],
      };

      insideUnion = true;
      current++;
      let unionLevel = currentLevel;

      while (
        token?.type !== 'EmptyLine' &&
        !(token?.type === 'NewLine' && token?.level !== unionLevel)
      ) {
        const node = walk();
        node && unionNode.children.push(node as FunctionStatement);
        token = tokens[current];
      }

      insideUnion = false;

      return unionNode;
    }

    if (token.type === 'SwitchCase' || token.type === 'DefaultSwitchCase') {
      const switchCase: SwitchCase = {
        type: token.type,
        predicate: token.case,
        value: token.value,
      };

      current++;

      if (insideSwitch) {
        return switchCase;
      }

      let switchStatement: SwitchStatement = {
        type: 'SwitchStatement',
        cases: [],
      };

      if (token.type === 'SwitchCase') {
        switchStatement.cases.push(switchCase);
      } else if (token.type === 'DefaultSwitchCase') {
        switchStatement.default = switchCase;
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
          switchStatement.cases.push(switchCase);
        } else if (type === 'DefaultSwitchCase') {
          switchStatement.default = switchCase;
        }

        token = tokens[current];
      }

      insideSwitch = false;

      return switchStatement;
    }

    if (token.type === 'Negation') {
      negated = true;
      token = tokens[++current];
    }

    if (token.type === 'Wrap') {
      wrap = true;
      token = tokens[++current];
    }

    if (token.type === 'Defer') {
      defer = true;
      token = tokens[++current];
    }

    if (token.type === 'Arrow') {
      token = tokens[++current];

      if (token.type !== 'Function') {
        throw new SyntaxError('Invalid PipeStatement format');
      }

      let pipeStatement: PipeStatement = {
        type: 'PipeStatement',
        value: token.value,
        children: [],
      };

      insidePipeStatement = true;
      current++;

      while (token && token.type !== 'EmptyLine') {
        const child = walk();
        child && pipeStatement.children.push(child);
        token = tokens[current];
      }

      insidePipeStatement = false;

      return pipeStatement;
    }

    if (token.type === 'Function') {
      let fnNode: FunctionStatement = {
        type: 'Function',
        value: token.value,
        args: [],
        ...(negated && { negated }),
        ...(defer && { defer }),
        ...(wrap && { wrap }),
      };

      negated = false;
      defer = false;
      wrap = false;

      token = tokens[++current];

      while (token && token.type !== 'NewLine' && token.type !== 'EmptyLine') {
        const functionSubNode = walk() as
          | NumberLiteral
          | StringLiteral
          | Variable
          | DisableAutoCurrying
          | FlipArguments;

        const { disableAutoCurrying, flipArguments, wrap }: any = fnNode;
        const moreThanOneFlagActivated =
          disableAutoCurrying + flipArguments + wrap > 1;
        if (moreThanOneFlagActivated) {
          throw new SyntaxError(
            'Function with several special modifiers not supported',
          );
        }

        if (functionSubNode.type === 'DisableAutoCurrying') {
          fnNode.disableAutoCurrying = true;
        } else if (functionSubNode.type === 'FlipArguments') {
          fnNode.flipArguments = true;
        } else {
          functionSubNode && fnNode.args.push(functionSubNode);
        }
        token = tokens[current];
      }

      if (!fnNode.args.length) {
        delete fnNode.args;
      }

      /*
        Is an if/else block if indentation is greater than initial indendation:
        1 for pipeStatements due initial indendation
        1 for unionStatements due initial indendation
        0 for pipeInvocations
      */
      nodeByLevel[currentLevel] = fnNode;
      const baseLevel = insidePipeStatement || insideUnion ? 1 : 0;
      if (currentLevel > baseLevel) {
        let parentLevel = currentLevel - 1;

        if (!nodeByLevel[parentLevel].if) {
          nodeByLevel[parentLevel].if = fnNode;
        } else {
          nodeByLevel[parentLevel].else = fnNode;
        }

        return null;
      }

      if (insidePipeInvocation || insidePipeStatement) {
        return fnNode;
      }

      let pipe: PipeInvocation = {
        type: 'PipeInvocation',
        children: [fnNode],
      };

      insidePipeInvocation = true;

      while (token && token.type !== 'EmptyLine') {
        const child = walk();
        child && pipe.children.push(child);
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

    if (token.type === 'Variadic') {
      current++;

      return {
        type: 'DisableAutoCurrying',
      };
    }

    if (token.type === 'Flip') {
      current++;

      return {
        type: 'FlipArguments',
      };
    }

    if (token.type === 'Defer') {
      current++;

      return {
        type: 'Defer',
      };
    }

    throw new SyntaxError(token.type + ' token type not supported');
  }
};
