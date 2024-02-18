export const GridDirection = Object.freeze({
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
  Tab: 'tab',
  Escape: 'escape',
} as const);

export type GridDirection = (typeof GridDirection)[keyof typeof GridDirection];
export type NavigationDirections = Extract<
  GridDirection,
  'up' | 'down' | 'left' | 'right'
>;

export const directionModifierValues: Record<
  NavigationDirections,
  { row: number; col: number }
> = Object.freeze({
  [GridDirection.Up]: { row: -1, col: 0 },
  [GridDirection.Down]: { row: 1, col: 0 },
  [GridDirection.Left]: { row: 0, col: -1 },
  [GridDirection.Right]: { row: 0, col: 1 },
} as const);

export function isNavigationDirection(
  direction: GridDirection,
): direction is NavigationDirections {
  return ['up', 'down', 'left', 'right'].includes(direction);
}

export const directionMap = new Map<string, GridDirection>([
  ['w', GridDirection.Up],
  ['a', GridDirection.Left],
  ['s', GridDirection.Down],
  ['d', GridDirection.Right],
  ['arrowup', GridDirection.Up],
  ['arrowdown', GridDirection.Down],
  ['arrowleft', GridDirection.Left],
  ['arrowright', GridDirection.Right],
  ['tab', GridDirection.Tab],
  ['escape', GridDirection.Escape],
]);

export const gridDirectionFromKeyboard = (
  keyboardDirection: string,
): GridDirection => {
  const direction = directionMap.get(keyboardDirection.toLowerCase());

  if (!direction) {
    throw new Error('Unknown direction');
  }

  return direction;
};
