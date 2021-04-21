import { Node, NodeType } from './parser';
export interface TransformedAST {
  type: 'Program';
  curriedFns: CurryExpression[];
  pipeExpressions: Node[];
  pipeInvocations: Node[];
}

export interface CurryExpression extends Node {
  type: 'CurryExpression';
  value: string;
}

export type Visitor = Partial<Record<NodeType, ITraverse>>;

interface ITraverse {
  enter?(node: Node, parent: Node): void;
  exit?(node: Node, parent: Node): void;
}
