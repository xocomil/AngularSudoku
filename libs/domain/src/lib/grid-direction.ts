export const GridDirection = Object.freeze({
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
  Tab: 'tab',
  Escape: 'escape',
});

export type GridDirection = typeof GridDirection[keyof typeof GridDirection];

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

export const gridDirectionFromKeyboard = (keyboardDirection: string): GridDirection => {
  const direction = directionMap.get(keyboardDirection.toLowerCase());

  if (!direction) {
    throw new Error('Unknown direction');
  }

  return direction;
};
