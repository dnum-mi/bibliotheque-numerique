import { PassportSerializer } from "@nestjs/passport";

export class SessionSerializer extends PassportSerializer {
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user);
  }

  deserializeUser(
    // TODO: fixe type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    done: (err: Error, payload: string) => void,
    // TODO: fixe type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    done(null, payload);
  }
}
