import jwt from "jsonwebtoken";

export function generateToken(id: string, rememberMe = false) {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET!,
    {
      expiresIn: rememberMe ? "30d" : "1d",
    }
  );
}