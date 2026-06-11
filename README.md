# PteroControl

A modern, secure, production-ready Pterodactyl management dashboard built with Next.js 15.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

---

## Features

- **Dashboard** — real-time stats: total, running, stopped, suspended servers + resource usage
- **Server List** — filterable/searchable grid with live status, CPU/RAM/Disk bars
- **Server Details** — full info, real-time charts, environment variables, startup command
- **Console** — live WebSocket console with command input, search, auto-reconnect
- **File Manager** — browse, download, delete, rename, create folders
- **Backups** — create, download, delete backups with status tracking
- **User Management** — create users, assign roles (Owner / Admin / Moderator / Viewer)
- **Activity Log** — full audit trail of all panel actions
- **Authentication** — JWT sessions, httpOnly cookies, RBAC
- **Security** — rate limiting, CSRF-safe cookies, secure headers, no API key exposure

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS |
| State | Zustand (client), React Query (server cache) |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT via `jose`, httpOnly cookies |
| Charts | Recharts |
| Icons | Lucide React |

---

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- A running Pterodactyl panel with API access

---

## Installation

### 1. Clone and install

```bash
git clone https://github.com/yourname/pterocontrol.git
cd pterocontrol
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pterocontrol"
JWT_SECRET="generate-with: openssl rand -base64 64"
PTERODACTYL_URL="https://panel.yourdomain.com"
PTERODACTYL_APP_KEY="ptla_..."
PTERODACTYL_CLIENT_KEY="ptlc_..."
```

#### Getting Pterodactyl API keys

**Application API Key** (for listing/managing servers):
1. Log into your Pterodactyl panel as Administrator
2. Go to **Admin Area → Application API**
3. Create a new key with read permissions for Servers and Nodes

**Client API Key** (for power, console, files):
1. Click your avatar → **Account Settings**
2. Go to **API Credentials**
3. Create a new key

### 3. Set up the database

```bash
# Create the database (if it doesn't exist)
createdb pterocontrol

# Push the schema
npm run db:push

# Seed with default admin user
npm run db:seed
```

Default login after seeding:
- Email: `admin@pterocontrol.local`
- Password: `admin123`

**Change this immediately after first login.**

### 4. Run in development

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to the login page.

---

## Production Deployment

### Build

```bash
npm run build
npm run start
```

### Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Deploying to a VPS (PM2)

```bash
npm run build

# Install PM2
npm i -g pm2

# Start
pm2 start npm --name pterocontrol -- start
pm2 save
pm2 startup
```

Use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name panel.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then add SSL with Certbot: `certbot --nginx -d panel.yourdomain.com`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing (min 64 chars) |
| `PTERODACTYL_URL` | ✅ | Panel base URL (no trailing slash) |
| `PTERODACTYL_APP_KEY` | ✅ | Application API key (`ptla_...`) |
| `PTERODACTYL_CLIENT_KEY` | ✅ | Client API key (`ptlc_...`) |
| `SESSION_EXPIRY_HOURS` | ❌ | Session lifetime in hours (default: 24) |
| `NEXT_PUBLIC_APP_NAME` | ❌ | Display name (default: PteroControl) |

---

## Role Permissions

| Feature | Viewer | Moderator | Admin | Owner |
|---|---|---|---|---|
| View dashboard & servers | ✅ | ✅ | ✅ | ✅ |
| View console & files | ✅ | ✅ | ✅ | ✅ |
| Power controls (start/stop/restart) | ❌ | ✅ | ✅ | ✅ |
| File write/delete | ❌ | ✅ | ✅ | ✅ |
| Create backups | ❌ | ✅ | ✅ | ✅ |
| Delete backups | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Create users | ❌ | ❌ | ❌ | ✅ |

---

## Project Structure

```
pterocontrol/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Default admin seed
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── servers/       # Server list + detail pages
│   │   │   │   └── [id]/      # Per-server: console, files, backups
│   │   │   ├── users/         # User management
│   │   │   ├── activity/      # Audit log
│   │   │   └── settings/      # Account settings
│   │   └── api/               # API routes (never exposed to browser)
│   │       ├── auth/          # login, logout, me, change-password
│   │       ├── servers/       # list, detail, power, console, files, backups
│   │       ├── users/         # CRUD
│   │       └── activity/      # Audit log query
│   ├── components/
│   │   ├── layout/            # Sidebar, Topbar, Providers
│   │   ├── dashboard/         # Stats, PowerAll, Users, Activity, Settings
│   │   ├── servers/           # ServerCard, ServerDetail, FileManager, Backups
│   │   ├── console/           # WebSocket console view
│   │   ├── charts/            # Realtime resource charts
│   │   └── ui/                # Toast, ConfirmModal, ResourceBar, Skeleton
│   ├── lib/
│   │   ├── auth/              # JWT, session, cookie management
│   │   ├── db/                # Prisma singleton
│   │   ├── pterodactyl/       # API client + server methods
│   │   └── utils/             # cn, formatBytes, api helpers, rate limiter
│   ├── store/
│   │   ├── auth.ts            # Zustand auth store
│   │   └── ui.ts              # Zustand UI + toast store
│   └── types/
│       ├── index.ts           # App types
│       └── pterodactyl.ts     # Pterodactyl API types
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Security Notes

- API keys are stored **only** in server-side environment variables — never sent to the browser
- All Pterodactyl API requests go through backend API routes
- Sessions use httpOnly, SameSite=lax cookies (not localStorage)
- Rate limiting on all API routes (30 req/min per IP, 10 req/min for login)
- Secure headers set via `next.config.ts` (X-Frame-Options, CSP, XSS-Protection, etc.)
- All destructive actions require confirmation modals

---

## License

MIT
