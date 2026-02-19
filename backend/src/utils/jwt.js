import jwt from "jsonwebtoken";

export function signToken(user, jwtSecret) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token, jwtSecret) {
  return jwt.verify(token, jwtSecret);
}
