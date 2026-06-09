const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadAvatar, cloudinary } = require("../utils/cloudinary");

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("❌ JWT_SECRET and REFRESH_TOKEN_SECRET must be set");
}

// Utility: Email format checker
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Token generator
const generateTokens = (userId, email, rememberMe = false) => {
  const accessTokenExpiresIn = rememberMe ? "7d" : "2h";
  // const accessTokenExpiresIn = rememberMe ? "7d" : "30s"; // For testing, use a shorter expiration time
  const refreshTokenExpiresIn = "30d";

  const accessToken = jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: accessTokenExpiresIn,
    algorithm: "HS256",
  });

  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiresIn,
    algorithm: "HS256",
  });

  return { accessToken, refreshToken, accessTokenExpiresIn };
};

const saveRefreshToken = async (token, userId) => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

exports.register = [
  uploadAvatar.single("avatar"),
  async (req, res) => {
    const { email, password, name, role } = req.body;
    const avatarFile = req.file;

    const errors = [
      !email && "Missing email",
      !password && "Missing password",
      email && !isValidEmail(email) && "Invalid email format",
      password && password.length < 6 && "Password must be at least 6 characters",
      !name || name.length < 2 && "Name must be at least 2 characters",
      role && !["USER", "ADMIN"].includes(role) && "Invalid role",
      role === "ADMIN" && req.user?.role !== "ADMIN" && "Only admins can create admin users",
    ].filter(Boolean);

    if (errors.length > 0) {
      if (avatarFile?.filename) {
        await cloudinary.uploader.destroy(avatarFile.filename);
      }
      return res.status(400).json({ message: errors[0] });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        if (avatarFile?.filename) {
          await cloudinary.uploader.destroy(avatarFile.filename);
        }
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || "USER",
          avatarUrl: avatarFile?.path || null,
          avatarPublicId: avatarFile?.filename || null,
        },
      });

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: {
          user: {
            userId: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
          },
        },
      });
    } catch (error) {
      if (avatarFile?.filename) {
        await cloudinary.uploader.destroy(avatarFile.filename);
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
];

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch  = await bcrypt.compare(password, user.password);
    if (!isMatch ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken, accessTokenExpiresIn } = generateTokens(user.id, user.email, rememberMe);
    await saveRefreshToken(refreshToken, user.id);

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
        accessToken,
        accessTokenExpiresIn,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    // console.log("🔄 Refresh token:", refreshToken);

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    // console.log("Stored token:", storedToken);

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const { accessToken, refreshToken: newRefreshToken, accessTokenExpiresIn } = generateTokens(decoded.id, storedToken.user.email);

    await saveRefreshToken(newRefreshToken, decoded.id);

    res.json({
      status: "success",
      message: "Token refreshed",
      data: { 
        accessToken,
        accessTokenExpiresIn,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken, userId: decoded.id },
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      status: "success",
      data: {
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Missing old or new password" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNew },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
