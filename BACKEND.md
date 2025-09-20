# VoiceLocal Backend Integration Guide

This document describes the current frontend state and the backend API the app expects so you can implement a real Django + MySQL backend that replaces all mock data.

## Current frontend status (2025-09-20)

Tech stack
- React 19 + Vite 7 + TypeScript 5.8
- Router: react-router-dom 7
- UI: Tailwind CSS 4 (via @tailwindcss/vite), Radix UI components, lucide-react icons
- Linting: ESLint 9 (config in `frontend/eslint.config.js`)

Key structure
- App entry: `frontend/src/App.tsx`
- Contexts (currently mock/in-memory):
  - `frontend/src/contexts/AuthContext.tsx` — stores a mock user in `localStorage` and simulates login/register/updateProfile.
  - `frontend/src/contexts/IssueContext.tsx` — seeds mock issues on mount and manages votes/comments in memory.
- Error handling: `frontend/src/components/ui/error-boundary.tsx`
- Admin area: `frontend/src/components/admin/*`

Routing
- Public routes
  - `/` HomePage
  - `/login` LoginPage
  - `/register` RegisterPage
  - `/about` AboutPage
  - `/issues` IssuesFeedPage
  - `/issue/:id` IssueDetailsPage
- Protected routes (wrapper: `ProtectedRoute` in App.tsx)
  - `/post-issue` PostIssuePage
  - `/profile` ProfilePage
  - `/confirmation` ConfirmationPage
- Admin routes (wrapper: `AdminRoute` in App.tsx)
  - `/admin/*` Admin — renders Dashboard, Users, Issues, Categories, Settings under admin layout

Recent code changes
- Removed component prop interface mismatches. Components that previously expected navigation callbacks now use `react-router` hooks (`useNavigate`).
- TypeScript build passes. Lint is mostly clean but there remain some rules to address later (e.g., `react-refresh/only-export-components`, `@typescript-eslint/no-explicit-any` in a few admin/service files).

## Tech stack

- Frontend: React 19, Vite 7, TypeScript 5.8, Tailwind CSS 4, Radix UI, lucide-react
- Routing: react-router-dom 7
- State boundaries: AuthContext and IssueContext provide app-wide state; currently mock/in-memory
- Build/lint: Vite, ESLint 9 with typescript-eslint

## Data models used by the frontend

Issue (from `IssueContext.tsx`)
```ts path=null start=null
export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'rejected';
  upvotes: number;
  downvotes: number;
  userVotes: { [userId: string]: 'up' | 'down' };
  comments: Comment[];
  author: string;        // human-readable author name
  authorId: string;      // user id
  createdAt: string;     // ISO
  updatedAt?: string;    // ISO
  isDeleted?: boolean;   // soft delete flag
  category?: string;     // e.g. 'infrastructure', 'parks', 'safety', 'transportation'
  priority?: 'low' | 'medium' | 'high';
}

export interface Comment {
  id: string;
  author: string;     // display name
  authorId: string;   // user id
  content: string;
  createdAt: string;  // ISO
  updatedAt?: string; // ISO
}
```

Notes
- Frontend uses camelCase keys.
- Images are currently represented as `imageUrl` (string). The Post Issue form supports selecting an image but only previews it client-side; no upload API is wired yet.

## What the backend should provide

Authentication
- Replace AuthContext mock logic with real auth (recommended: JWT via SimpleJWT).
- Endpoints:
  - `POST /api/token/`  → { access, refresh }
  - `POST /api/token/refresh/` → { access }
  - `GET /api/me/` → current user (id, username, email, firstName, lastName, role, isActive, avatar, location, bio, joinedAt)
  - Optionally `POST /api/register/` for self-serve signup
- Frontend stores tokens (e.g., localStorage) and sends `Authorization: Bearer <token>`.

Issues API
- List issues with filters/pagination:
  - `GET /api/issues/?status=open&category=parks&priority=high&search=pothole&ordering=-created_at&page=1`
  - Response: Prefer camelCase to minimize mapping on the client, or return snake_case and map client-side.
  - Include computed fields `upvotes`, `downvotes`, and embedded `comments` array (or provide a separate comments resource and fetch when needed).
- CRUD
  - `POST /api/issues/` create (auth required)
  - `GET /api/issues/{id}/`
  - `PATCH /api/issues/{id}/` (auth & author-only)
  - `DELETE /api/issues/{id}/` (hard delete) or support soft delete with `PATCH` and `isDeleted: true`
- Bulk/restore (admin)
  - `POST /api/issues/{id}/restore/` (set isDeleted=false)
- Voting
  - `POST /api/issues/{id}/vote/` with body `{ "type": "up" | "down" }` (upsert unique user vote)
- Comments (nested under issue)
  - `GET /api/issues/{id}/comments/`
  - `POST /api/issues/{id}/comments/`
  - `PATCH /api/issues/{id}/comments/{commentId}/`
  - `DELETE /api/issues/{id}/comments/{commentId}/`

Categories API (admin)
- `GET /api/categories/` (public)
- `POST /api/categories/` (admin)
- `PATCH /api/categories/{id}/` (admin)
- `DELETE /api/categories/{id}/` (admin)

