# AI Agent Guidelines — Tarmigt Commune

For project overview, architecture, installation, and API documentation, see [README.md](README.md).

## Development Workflow

**Start here first:**
```bash
npm install
# Setup database:
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
# Run development server:
npm run dev
```

**Environment setup:** Copy `.env.example` to `.env` and configure DB credentials (defaults: `localhost`, user `root`, no password). Generate a strong `JWT_SECRET` for production.

## Code Patterns & Conventions

### Bilingual Content
- **Database tables** use `_fr` and `_ar` suffixes for content: `titre_fr`, `titre_ar`, `contenu_fr`, `contenu_ar`
- **Frontend** switches language via `lang.js` with RTL support for Arabic
- **Routes** return bilingual object: `{ titre_fr, titre_ar, contenu_fr, contenu_ar, ... }`

### Database & Fallback Pattern
- **Primary**: MySQL via connection pool (`config/db.js`)
- **Fallback**: JSON files in `data/` if database unavailable—keep both in sync if modifying
- **Validation**: Use `safeId()` for ID params to prevent injection; `sanitize()` strips HTML tags

### Authentication & Admin Routes
- **JWT middleware** in `middleware/auth.js` validates tokens (24h expiry); requires `Authorization: Bearer <token>` header
- **Admin endpoints** (`/api/admin/*`): login, create/update/delete actualités/services
- **Rate limiting**: Login (10 attempts/15min), contact form (10 requests/15min)
- **Password hashing**: `bcryptjs` used; never store plain text

### File Uploads
- **Multer config**: Images only, 5MB max, stored in `/uploads/`
- **No cleanup**: Uploads persist indefinitely—consider manual cleanup in production
- **Validation**: Check `mimetype` and file size in routes before saving

### Error Handling Pattern
Routes catch errors and return fallback JSON data. When modifying endpoints, preserve this fallback behavior:
```javascript
try {
  // query database
} catch (error) {
  return res.json(fallbackData); // from data/*.json
}
```

## Security Considerations

- **Global CORS enabled** for all origins/methods—restrict in production
- **CSP disabled** in Helmet config—re-enable after testing
- **JWT_SECRET hardcoded default** (`tarmigt-admin-secret-key-2026`)—must change via `.env`
- **No session logout**: Tokens valid until expiry; implement token blacklist if needed
- **Input sanitization**: Always use `safeId()` and `sanitize()` before saving

## Common Pitfalls

1. **Missing `.env`**: Server will fail to connect to MySQL. Use defaults or provide `.env`.
2. **Database not seeded**: Must run both `schema.sql` and `seed.sql`; no admin user created by default—add via direct SQL INSERT.
3. **JSON fallback stale**: If you modify DB directly, JSON files won't update. Keep consistent or remove fallback.
4. **JWT expiry debugging**: Token valid for 24 hours; if admin session expires, user must re-login.
5. **File upload paths**: Multer stores in `uploads/`; verify this directory exists and is writable.

## Key Files

| File/Path | Purpose |
|-----------|---------|
| `server.js` | Express app entry point; middleware setup (auth, rate limit, CORS, Helmet) |
| `routes/actualites.js`, `routes/services.js` | GET/POST endpoints with DB fallback logic |
| `routes/admin.js` | CRUD endpoints for admin panel; JWT-protected |
| `config/db.js` | MySQL connection pool (10 max connections) |
| `middleware/auth.js` | JWT token validation, 24h expiry |
| `public/js/lang.js` | Bilingual language switching and RTL support |
| `db/schema.sql` | Table definitions with UTF-8mb4 for Arabic |
| `data/*.json` | Fallback data if database unavailable |

## Before Making Changes

- **Bilingual content**: Ensure both `_fr` and `_ar` fields exist
- **Database operations**: Test with `npm run dev` first; verify schema matches route assumptions
- **Admin routes**: All protected routes require valid JWT token
- **Security**: Never log sensitive data (passwords, tokens); sanitize all user input
