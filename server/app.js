// app.js
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
app.set("trust proxy", 1);

/** ✅ Health check — ตอบก่อน middleware ทั้งหมด ไม่โดน rate limit / log */
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

/** 🌐 CORS: รองรับ wildcard จาก ENV (เช่น https://*.vercel.app) */
function compileCorsOrigins(csv) {
  const items = (csv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const exact = new Set();
  const regexes = [];
  let allowAll = false;

  for (const item of items) {
    if (item === "*") {
      allowAll = true;
      continue;
    }
    // รองรับรูปแบบ https://*.domain.tld
    const m = item.match(/^https?:\/\/\*\.(.+?)$/i);
    if (m) {
      const hostEsc = m[1].replace(/\./g, "\\.");
      // อนุญาตซับโดเมนหลายชั้น + ระบุพอร์ตได้
      regexes.push(
        new RegExp(
          `^https?:\\/\\/[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.${hostEsc}(?::\\d+)?$`,
          "i"
        )
      );
      continue;
    }
    // กรณี exact origin (รวม protocol + host [+port])
    exact.add(item);
  }
  // ถ้าไม่ได้ตั้งค่าเลย ให้ default เป็น localhost:3000
  if (!items.length) exact.add("http://localhost:3000");
  return { allowAll, exact, regexes };
}

const { allowAll, exact: allowExact, regexes: allowRegexes } =
  compileCorsOrigins(process.env.CORS_ORIGIN);

/** ✅ ตั้งค่า CORS */
const corsOptions = {
  origin(origin, cb) {
    // ไม่มี Origin (เช่น healthcheck, curl) ให้ผ่าน
    if (!origin) return cb(null, true);
    if (allowAll) return cb(null, true);
    if (allowExact.has(origin)) return cb(null, true);
    if (allowRegexes.some((re) => re.test(origin))) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  maxAge: 86400, // cache preflight 1 วัน
};

app.use(cors(corsOptions));
// ใช้ regex แทน "*" ป้องกันปัญหา path-to-regexp บน Express 5
app.options(/.*/, cors(corsOptions));

// เผื่อ proxy/CDN แคชตาม Origin
app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

/** 🔐 Security / Perf */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(express.json({ limit: "10kb" }));

/** 📈 Logs — skip health check agents และ uptime monitors */
const HEALTH_UA = /UptimeRobot|Pingdom|StatusCake|Site24x7|kube-probe|GoogleHC|ELB-HealthChecker|vercel/i;
app.use(
  morgan(process.env.NODE_ENV === "development" ? "dev" : "combined", {
    skip: (req) =>
      req.path === "/health" || HEALTH_UA.test(req.headers["user-agent"] || ""),
  })
);

/** 🚫 Rate limit */

// Global API rate limit — ป้องกันบอทยิง endpoint ทั่วไป
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 นาที
  max: 120,            // 120 req/min ต่อ IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",
  skip: (req) =>
    req.path === "/health" || HEALTH_UA.test(req.headers["user-agent"] || ""),
});
app.use("/api", globalLimiter);

// Login rate limit — กันบรูทฟอร์ซ
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);

/** 🔧 flags/res.locals */
app.use((req, res, next) => {
  res.locals.isSecure = process.env.NODE_ENV === "production";
  next();
});

/** 🚀 Routes */
app.use("/api", routes);
app.get("/", (_req, res) => {
  res.send("Welcome to Taurus Backend API");
});

/** ❌ Global error handler */
app.use(errorMiddleware);

module.exports = app;
