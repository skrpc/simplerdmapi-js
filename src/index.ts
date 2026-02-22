
import { type KyInstance, type KyResponse, type HTTPError, TimeoutError } from 'ky';
import ky from 'ky';

// ----------------------------------------------------------------

export enum Result {
  Error      = 0,
  Success    = 1,
  Unmodified = 2,
  Modified   = 3,
  Added      = 4,
  Deleted    = 5
}

// ----------------------------------------------------------------

export interface SystemError {
  Id:          bigint,
  Code:        string,
  Description: string
}

// ----------------------------------------------------------------

export interface Response {
  Result: Result,
  Errors: SystemError[] | null
}

// ----------------------------------------------------------------

export class API {

  private api: KyInstance;
  private clientId:         string
  private accessToken:      string;
  private refreshToken:     string;
  private refreshExpiresIn: number;

  public Result: Result = Result.Success;
  
  public Errors: SystemError[] | null = null;

  // ----------------------------------------------------------------
  
  constructor (url: string, clientId: string, accessToken: string, refreshToken: string, refreshExpiresIn: number ) {
    this.clientId         = clientId;
    this.accessToken      = accessToken;
    this.refreshToken     = refreshToken;
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

  private JSONParse = (text: string): object | null =>
    text 
      ? JSON.parse(
          text,
          (key, value) => 
            key.endsWith("Id") // && typeof value === 'number' && value > Number.MAX_SAFE_INTEGER //
              ? BigInt(value)
              : value 
        )
      : null;

  // ----------------------------------------------------------------
  
  public get  = async <TResponse extends Response>(
    endPoint: string, 
    options:  RequestInit = {}

  ) : Promise<TResponse | null> => 
    await this.call<TResponse>(endPoint, options, "GET");
  
  // ----------------------------------------------------------------
  
  public post = async <TResponse extends Response>(
    endPoint: string, 
    options:  RequestInit = {}

  ) : Promise<TResponse | null> => 
    await this.call<TResponse>(endPoint, options, "POST");

  // ----------------------------------------------------------------
  
  public async call<TResponse extends Response>(
    endPoint: string, 
    options:  RequestInit, 
    method:   string

  ): Promise<TResponse | null> {
    
    let results:  KyResponse;
    let response: TResponse | null = null;

    try {
      results = await this.api(endPoint, {... { method: method }, ... options});

      if (results.ok === true) {
        response = this.JSONParse(await results.text()) as TResponse;

        this.Result = response.Result;
        this.Errors = response.Errors;

        if (!response.Errors || response.Errors.length === 0) {
          return response;
        }
      }
    }
    catch(error) {
      this.Result = Result.Error;
      
      switch (true) {
        case (error instanceof TimeoutError): {
          this.Errors = [{Id: -1n, Code: error.name,  Description: error.message}];
          break;
        }
      
        case (error instanceof Error): {
          this.Errors = [{Id: -1n, Code: "Unknown",  Description: error.message}];
          break;
        }
      
        default: {
          const errorHttp: KyResponse = (error as HTTPError).response;
          // const errorText: string = await errorHttp.text();
          const errorJSON: Response | null = this.JSONParse(await errorHttp.text()) as Response;

          this.Errors = 
            errorJSON && errorJSON.Errors 
              ? errorJSON.Errors 
              : [{Id: BigInt(errorHttp.status), Code: "Exception",  Description: errorHttp.statusText}];
        }
      }
    }

    return response;
  }
}
