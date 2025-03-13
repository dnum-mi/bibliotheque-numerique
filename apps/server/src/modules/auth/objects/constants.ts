export const jwtConstants = {
  // secret: configService.get<string>("jwt.secret"),
  secret: process.env.AUTH_JWT_SECRET,
}
