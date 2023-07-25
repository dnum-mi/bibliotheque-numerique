import { Request, Response } from "express";

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function jsonFormat(
  tokens: Record<
    string,
    (req: Request, res: Response, param?: string) => string
  >,
  req: Request & { request_id: string; headers: Record<string, string> },
  res: Response,
) {
  return JSON.stringify({
    api: {
      time_local: tokens.date(req, res, "iso"),
      method: tokens.method(req, res),
      request_uri: tokens.url(req, res),
      uri: tokens.url(req, res),
      status: +tokens.status(req, res),
      content_length: +tokens.res(req, res, "content-length"),
      http_referrer: tokens.referrer(req, res),
      http_version: tokens["http-version"](req, res),
      remote_addr: tokens["remote-addr"](req, res),
      remote_user: tokens["remote-user"](req, res),
      http_user_agent: tokens["user-agent"](req, res),
      response_time: +tokens["response-time"](req, res),
      user_id: tokens.res(req, res, "x-user-id") || req.headers["x-user-id"],
      xrequest_id: req.headers["x-request-id"],
      client_id: req.headers["x-client-id"],
      forwarded_for: req.headers["x-forwarded-for"],
      request_id: req.request_id,
    },
  });
}
