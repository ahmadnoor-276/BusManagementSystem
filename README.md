# Bus Transport Management System

A simple, full-stack web app to manage your bus fleet:

- **Buses** — register each bus with its bus number, driver name, and route.
- **Routes** — define city-to-city routes (e.g. `Nankana → Lahore`, `Faisalabad → Lahore`).

Built with **Next.js** (frontend + backend API in one project), **Prisma**, and
**SQLite** locally / **PostgreSQL** in production. Designed to run and deploy on
free tiers.

## Tech stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | Next.js (App Router) + React + Tailwind CSS |
| Backend  | Next.js Route Handlers (`app/api/*`)        |
| Database | Prisma ORM — SQLite (local), Postgres (prod)|

## Getting started (local)

Requires Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Create the local database (SQLite) and tables
npx prisma migrate dev

# 3. Start the dev server
npm run dev
```

Open http://localhost:3000. The app uses a local SQLite file (`prisma/dev.db`)
by default, so no external database is needed.

## Project structure

```
app/
  layout.tsx           # shared layout + navigation
  page.tsx             # Buses page (add + list)
  routes/page.tsx      # Routes page (add + list)
  api/
    buses/route.ts     # GET (list) + POST (create) buses
    buses/[id]/route.ts# DELETE a bus
    routes/route.ts    # GET (list) + POST (create) routes
    routes/[id]/route.ts# DELETE a route
components/            # NavBar + reusable UI
lib/prisma.ts          # Prisma client singleton
prisma/schema.prisma   # data model (Route, Bus)
```

## API reference

| Method | Endpoint          | Description                        |
| ------ | ----------------- | ---------------------------------- |
| GET    | `/api/routes`     | List all routes (with bus counts)  |
| POST   | `/api/routes`     | Create a route `{fromCity, toCity}`|
| DELETE | `/api/routes/:id` | Delete a route (and its buses)     |
| GET    | `/api/buses`      | List all buses (with their route)  |
| POST   | `/api/buses`      | Create a bus                       |
| DELETE | `/api/buses/:id`  | Delete a bus                       |

`POST /api/buses` accepts either an existing `routeId` or an inline
`newRoute: { fromCity, toCity }`.

## Deploying for free (Vercel + Neon)

1. **Create a free Postgres database** at [neon.tech](https://neon.tech) (or
   [supabase.com](https://supabase.com)) and copy the connection string.
2. **Switch Prisma to Postgres** in `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Push your code to GitHub.**
4. **Import the repo into [Vercel](https://vercel.com)** (free Hobby plan).
5. In the Vercel project settings, add an environment variable
   `DATABASE_URL` set to your Neon connection string.
6. Apply the schema to the production database (run locally with the prod URL):

   ```bash
   DATABASE_URL="<your-neon-url>" npx prisma migrate deploy
   ```

7. Deploy. The `build` script runs `prisma generate` automatically.

> Tip: keep SQLite for local development and Postgres for production. Just point
> `DATABASE_URL` at the right database in each environment.
