export const jwtConstants = {
  // secret: configService.get<string>("jwt.secret"),
  secret: process.env.JWT_SECRET,
};

export const sessionSecret = {
  secret: process.env.SESSION_SECRET,
};
