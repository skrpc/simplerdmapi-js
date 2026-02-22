// src/index.ts
import { TimeoutError } from "ky";
import ky from "ky";
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
    this.api = ky.create({
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
        case error instanceof TimeoutError: {
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
export {
  API,
  Result
};
