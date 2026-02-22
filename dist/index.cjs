"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API: () => API,
  Result: () => Result
});
module.exports = __toCommonJS(index_exports);
var import_ky = require("ky");
var import_ky2 = __toESM(require("ky"), 1);
var Result = /* @__PURE__ */ ((Result2) => {
  Result2[Result2["Error"] = 0] = "Error";
  Result2[Result2["Success"] = 1] = "Success";
  Result2[Result2["Unmodified"] = 2] = "Unmodified";
  Result2[Result2["Modified"] = 3] = "Modified";
  Result2[Result2["Added"] = 4] = "Added";
  Result2[Result2["Deleted"] = 5] = "Deleted";
  return Result2;
})(Result || {});
var API = class {
  api;
  clientId;
  accessToken;
  refreshToken;
  refreshExpiresIn;
  Result = 1 /* Success */;
  Errors = null;
  // ----------------------------------------------------------------
  constructor(url, clientId, accessToken, refreshToken, refreshExpiresIn) {
    this.clientId = clientId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.refreshExpiresIn = refreshExpiresIn;
    this.api = import_ky2.default.create({
      prefixUrl: url,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en",
        "Content-Language": "en",
        "SimplerDM-ClientId": clientId ?? ""
      }
    });
  }
  // ----------------------------------------------------------------
  JSONParse = (text) => text ? JSON.parse(
    text,
    (key, value) => key.endsWith("Id") ? BigInt(value) : value
  ) : null;
  // ----------------------------------------------------------------
  get = async (endPoint, options = {}) => await this.call(endPoint, options, "GET");
  // ----------------------------------------------------------------
  post = async (endPoint, options = {}) => await this.call(endPoint, options, "POST");
  // ----------------------------------------------------------------
  async call(endPoint, options, method) {
    let results;
    let response = null;
    try {
      results = await this.api(endPoint, { ...{ method }, ...options });
      if (results.ok === true) {
        response = this.JSONParse(await results.text());
        this.Result = response.Result;
        this.Errors = response.Errors;
        if (!response.Errors || response.Errors.length === 0) {
          return response;
        }
      }
    } catch (error) {
      this.Result = 0 /* Error */;
      switch (true) {
        case error instanceof import_ky.TimeoutError: {
          this.Errors = [{ Id: -1n, Code: error.name, Description: error.message }];
          break;
        }
        case error instanceof Error: {
          this.Errors = [{ Id: -1n, Code: "Unknown", Description: error.message }];
          break;
        }
        default: {
          const errorHttp = error.response;
          const errorJSON = this.JSONParse(await errorHttp.text());
          this.Errors = errorJSON && errorJSON.Errors ? errorJSON.Errors : [{ Id: BigInt(errorHttp.status), Code: "Exception", Description: errorHttp.statusText }];
        }
      }
    }
    return response;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API,
  Result
});
