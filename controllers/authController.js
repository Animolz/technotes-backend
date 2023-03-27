const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

//create access token
const createAccessToken = (data, options) => {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    ...options,
    expiresIn: "5s",
  });
};

const createRefreshToken = (data, options) => {
  return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
    ...options,
    expiresIn: "10s",
  });
};

//@desc Login
//@route POST /auth
//@access Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ username }).lean().exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res
      .status(401)
      .json({ message: "Please check your username and password" });
  }

  const accessToken = createAccessToken({
    UserInfo: {
      username: foundUser.username,
      roles: foundUser.roles,
    },
  });

  const refreshToken = createRefreshToken({
    username: foundUser.username,
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

//@desc Refresh
//@route get /auth/refresh
//@access Public
const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const foundUser = await User.findOne({ username: decoded.username });

      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const accessToken = createAccessToken({
        UserInfo: {
          username: foundUser.username,
          roles: foundUser.roles,
        },
      });

      res.json({ accessToken });
    })
  );
});

//@desc Logout
//@route POST /auth/logout
//@access Public
const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Cookie Cleared" });
});

module.exports = {
  login,
  refresh,
  logout,
};
