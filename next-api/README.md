Vercel KV-backed /api/data

This minimal API uses Vercel KV to store a JSON array under the key `data`.

Endpoints:

- GET /api/data -> returns the full array
- POST /api/data -> append a new record (server assigns `id` if missing)
- PUT /api/data -> update an existing record by `id`
- DELETE /api/data -> delete a record by `id`

Notes:

- Install the runtime dependency in your Next.js project:

  npm install @vercel/kv

- Deploy on Vercel and enable the KV addon for your project. The `@vercel/kv` client will be available using the environment Vercel provides.

- This implementation stores the entire dataset under a single key. It's intentionally minimal and fast for small-to-medium datasets. For large datasets you can store individual records under separate keys.
