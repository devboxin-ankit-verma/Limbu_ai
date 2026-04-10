# Dai Massage Platform

A full-stack platform for traditional Indian Dai Massage services.

## Stack

- **Flutter App** — Mobile app for Providers & Service Takers
- **Node.js + Express + MySQL** — REST API backend (Sequelize ORM)
- **React Admin Panel** — Web dashboard for admins (Vite + Tailwind CSS)
- **Razorpay** — Payment gateway

## Structure

```
monorepo/
├── app-flutter/       # Flutter mobile app
├── backend-node/      # Node.js REST API
└── frontend-react/    # React admin panel
```

## Setup

1. Copy `.env.example` → `.env` in each package and fill values.
2. Start MySQL and create the database.
3. Run each package separately:

```bash
# Backend
cd monorepo/backend-node && npm install && npm run dev

# Admin Panel
cd monorepo/frontend-react && npm install && npm run dev

# Flutter App
cd monorepo/app-flutter && flutter pub get && flutter run
```
