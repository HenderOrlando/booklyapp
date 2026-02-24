/**
 * Custom jest-environment-jsdom that mocks the native `canvas` module
 * before jsdom tries to load it. This prevents the "Cannot find module
 * '../build/Release/canvas.node'" error on Windows/CI without native
 * build tools.
 */
const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (id === "canvas") {
    return {};
  }
  return originalRequire.apply(this, arguments);
};

const JsdomEnvironment = require("jest-environment-jsdom");

module.exports = JsdomEnvironment;
