import '@testing-library/jest-dom'

// @ts-ignore this is just a mock for the tests
window.matchMedia = function () {
  return { matches: false }
}
