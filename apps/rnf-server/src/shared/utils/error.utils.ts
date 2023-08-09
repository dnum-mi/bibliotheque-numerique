type ErrorMessagePredicate<T> = (arg: T) => string | null;
export const throwIf =
  <T>(...fns: ErrorMessagePredicate<T>[]) =>
    (x: T) => {
      for (const f of fns) {
        const error = f(x)
        if (error) {
          throw new Error(error)
        }
      }
    }
