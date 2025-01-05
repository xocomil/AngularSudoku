export const pipeFunctions =
  (...fns: ((x: any) => any)[]) =>
  (x: any) =>
    fns.reduce((v, f) => f(v), x);
