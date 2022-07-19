// Operator based on article https://netbasal.com/creating-custom-operators-in-rxjs-32f052d69457

import { tap } from 'rxjs';

const nextBackgroundColors = [
  '009900',
  '006600',
  '336600',
  '669900',
  '009933',
  '99cc00',
  '00cc66',
];
const errorBackgroundColors = [
  'E91E63',
  'cc3300',
  'cc6600',
  'ff9900',
  'ff3300',
  'ff0000',
  'cc0000',
];
const completeBackgroundColors = [
  '000099',
  '003399',
  '0000cc',
  '0033cc',
  '0000ff',
  '3333ff',
  '333399',
];

const randomColor = (colors: string[]): string => {
  const randomIndex = Math.floor(Math.random() * (colors.length - 1));

  return colors[randomIndex];
};

export const logObservable = <T>(tag: string) => {
  const backgroundColor = randomColor(nextBackgroundColors);
  const errorBackgroundColor = randomColor(errorBackgroundColors);
  const completeBackgroundColor = randomColor(completeBackgroundColors);

  const messageKey = (Math.floor(Math.random() * 10000) + Date.now()).toString(
    36
  );

  return tap<T>({
    next(value) {
      console.log(
        `%c[${tag} [${messageKey}]: Next]`,
        `background: #${backgroundColor}; color: #fff; padding: 3px; font-size: 9px;`,
        value
      );
    },
    error(error) {
      console.log(
        `%c[${tag} [${messageKey}]: Error]`,
        `background: #${errorBackgroundColor}; color: #fff; padding: 3px; font-size: 9px;`,
        error
      );
    },
    complete() {
      console.log(
        `%c[${tag}  [${messageKey}]]: Complete`,
        `background: #${completeBackgroundColor}; color: #fff; padding: 3px; font-size: 9px;`
      );
    },
  });
};
