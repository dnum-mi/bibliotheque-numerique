export const loggerServiceMock = {
  setContext: () => {},
  verbose: () => {},
  debug: () => {},
  log: () => {},
  warn: () => {},
  error: (e) => {
    console.log(e)
  },
}
