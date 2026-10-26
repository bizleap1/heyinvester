# Hey Investor - Real Estate Platform

A premium plotted real estate platform for Nagpur & Vidarbha. This project includes a modern Next.js frontend with a full-stack backend (Admin Panel, Database, Authentication, and Media Management).

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth
- **Media**: Cloudinary
- **Validation**: Zod + React Hook Form

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in the missing credentials.

```bash
cp .env.example .env
```

Ensure `.env` contains:
- `DATABASE_URL` (Neon PostgreSQL)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL=http://localhost:3000`

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migrations & Seeding
Push the schema to your Neon PostgreSQL database:
```bash
npm run db:migrate
```

Seed the database with initial projects and settings:
```bash
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the site.

## Admin Panel
- **URL**: `/admin`
- **Login**: `/admin/login`

To access the admin panel, you must be registered as an admin. Since Better Auth handles sessions, you can use the built-in API or seed an admin user in your database manually to test the login.

## Folder Structure
- `src/app`: Next.js App Router (Public Pages & Admin Panel)
- `src/components`: UI Components, Forms, Sections
- `src/db`: Database schema, migrations, and seeding scripts
- `src/actions`: Next.js Server Actions for CRUD operations
- `src/schemas`: Zod schemas for form validation and type safety
- `src/lib`: Utilities (Cloudinary, Auth, Data formatting)
