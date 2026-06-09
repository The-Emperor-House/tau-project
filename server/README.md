# Taurus Backend API

This is the backend API server for the Taurus project, built with:

- ⚙️ Express.js
- 🧬 Prisma ORM
- ☁️ Cloudinary (for image uploads)
- 🔐 JWT Authentication
- 📎 Multer (file upload middleware)

---

## 📦 Requirements

- Node.js >= 18.x
- MySQL / PostgreSQL / SQLite (configured via Prisma)
- Cloudinary account (for image storage)

---

## 🔧 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/taurus-backend.git
cd taurus-backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file

```env
PORT=3002
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:3000,https://yourfrontend.com
```

### 4️⃣ Set up Prisma

Configure your database in `prisma/schema.prisma`  
Then run the following:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🚀 Running the Server

### Development (with auto-restart via nodemon)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will run at:  
➡️ `http://localhost:3002` (or the port specified in `.env`)

---

## 📁 Project Structure

```
/src
  /controllers     → API controllers (auth, user, project, etc.)
  /middleware      → Auth checks, error handlers
  /utils           → Cloudinary config, helpers
  app.js           → Express app setup
index.js           → Server entry point
```

---

## 🔐 Authentication

JWT-based authentication.

After login, include this header in your requests:

```
Authorization: Bearer <your_token>
```

---

## 📤 Image Upload

### Avatar upload (for user profile)

```
PUT /me/avatar
```

- Content-Type: `multipart/form-data`
- Field name: `avatar`

### Entity images (project, design, furniture, etc.)

- Send via `multipart/form-data` (fields: `cover`, `images[]`)
- Uploaded via Cloudinary

---

## 💬 Contact API

Submit contact form:

```
POST /contact
```

**Required fields:**

- `fullName`
- `email`
- `phone`
- `budget` *(number)*
- `areaSize` *(number)*
- `needs` *(array of strings)*
- `details` *(optional)*

---

## 🧪 Seeding (create admin)

If you want to seed an admin account:

```bash
npx prisma db seed
```

You can configure credentials via `.env`:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=your_secure_password
```

---

## 📚 API Documentation

- Postman collection available at: [`/docs/Taurus.postman_collection.json`](./docs/Taurus.postman_collection.json)
- Swagger UI (optional): `http://localhost:3002/api-docs` *(if integrated)*

---

## 📬 Contact

For support or questions, open an issue or contact the project maintainers.
