# Taurus — Database

Docker Compose สำหรับ MySQL และ phpMyAdmin ของโปรเจ็ค Taurus โดยเฉพาะ แยกอิสระจาก project อื่นบนเครื่อง

---

## Services

| Service | Container | Port (host) | Image |
|---|---|---|---|
| MySQL | `taurus_mysql` | `3307` | `mysql:8.0` |
| phpMyAdmin | `taurus_phpmyadmin` | `8081` | `phpmyadmin:latest` |

---

## เริ่มใช้งาน

```bash
cd database
docker compose up -d
```

> phpMyAdmin → http://localhost:8082

---

## การเชื่อมต่อ

### ผ่าน phpMyAdmin
เปิด http://localhost:8082 — login อัตโนมัติ (ไม่ต้องกรอก password)

### ผ่าน MySQL Client / DBeaver / TablePlus
| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `3307` |
| User | `root` |
| Password | *(ว่าง)* |
| Database | `taurus` |

### DATABASE_URL (Prisma / server .env)
```
DATABASE_URL="mysql://root@localhost:3307/taurus"
```

---

## คำสั่งที่ใช้บ่อย

```bash
# เริ่ม containers
docker compose up -d

# หยุด containers (ข้อมูลยังอยู่)
docker compose stop

# หยุดและลบ containers (ข้อมูลยังอยู่ใน volume)
docker compose down

# ลบทุกอย่างรวม volume (ข้อมูลหาย!)
docker compose down -v

# ดู logs MySQL
docker compose logs db

# ดู logs แบบ real-time
docker compose logs -f
```

---

## Database Setup (ครั้งแรก)

หลัง `docker compose up -d` ให้ run คำสั่งนี้จาก `/server`:

```bash
# สร้าง tables จาก Prisma schema
npx prisma migrate deploy

# สร้าง admin user เริ่มต้น (credentials อ่านได้จาก .env)
node prisma/seed.js
```

---

## หมายเหตุ

- **Project name** ถูกกำหนดเป็น `taurus` ใน `docker-compose.yml` เพื่อป้องกัน conflict กับ project อื่นที่มีโฟลเดอร์ชื่อ `database` เหมือนกัน
- ข้อมูลทั้งหมดเก็บใน Docker Volume ชื่อ `taurus_mysql_data` ไม่หายแม้ลบ container
- MySQL รันบน port **3307** (ไม่ใช่ 3306) เพื่อไม่ชนกับ project อื่นบนเครื่อง
