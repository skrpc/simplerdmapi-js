declare enum Result {
    Error = 0,
    Success = 1,
    Unmodified = 2,
    Modified = 3,
    Added = 4,
    Deleted = 5
}
interface SystemError {
    Id: bigint;
    Code: string;
    Description: string;
}
interface Response {
    Result: Result;
    Errors: SystemError[] | null;
}
declare class API {
    private api;
    private clientId;
    private accessToken;
    private refreshToken;
    private refreshExpiresIn;
    Result: Result;
    Errors: SystemError[] | null;
    constructor(url: string, clientId: string, accessToken: string, refreshToken: string, refreshExpiresIn: number);
    private JSONParse;
    get: <TResponse extends Response>(endPoint: string, options?: RequestInit) => Promise<TResponse | null>;
    post: <TResponse extends Response>(endPoint: string, options?: RequestInit) => Promise<TResponse | null>;
    call<TResponse extends Response>(endPoint: string, options: RequestInit, method: string): Promise<TResponse | null>;
}

export { API, type Response, Result, type SystemError };
