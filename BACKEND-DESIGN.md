# VoiceLocal Backend Design (ERD + API)

This document is your blueprint for Part 2 of the Capstone: a complete backend design including an Entity-Relationship Diagram (ERD) and the list of API endpoints. Use this to draw your ERD in a diagramming tool and paste a screenshot into your Google Document, along with the endpoint list.

Sections
- 1) ERD Overview (Entities & Relationships)
- 2) ERD Field Details (Types, Constraints, Indexes)
- 3) dbdiagram.io Schema (copy/paste to generate ERD)
- 4) API Endpoints (Methods, Auth, Params, Payloads)
- 5) Deliverables and Tips (Google Doc)


## 1) ERD Overview (Entities & Relationships)

Core entities
- User: Platform user (regular or admin) with profile and role.
- Profile: Extends User with role, status, avatar, location, bio.
- Category: Organizes issues (e.g., Infrastructure, Safety, Parks, Transportation).
- Issue: Main content created by users (title, description, location, status, priority, etc.).
- Comment: User comments on issues.
- Vote: User up/down vote on issues (one vote per user per issue).

Relationships
- User 1—1 Profile
- User 1—N Issue (author)
- User 1—N Comment (author)
- User 1—N Vote
- Category 1—N Issue
- Issue 1—N Comment
- Issue 1—N Vote

High-level diagram (textual)
- User ──1:1── Profile
- User ──1:N── Issue
- User ──1:N── Comment
- User ──1:N── Vote
- Category ──1:N── Issue
- Issue ──1:N── Comment
- Issue ──1:N── Vote


## 2) ERD Field Details (Types, Constraints, Indexes)

User
- Fields: id (PK), username (unique), email (unique), first_name, last_name, is_active (bool), is_staff (bool), date_joined (datetime)
- Indexes: unique(email), unique(username)

Profile
- Fields: id (PK), user_id (FK unique), role (enum: user|admin|moderator), status (enum: Active|Inactive|Suspended), avatar (URL), location (string), bio (text), joined_at (datetime)
- Constraints: user_id unique (1:1)

Category
- Fields: id (PK), name (unique), description (string), color (string HEX), created_at (datetime), updated_at (datetime)
- Indexes: unique(name)

Issue
- Fields: id (PK), title (string), description (text), location (string), image_url (URL nullable), status (enum: open|in-progress|resolved|rejected), priority (enum: low|medium|high), category_id (FK nullable), author_id (FK), is_deleted (bool), created_at (datetime), updated_at (datetime)
- Indexes: (status), (category_id), (priority), (created_at desc), optional composite: (status, category_id, priority, created_at)

Comment
- Fields: id (PK), issue_id (FK), author_id (FK), content (text), created_at (datetime), updated_at (datetime nullable)
- Indexes: (issue_id), (author_id), (created_at desc)

Vote
- Fields: id (PK), issue_id (FK), user_id (FK), type (enum: up|down)
- Constraints: unique(issue_id, user_id)
- Indexes: (issue_id, user_id) unique


## 3) dbdiagram.io Schema (copy/paste to generate ERD)

Paste the following in https://dbdiagram.io and export an image for your Google Doc.

```sql path=null start=null
Table users {
  id int [pk, increment]
  username varchar(150) [not null, unique]
  email varchar(255) [not null, unique]
  first_name varchar(150)
  last_name varchar(150)
  is_active boolean [not null, default: true]
  is_staff boolean [not null, default: false]
  date_joined datetime [not null]
}

Table profiles {
  id int [pk, increment]
  user_id int [not null, unique, ref: > users.id]
  role varchar(16) [not null, default: 'user'] -- user | admin | moderator
  status varchar(16) [not null, default: 'Active'] -- Active | Inactive | Suspended
  avatar varchar(500)
  location varchar(255)
  bio text
  joined_at datetime [not null]
}

Table categories {
  id int [pk, increment]
  name varchar(100) [not null, unique]
  description varchar(255)
  color varchar(9) [not null, default: '#3B82F6']
  created_at datetime [not null]
  updated_at datetime [not null]
}

Table issues {
  id int [pk, increment]
  title varchar(255) [not null]
  description text [not null]
  location varchar(255) [not null]
  image_url varchar(500)
  status varchar(20) [not null, default: 'open'] -- open | in-progress | resolved | rejected
  priority varchar(10) [not null, default: 'medium'] -- low | medium | high
  category_id int [ref: > categories.id]
  author_id int [not null, ref: > users.id]
  is_deleted boolean [not null, default: false]
  created_at datetime [not null]
  updated_at datetime [not null]
}

Table comments {
  id int [pk, increment]
  issue_id int [not null, ref: > issues.id]
  author_id int [not null, ref: > users.id]
  content text [not null]
  created_at datetime [not null]
  updated_at datetime
}

Table votes {
  id int [pk, increment]
  issue_id int [not null, ref: > issues.id]
  user_id int [not null, ref: > users.id]
  type varchar(10) [not null] -- up | down
  Indexes {
    (issue_id, user_id) [unique]
  }
}

Ref: profiles.user_id > users.id
Ref: issues.category_id > categories.id
Ref: issues.author_id > users.id
Ref: comments.issue_id > issues.id
Ref: comments.author_id > users.id
Ref: votes.issue_id > issues.id
Ref: votes.user_id > users.id
```

