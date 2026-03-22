import jwt from 'jsonwebtoken';
export const JwtService = {
  generateAccessToken: (user) =>
    jwt.sign(
      { id: user.customer_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    ),

  generateRefreshToken: (user) =>
    jwt.sign(
      { id: user.customer_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    )
};
