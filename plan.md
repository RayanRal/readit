# Readit: Application Plan

## 1. Project Overview
**Readit** is a minimalist "read-it-later" application designed to declutter browser tabs by saving web pages for future reading.

## 2. Technical Architecture
- **Architecture:** Headless (Frontend/Backend separation via REST API).
- **Frontend:** Next.js (React), Tailwind CSS.
- **Backend:** Next.js API Routes (Serverless).
- **Database:** PostgreSQL (Supabase or Neon).
- **Deployment:** Vercel.

## 3. Data Model
**Table: `links`**
- `id`: UUID (Primary Key)
- `url`: Text (Required)
- `title`: Text (Optional)
- `status`: Enum ('unread', 'read') - Default: 'unread'
- `created_at`: Timestamp
- `content`: JSONB (Reserved for future page content storage)

## 4. API Specification (v1)
- `GET /api/v1/links`: Retrieve all unread links.
- `POST /api/v1/links`: Add a new link. Body: `{ "url": string }`.
- `DELETE /api/v1/links/:id`: Mark as read/remove a link.

## 5. UI/UX Plan
- **Dashboard:** Clean, minimalist interface.
- **Input:** Prominent URL entry field at the top.
- **List View:** Responsive cards showing saved links.
- **Actions:** One-click "Mark as Read" to remove from the dashboard.

## 6. Roadmap
- **Phase 1:** Environment setup & Database initialization.
- **Phase 2:** Backend API implementation (CRUD operations).
- **Phase 3:** Frontend UI development & Integration.
- **Phase 4:** Deployment to Vercel.
- **Phase 5 (Future):** Content scraping & Mobile client.
