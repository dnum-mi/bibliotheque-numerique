import { JwtSignOptions } from '@nestjs/jwt'

export interface UserinfoResponse {
  email?: string;
  given_name?: string;
  family_name?: string;
  access_token?: string;
}

export interface DecodedToken {
  state: string;
  nonce: string;
}

export interface CustomJwtSignOptions extends JwtSignOptions {
  expiresIn?: string | number;
}
