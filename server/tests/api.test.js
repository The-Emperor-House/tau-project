// Integration tests ของ API — รันด้วย `npm test`
// Prisma และ Cloudinary ถูก stub ทั้งหมด ไม่แตะ DB หรือบัญชี Cloudinary จริง
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
// กันพลาดไปต่อ DB จริง ถ้ามี query ไหนลืม stub จะ error ทันที
process.env.DATABASE_URL = "mysql://test:test@127.0.0.1:1/none";

const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { Writable } = require("node:stream");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { cloudinary } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const app = require("../app");

// ---------- Cloudinary stub ----------
let uploaded = [];
let destroyed = [];
let uploadCounter = 0;

cloudinary.uploader.upload_stream = (opts, cb) => {
  const publicId = `${opts.folder}/test-${++uploadCounter}`;
  return new Writable({
    write(_chunk, _enc, next) { next(); },
    final(done) {
      uploaded.push(publicId);
      cb(null, { public_id: publicId, secure_url: `https://example.test/${publicId}.jpg`, bytes: 1 });
      done();
    },
  });
};
cloudinary.uploader.destroy = (publicId, optsOrCb, cb) => {
  destroyed.push(publicId);
  const callback = typeof optsOrCb === "function" ? optsOrCb : cb;
  callback?.(null, { result: "ok" });
  return Promise.resolve({ result: "ok" });
};

// ---------- Prisma stub ----------
const calls = [];
const record = (name, impl) => async (...args) => {
  calls.push([name, ...args]);
  return impl(...args);
};
const unexpected = (name) => async () => { throw new Error(`Unexpected prisma call: ${name}`); };

function resetPrisma() {
  calls.length = 0;
  for (const model of ["user", "refreshToken", "design", "designImage", "news", "newsImage"]) {
    for (const method of ["findUnique", "findMany", "create", "createMany", "update", "delete", "deleteMany"]) {
      prisma[model][method] = unexpected(`${model}.${method}`);
    }
  }
  prisma.$transaction = async (arg) => (typeof arg === "function" ? arg(prisma) : Promise.all(arg));
}

// ---------- HTTP helpers ----------
let baseUrl;
let server;
const authHeader = () => ({
  Authorization: `Bearer ${jwt.sign({ id: 1, email: "admin@test.local" }, process.env.JWT_SECRET)}`,
});

async function request(method, path, { body, headers = {}, auth = false } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(auth ? authHeader() : {}),
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body && !isForm ? JSON.stringify(body) : body,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

const KB = 1024;
const MB = 1024 * KB;
function imageForm(fields = {}, { cover = true, images = 0, imageSize = 10 * KB, type = "image/jpeg" } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  if (cover) fd.append("cover", new Blob([Buffer.alloc(10 * KB)], { type: "image/jpeg" }), "cover.jpg");
  for (let i = 0; i < images; i++) {
    fd.append("images", new Blob([Buffer.alloc(imageSize)], { type }), `img${i}.jpg`);
  }
  return fd;
}

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
beforeEach(() => {
  resetPrisma();
  uploaded = [];
  destroyed = [];
});

// =====================================================================
describe("auth", () => {
  it("ห้ามสมัคร user ใหม่ถ้ายังไม่ login", async () => {
    const res = await request("POST", "/api/auth/register", {
      body: { email: "new@test.local", password: "secret123", name: "New" },
    });
    assert.equal(res.status, 401);
  });

  it("login ไม่ส่ง email/password → 400", async () => {
    const res = await request("POST", "/api/auth/login", { body: {} });
    assert.equal(res.status, 400);
  });

  it("login รหัสผ่านผิด → 401", async () => {
    prisma.user.findUnique = record("user.findUnique", () => ({
      id: 1, email: "admin@test.local", password: bcrypt.hashSync("right-password", 4),
    }));
    const res = await request("POST", "/api/auth/login", {
      body: { email: "admin@test.local", password: "wrong-password" },
    });
    assert.equal(res.status, 401);
  });

  it("login สำเร็จ → ได้ token และบันทึก refresh token", async () => {
    prisma.user.findUnique = record("user.findUnique", () => ({
      id: 1, email: "admin@test.local", name: "Admin", password: bcrypt.hashSync("right-password", 4),
    }));
    prisma.refreshToken.create = record("refreshToken.create", ({ data }) => data);

    const res = await request("POST", "/api/auth/login", {
      body: { email: "admin@test.local", password: "right-password" },
    });
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.data.accessToken, "string");
    assert.equal(typeof res.body.data.refreshToken, "string");
    assert.equal(res.body.data.user.email, "admin@test.local");
    assert.ok(!("role" in res.body.data.user));
    assert.ok(calls.some(([name]) => name === "refreshToken.create"));
  });

  it("route ที่ต้อง login ปฏิเสธ token ปลอม", async () => {
    const res = await request("GET", "/api/auth/me", { headers: { Authorization: "Bearer not-a-token" } });
    assert.equal(res.status, 401);
  });
});

