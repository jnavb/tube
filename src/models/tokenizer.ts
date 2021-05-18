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
    | 'DefaultSwitchCase'
    | 'Union'
    | 'Variable'
    | 'NewLine'
    | 'EmptyLine'
    | 'Variadic'
    | 'Flip'
    | 'Wrap'
    | 'Defer';
  value?: string;
  level?: number;
  case?: string;
};