Users API (admin)
- `GET /api/users/?status=&role=&search=` list with filters
- `PATCH /api/users/{id}/` to update role or status (e.g., suspend/activate)
- Optional: `POST /api/users/` to invite/add user

Suggested response shape (camelCase)
```json path=null start=null
{
  "id": "1",
  "title": "Pothole on Main Street needs immediate repair",
  "description": "...",
  "location": "Main Street & Oak Avenue",
  "imageUrl": "https://...",
  "status": "open",
  "category": "infrastructure",
  "priority": "high",
  "upvotes": 47,
  "downvotes": 3,
  "comments": [
    {"id":"1","author":"Mike Chen","authorId":"2","content":"...","createdAt":"..."}
  ],
  "author": "Sarah Johnson",
  "authorId": "1",
  "createdAt": "2025-09-18T10:00:00.000Z",
  "updatedAt": "2025-09-19T10:00:00.000Z",
  "isDeleted": false
}
```

Pagination (if enabled)
```json path=null start=null
{
  "count": 123,
  "next": "http://localhost:8000/api/issues/?page=2",
  "previous": null,
  "results": [ { ...issue }, { ...issue } ]
}
```

## How the frontend will integrate with the backend

Environment
- Frontend will read `VITE_API_BASE_URL` from `.env.local`.
  - Example: `VITE_API_BASE_URL=http://localhost:8000/api`

AuthContext migration (high level)
- Replace current `login`, `register`, `updateProfile` with API calls.
- After `login`, store `access_token` (and `refresh_token`), hydrate user via `/api/me/` (or encoded claims), and set `isAuthenticated`.

IssueContext migration (high level)
- Remove mock seed in `useEffect`.
- Implement functions using fetch to your backend:
  - `issues`: fetched from `GET /issues/` on mount (and after mutations).
  - `addIssue(payload)`: `POST /issues/` then refresh list.
  - `updateIssue(id, updates)`: `PATCH /issues/{id}/` then refresh.
  - `deleteIssue(id, soft)`: soft ⇒ `PATCH isDeleted:true` or hard ⇒ `DELETE`.
  - `voteOnIssue(id, type)`: `POST /issues/{id}/vote/` then refresh.
  - `addComment(id, {content})`: `POST /issues/{id}/comments/` then refresh.
  - `updateComment(issueId, commentId, content)`: `PATCH` then refresh.
  - `deleteComment(issueId, commentId)`: `DELETE` then refresh.

Image handling
- Current UI provides a preview only. For production:
  - Either accept `imageUrl` strings (hosted elsewhere), or
  - Implement an upload endpoint and return a public URL to store as `imageUrl`.

CORS and dev servers
- Frontend dev: `http://localhost:5173`
- Backend dev: `http://localhost:8000`
- Enable CORS for the frontend origin in backend configuration.

## Roles & permissions (user and admin)

Frontend expectations
- Authenticated user can:
  - Create, edit, soft-delete own issues
  - Vote once per issue (toggle/update vote)
  - Comment on issues; edit/delete own comments
- Admin can:
  - Access `/admin/*` UI (Dashboard, Users, Issues, Categories, Settings)
  - Moderate issues: change status, soft delete, hard delete
  - Restore deleted issues (DeletedIssues page)
  - Manage categories: create, update, delete
  - Manage users: list, filter, suspend/activate, change roles (UI hints at status toggle)

Backend mapping
- Use JWT auth for API; gate admin endpoints with Django permissions.
- Permissions proposal
  - Non-admin: CRUD only on own issues/comments; vote on any issue.
  - Admin: CRUD on all issues/comments, manage categories and users.
- Flags/fields
  - `role` on Profile or User; or rely on Django is_staff/is_superuser and map to frontend roles.
  - `isActive`/`status`: drive user suspension; deny login or actions accordingly.

## Admin features and expectations

Admin pages (UI already present):
- Issues management (`Issues.tsx`): filter, status changes, soft/hard delete, bulk actions.
- Deleted issues (`DeletedIssues.tsx`): restore and permanent delete.
- Users, Categories, Settings pages exist as stubs or partial UIs.

Backend should:
- Authorize admin-only actions (use Django `is_staff`/`is_superuser` or a custom role).
- Expose endpoints for listing deleted issues (e.g., `isDeleted=true`), restoring, and bulk operations as needed.

## Known frontend follow-ups during backend integration

- Replace mock Auth/Issue contexts with real API calls (as above).
- Align field names: Consider returning camelCase from the backend to reduce mapping.
- ESLint cleanups (non-blocking for backend):
  - `react-refresh/only-export-components` in a few UI files
  - `@typescript-eslint/no-explicit-any` in some admin files/services
- Optional: Introduce an `api.ts` helper to attach JWT to requests and centralize error handling.

## Commands (for reference)

Frontend
```bash path=null start=null
# In frontend/
npm run dev      # start Vite dev server
npm run build    # typecheck + build
npm run lint     # ESLint
```

Backend (suggested stack)
- Django + DRF + SimpleJWT + MySQL (see separate setup guide).
- Expose endpoints listed above under `/api/`.

---
If you want, I can scaffold the Django app under `backend/` and submit an initial API aligned to these contracts, then update the frontend contexts to consume it.
