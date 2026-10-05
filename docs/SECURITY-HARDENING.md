# Security Hardening

Implemented boundaries:

- same-origin CSRF protection in Next.js Proxy
- HttpOnly/SameSite/Secure session cookie
- strict input validation with Zod
- login rate limiting and security-event logging
- role/permission checks at API boundaries
- IDOR-safe customer order access
- media MIME + magic-byte + size validation
- path traversal protection for media deletion
- CSP and security response headers
- request IDs for operational tracing
- idempotency protection for sale creation

Before connecting external email/SMS/payment providers, keep provider secrets server-only and verify every callback server-side.
