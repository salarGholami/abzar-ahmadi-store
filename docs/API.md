# API contract

All APIs return:
`{ success: true, data }` on success and
`{ success: false, error: { code, message } }` on failure.

Protected routes always perform:
authenticate → authorize → validate → execute → audit.

Core write endpoints:
- POST /api/admin/products
- PATCH/DELETE /api/admin/products/:id
- POST /api/admin/customers
- PATCH/DELETE /api/admin/customers/:id
- POST /api/sales/create
- POST /api/inventory/adjust
- POST /api/auth/reset-password
