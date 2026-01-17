# Readit: Application Plan

## 1. Project Overview
**Readit** is a minimalist "read-it-later" application designed to declutter browser tabs by saving web pages for future reading.

## 2. Technical Architecture
- **Architecture:** Headless (Frontend/Backend separation via REST API).
- **Frontend:** Next.js (React), Tailwind CSS.
- **Backend:** Next.js API Routes (Serverless).
- **Database:** PostgreSQL (Supabase or Neon).
- **Authentication:** Supabase Auth (or compatible OAuth/Email provider).
- **Deployment:** Vercel.

## 3. Data Model
**Table: `links`**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `auth.users`) - **CRITICAL for multi-user isolation**
- `url`: Text (Required)
- `title`: Text (Optional)
- `status`: Enum ('unread', 'read') - Default: 'unread'
- `created_at`: Timestamp
- `content`: JSONB (Reserved for future page content storage)

## 4. API Specification (v1)
*All API routes must be protected and context-aware of the logged-in user.*
- `GET /api/v1/links`: Retrieve unread links *for the current user*.
- `POST /api/v1/links`: Add a new link *for the current user*. Body: `{ "url": string }`.
- `DELETE /api/v1/links/:id`: Mark as read/remove a link.

## 5. UI/UX Plan
- **Auth Screens:** Login and Registration pages (Email/Password or Social Login).
- **Dashboard:** Clean, minimalist interface (Protected Route).
- **Input:** Prominent URL entry field at the top.
- **List View:** Responsive cards showing saved links.
- **Actions:** One-click "Mark as Read" to remove from the dashboard.

## 6. Roadmap
- **Phase 1:** Environment setup, Database & **Auth** initialization.
- **Phase 2:** Backend API implementation (CRUD operations + **Auth Middleware**).
- **Phase 3:** Frontend UI development (including **Login/Register**) & Integration.
- **Phase 4:** Deployment to Vercel.
- **Phase 5 (Future):** Content scraping & Mobile client.
