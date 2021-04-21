export type Token = {
  type:
    | 'Function'
    | 'Method'
    | 'Number'
    | 'String'
    | 'Argument'
    | 'Negation'
    | 'Arrow'
    | 'SideEffect'
    | 'SwitchCase'
    | 'Union'
    | 'Variable'
    | 'NewLine'
    | 'EmptyLine';
  value?: string;
  level?: number;
  case?: string;
};