Tips
- Use dbdiagram.io’s Export → PNG/JPG to save a screenshot for your Google Doc.
- Alternatively, reproduce the schema in draw.io and export an image.


## 4) API Endpoints (Methods, Auth, Params, Payloads)

Auth & User
- POST /api/token/ — obtain JWT tokens
  - Body: { username, password }
  - Returns: { access, refresh }
- POST /api/token/refresh/ — refresh access token
  - Body: { refresh }
  - Returns: { access }
- GET /api/me/ — current user profile (requires Bearer token)
  - Returns: { id, username, email, firstName, lastName, role, status, avatar, location, bio, joinedAt }
- Optional: POST /api/register/ — create a new account

Categories
- GET /api/categories/ — list all categories (public)
- POST /api/categories/ — create (admin)
  - Body: { name, description?, color? }
- PATCH /api/categories/{id}/ — update (admin)
- DELETE /api/categories/{id}/ — delete (admin)

Issues
- GET /api/issues/ — list issues (supports filters, pagination)
  - Query params: status, category, priority, search, ordering, page
  - Returns: paginated list with upvotes, downvotes, comment count
- POST /api/issues/ — create issue (auth)
  - Body: { title, description, location, imageUrl?, status?, priority?, category? }
- GET /api/issues/{id}/ — issue details (includes comments)
- PATCH /api/issues/{id}/ — update (author or admin)
- DELETE /api/issues/{id}/ — hard delete (admin) or prefer soft delete via PATCH isDeleted
- POST /api/issues/{id}/restore/ — admin restore soft-deleted issue

Votes
- POST /api/issues/{id}/vote/ — upsert a vote (auth)
  - Body: { type: 'up' | 'down' }
  - Effect: updates unique (issue_id, user_id) vote

Comments (nested under issues)
- GET /api/issues/{id}/comments/ — list comments
- POST /api/issues/{id}/comments/ — add comment (auth)
  - Body: { content }
- PATCH /api/issues/{id}/comments/{commentId}/ — edit own comment (auth)
- DELETE /api/issues/{id}/comments/{commentId}/ — delete own comment or admin

Admin: Users
- GET /api/users/?status=&role=&search= — list users (admin)
- PATCH /api/users/{id}/ — update status/role (admin)
- Optional: POST /api/users/ — invite/add (admin)

Common API behaviors
- Auth: Bearer <access_token> for protected endpoints
- Pagination: page & page_size (or default PAGE_SIZE=10)
- Ordering examples: ordering=-created_at, ordering=updated_at
- Filtering examples: status=open&category=parks&priority=high&search=pothole
- Error responses: 400 validation errors, 401 unauthenticated, 403 forbidden, 404 not found


## 5) Deliverables and Tips (Google Doc)

What to put in the Google Document
- ERD screenshot: Export from dbdiagram.io (or draw.io) and paste into the doc.
- API endpoints list: Copy the “API Endpoints” section above (and customize as needed).

Submission checklist
- The Google Doc link is publicly accessible.
- ERD shows all entities, fields, keys, and relationships.
- Endpoints cover auth, issues, comments, votes, categories, and admin user management.
- Include notes on authentication and authorization.

Optional enhancements
- Add a Settings entity if you plan to persist platform-wide configuration.
- Add AuditLog for moderation actions (admin-only).

You’re ready for Part 3: implementing the backend from this design. 🚀
