/* eslint-disable */
export const loggerServiceMock = {
  setContext: () => {},
  verbose: () => {},
  debug: () => {},
  log: () => {},
  warn: (e) => {
    console.log("\n\n====================== WARN ======================\n");
    console.log(e)
    console.log("\n====================== WARN ======================\n\n");
  },
  error: (e) => {
    console.log("\n\n====================== ERROR ======================\n");
    console.log(e)
    console.log("\n====================== ERROR ======================\n\n");
  },
};
