export const focusStateValues = [
  'row',
  'col',
  'self',
  'region',
  'region-col',
  'region-row',
  '',
] as const;

export type FocusStates = typeof focusStateValues[number];
