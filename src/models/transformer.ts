import { Node, NodeType } from './parser';
export interface TransformedAST {
  type: 'Program';
  curriedFns: CurryStatement[];
  pipeExpressions: Node[];
  pipeInvocations: Node[];
}

export interface CurryStatement extends Node {
  type: 'CurryStatement';
  value: string;
}

export type Visitor = Partial<Record<NodeType, ITraverse>>;

interface ITraverse {
  enter?(node: Node, parent: Node): void;
  exit?(node: Node, parent: Node): void;
}
