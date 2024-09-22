require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (userID, res) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days,
    sameSite: "strict",
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