// =====================================================================
describe("upload", () => {
  it("ไม่ login → 401 และไม่มีไฟล์ถูกอัปโหลด", async () => {
    const res = await request("POST", "/api/designs", {
      body: imageForm({ name: "D", type: "INTERIOR" }, { images: 2 }),
    });
    assert.equal(res.status, 401);
    assert.equal(uploaded.length, 0);
  });

  it("สร้าง design สำเร็จ → บันทึกรูป gallery ครบ", async () => {
    prisma.design.create = record("design.create", ({ data }) => ({ id: 10, ...data }));
    prisma.designImage.createMany = record("designImage.createMany", ({ data }) => ({ count: data.length }));

    const res = await request("POST", "/api/designs", {
      auth: true,
      body: imageForm({ name: "D", type: "INTERIOR" }, { images: 15 }),
    });
    assert.equal(res.status, 200);
    const createMany = calls.find(([name]) => name === "designImage.createMany");
    assert.equal(createMany[1].data.length, 15);
    assert.equal(destroyed.length, 0);
  });

  it("validation ไม่ผ่าน → 400 และลบไฟล์ที่อัปโหลดไปแล้วทิ้ง", async () => {
    const res = await request("POST", "/api/designs", {
      auth: true,
      body: imageForm({ name: "D", type: "NOT_A_TYPE" }, { images: 2 }),
    });
    assert.equal(res.status, 400);
    assert.equal(uploaded.length, 3);
    assert.deepEqual([...destroyed].sort(), [...uploaded].sort());
  });

  it("รูปเกิน 30 รูป → 400 พร้อมข้อความบอกสาเหตุ", async () => {
    const res = await request("POST", "/api/designs", {
      auth: true,
      body: imageForm({ name: "D", type: "INTERIOR" }, { images: 31, imageSize: KB }),
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Too many images/);
  });

  it("ไฟล์ใหญ่เกิน 10MB → 413", async () => {
    const res = await request("POST", "/api/designs", {
      auth: true,
      body: imageForm({ name: "D", type: "INTERIOR" }, { images: 1, imageSize: 11 * MB }),
    });
    assert.equal(res.status, 413);
    assert.match(res.body.message, /too large/);
  });

  it("ไฟล์ HEIC → 400 Invalid file type", async () => {
    const res = await request("POST", "/api/designs", {
      auth: true,
      body: imageForm({ name: "D", type: "INTERIOR" }, { images: 1, type: "image/heic" }),
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Invalid file type/);
  });

  it("แก้ design เปลี่ยน cover + ลบรูป → ลบไฟล์เก่าหลังบันทึก DB สำเร็จ", async () => {
    prisma.design.findUnique = record("design.findUnique", () => ({ id: 5, coverPublicId: "old-cover" }));
    prisma.design.update = record("design.update", ({ data }) => ({ id: 5, ...data }));
    prisma.designImage.findMany = record("designImage.findMany", () => [{ id: 7, publicId: "old-img" }]);
    prisma.designImage.deleteMany = record("designImage.deleteMany", () => ({ count: 1 }));
    prisma.designImage.createMany = record("designImage.createMany", ({ data }) => ({ count: data.length }));

    const res = await request("PUT", "/api/designs/5", {
      auth: true,
      body: imageForm({ deleteImageIds: "7" }, { images: 1 }),
    });
    assert.equal(res.status, 200);
    assert.deepEqual([...destroyed].sort(), ["old-cover", "old-img"]);
  });

  it("แก้ design แล้ว DB error → ไฟล์เก่ายังอยู่ ไฟล์ใหม่ถูกลบทิ้ง", async () => {
    prisma.design.findUnique = record("design.findUnique", () => ({ id: 5, coverPublicId: "old-cover" }));
    prisma.design.update = record("design.update", () => { throw new Error("DB down"); });

    const res = await request("PUT", "/api/designs/5", {
      auth: true,
      body: imageForm({}, { images: 1 }),
    });
    assert.equal(res.status, 500);
    assert.ok(!destroyed.includes("old-cover"));
    assert.deepEqual([...destroyed].sort(), [...uploaded].sort());
  });

  it("ล้าง cover ของ news ไม่ได้ → 400", async () => {
    const res = await request("PUT", "/api/news/1", { auth: true, body: imageForm({ coverUrl: "" }, { cover: false }) });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Cover image is required/);
  });
});
