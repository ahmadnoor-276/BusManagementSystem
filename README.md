# Al Noor Travels - Bus Management System

A full-stack web app to manage a bus service:

- **Bus Schedules** (public) — anyone can pick a route and see scheduled bus
  departures, earliest first.
- **Buses** (admin) — register each bus with its bus number, driver, and route.
- **Drivers** (admin) — store driver info (name, gender, age, contact, address);
  drivers are selectable when adding a bus.
- **Routes** (admin) — define city-to-city routes (e.g. `Nankana → Lahore`).
- **Manage Times** (admin) — set departure times for buses on their routes.

Built with **Next.js** (frontend + backend API in one project), **Prisma**, and
**SQLite** locally / **PostgreSQL** in production. Designed to run and deploy on
free tiers.

## Tech stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | Next.js (App Router) + React + Tailwind CSS    |
| Backend  | Next.js Route Handlers (`app/api/*`)           |
| Database | Prisma ORM — SQLite (local), Postgres (prod)   |
| Auth     | bcrypt password hashing + signed JWT (`jose`)  |

## Getting started (local)

Requires Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy the example and edit the values)
cp .env.example .env
#    - set AUTH_SECRET to a long random string:
#        node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
#    - set ADMIN_EMAIL and ADMIN_PASSWORD

# 3. Create the local database (SQLite) and tables
npx prisma migrate dev

# 4. Create the admin account from ADMIN_EMAIL / ADMIN_PASSWORD
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000. The public **Bus Schedules** page is the home page.
Click **Sign In** and log in with your admin credentials to access the Buses,
Routes, and Manage Times sections.

## Authentication & authorization

- **Public**: the home page and the read-only endpoints `GET /api/routes` and
  `GET /api/schedules` (needed to display schedules).
- **Admin only**: the `/buses`, `/routes`, and `/schedules` pages plus every
  write endpoint and the buses listing.

Security measures:

- Passwords are stored only as **bcrypt** hashes (cost 12); the plaintext is
  never persisted.
- Sessions are **signed JWTs** (HS256 via `jose`) stored in an **HttpOnly**,
  `SameSite=Lax` cookie (marked `Secure` in production), so the token is not
  readable by JavaScript and is not sent on cross-site requests.
- **Defense in depth**: `middleware.ts` guards admin pages, and every admin API
  route independently re-checks the session with `requireAdmin()` — protection
  never relies on hiding UI or on the middleware alone.
- Login returns a generic "Invalid email or password" and always runs a bcrypt
  comparison to limit user enumeration and timing leaks.

To rotate the admin password, update `ADMIN_PASSWORD` in `.env` and re-run
`npm run db:seed`.

## Project structure

```
app/
  layout.tsx                 # shared layout + navigation
  page.tsx                   # public Bus Schedules viewer
  login/page.tsx             # admin sign-in
  buses/page.tsx             # (admin) manage buses
  routes/page.tsx            # (admin) manage routes
  schedules/page.tsx         # (admin) manage departure times
  api/
    auth/login|logout|me     # session endpoints
    buses/...                # buses CRUD (admin)
    routes/...               # routes CRUD (GET public)
    schedules/...            # schedules CRUD (GET public)
components/                  # NavBar + reusable UI
lib/prisma.ts                # Prisma client singleton
lib/session.ts               # JWT sign/verify (edge-safe)
lib/auth.ts                  # bcrypt + session helpers (node)
middleware.ts                # route guard for admin pages
prisma/schema.prisma         # data model (User, Driver, Route, Bus, Schedule)
prisma/seed.js               # creates/updates the admin account
```

## API reference

| Method | Endpoint             | Access | Description                          |
| ------ | -------------------- | ------ | ------------------------------------ |
| POST   | `/api/auth/login`    | public | Log in `{email, password}`           |
| POST   | `/api/auth/logout`   | public | Clear the session                    |
| GET    | `/api/auth/me`       | public | Current session user (or `null`)     |
| GET    | `/api/routes`        | public | List routes (with bus counts)        |
| POST   | `/api/routes`        | admin  | Create a route `{fromCity, toCity}`  |
| DELETE | `/api/routes/:id`    | admin  | Delete a route (and its buses)       |
| GET    | `/api/buses`         | admin  | List buses (with route + driver)     |
| POST   | `/api/buses`         | admin  | Create a bus `{busNumber, driverId}` |
| DELETE | `/api/buses/:id`     | admin  | Delete a bus                         |
| GET    | `/api/drivers`       | admin  | List drivers (with bus counts)       |
| POST   | `/api/drivers`       | admin  | Create a driver                      |
| DELETE | `/api/drivers/:id`   | admin  | Delete a driver (unassigns buses)    |
| GET    | `/api/schedules`     | public | List schedules (asc; `?routeId=`)    |
| POST   | `/api/schedules`     | admin  | Create a schedule `{busId, time}`    |
| DELETE | `/api/schedules/:id` | admin  | Delete a schedule                    |

`POST /api/buses` accepts either an existing `routeId` or an inline
`newRoute: { fromCity, toCity }`. `departureTime` is 24-hour `HH:MM`.

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
5. In the Vercel project settings, add environment variables: `DATABASE_URL`,
   `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
6. Apply the schema and seed the admin (run locally with the prod URL):

   ```bash
   DATABASE_URL="<your-neon-url>" npx prisma migrate deploy
   DATABASE_URL="<your-neon-url>" npm run db:seed
   ```

7. Deploy. The `build` script runs `prisma generate` automatically.

> Tip: keep SQLite for local development and Postgres for production. Just point
> `DATABASE_URL` at the right database in each environment.
