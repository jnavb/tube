export type NodeType =
  | 'Program'
  | 'PipeExpression'
  | 'PipeInvocation'
  | 'String'
  | 'Number'
  | 'Variable'
  | 'Method'
  | 'Function'
  | 'CurryExpression'
  | 'UnionExpression'
  | 'SwitchExpression'
  | 'SwitchCase'
  | 'DefaultSwitchCase'
  | 'SideEffect';
export interface Node {
  type: NodeType;
  value?: string;
  childs?: Node[];
  args?: (NumberLiteral | StringLiteral | Variable)[];
  negated?: boolean;
  if?: FunctionExpression;
  else?: FunctionExpression;
  cases?: SwitchCase[];
  default?: SwitchCase;
  case?: string;
}

export interface AST extends Node {
  type: 'Program';
  childs: Node[];
}

export interface PipeExpression extends Node {
  type: 'PipeExpression';
  value: string;
  childs: Node[];
}
export interface PipeInvocation extends Node {
  type: 'PipeInvocation';
  childs: Node[];
}

export interface FunctionExpression extends Node {
  type: 'Function';
  value: string;
  args?: (NumberLiteral | StringLiteral | Variable)[];
  negated?: boolean;
  if?: FunctionExpression;
  else?: FunctionExpression;
}

export interface UnionExpression extends Node {
  type: 'UnionExpression';
  childs: FunctionExpression[];
}

export interface Method extends Node {
  type: 'Method';
  value: string;
  args?: (NumberLiteral | StringLiteral | Variable)[];
}

export interface SideEffect extends Node {
  type: 'SideEffect';
  value: string;
}
export interface NumberLiteral extends Node {
  type: 'Number';
  value: string;
}

export interface Variable extends Node {
  type: 'Variable';
  value: string;
}

export interface StringLiteral extends Node {
  type: 'String';
  value: string;
}

export interface SwitchExpression extends Node {
  type: 'SwitchExpression';
  cases: SwitchCase[];
  default?: SwitchCase;
}

export interface SwitchCase extends Node {
  type: 'SwitchCase' | 'DefaultSwitchCase';
  case: string;
  value: string;
}
