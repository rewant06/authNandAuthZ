# Backend Server

This is the Nest.js backend service for HelpingBots. It provides a secure, scalable, and production-grade API, including a robust authentication system.

---

## 🚀 Key Features

* **Framework:** Built with [Nest.js](https://nestjs.com/) & TypeScript.
* **Database:** Uses [Prisma](https://www.prisma.io/) ORM with a PostgreSQL database.
* **Authentication:** Secure JWT (`RS256`) auth with `httpOnly` refresh token rotation.
* **Security:** Passwords hashed with `Argon2`, Redis-backed rate limiting.
* **Performance:** Asynchronous audit logging and caching with [Redis](https://redis.io/).

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/en/) (v18 or later)
* [pnpm](https://pnpm.io/)
* [PostgreSQL](https://www.postgresql.org/)
* [Redis](https://redis.io/topics/quickstart)

---

## ⚙️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd [your-repo-folder]
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory. Copy the contents of `.env.example` (you should create this file) and fill in your values.

    ```.env
    # .env file
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    REDIS_URL="redis://HOST:PORT"

    # Port
    PORT=8000

    # JWT Secrets (Generate these)
    ACCESS_TOKEN_EXPIRES_IN="15m"
    # ... other env variables
    ```

4.  **Generate Security Keys:**
    This project uses `RS256` for JWTs. You must have `private.key` and `public.key` files in the root directory. If you don't have them, you can generate them using `openssl`:
    ```bash
    # Generate private key
    openssl genrsa -out private.key 2048
    # Generate public key
    openssl rsa -in private.key -pubout -out public.key
    ```

5.  **Run database migrations:**
    This will sync your Prisma schema with your PostgreSQL database.
    ```bash
    pnpm prisma migrate dev
    ```

---

## 🏃 Running the App

### Development
Runs the app in watch mode on `http://localhost:8000`.
```bash
pnpm start:dev

### Production
Builds and runs the optimized production version.

# 1. Build the app
pnpm build

# 2. Run the production server
pnpm start:prod