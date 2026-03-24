# Tarek Store

Full-stack store management system for inventory, sales, branches, suppliers, clients, orders, and reporting. The UI is primarily **Arabic**; the API is a **REST** service built with **Node.js** and **MongoDB**.

## Overview

Tarek Store helps you:

- Manage **products** (barcodes, categories, suppliers, branch-scoped stock).
- Record **transactions** (selling, purchasing, returns, maintenance, payments, recharge, output, warranty, and more).
- Handle **orders** and **checkout** flows.
- Maintain **suppliers**, **clients**, and **banks**.
- Generate **sales**, **revenue**, **stock**, **profit**, and **top-selling** reports.
- Support **multi-branch** operations with **role-based** users (e.g. admin, sales).

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, React Router, Axios, Chart.js, jsPDF, Socket.io client |
| Backend  | Express 4, Mongoose (MongoDB), JWT, bcrypt, CORS |
| Database | MongoDB Atlas (or any MongoDB URI) |

## Repository Layout

```
Tarek-Store/
├── backend/          # Express API + optional static React build
│   ├── config/       # DB connection
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route modules
│   └── server.js     # App entry
├── frontend/         # Create React App
│   └── src/
│       ├── components/
│       └── ...
├── Screens/          # UI screenshots (reference)
└── README.md
```

## API Surface (high level)

Base URL in development is typically `http://localhost:4321` (or the port set in `PORT`).

| Prefix | Purpose |
|--------|---------|
| `/api/users` | Register, login (JWT), user listing / updates |
| `/api/transactions` | Transaction records |
| `/api/products` | Products CRUD and related operations |
| `/api/branches` | Branches |
| `/api/suppliers`, `/api/clients` | Suppliers and clients |
| `/api/bank` | Bank-related data |
| `/api/categories` | Category hierarchy (main / sub / third) |
| `/api/productinvoice` | Product invoices |
| `/api/...` | Orders and report routes (mounted under `/api` per `server.js`) |

The root route `/` returns a short Arabic welcome message from the backend.

## Prerequisites

- **Node.js** 18+ (recommended; project uses Node 18 in practice)
- **npm**
- A **MongoDB** instance and connection string (e.g. MongoDB Atlas)

## Backend Setup

1. Change into the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `backend/.env` (do **not** commit real secrets):

   ```env
   PORT=4321
   MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME
   JWT_SECRET=your_long_random_secret_here
   ```

   - **`MONGO_URI`**: Must point at the database that contains your real data (database name in the URI path matters).
   - **`JWT_SECRET`**: Any strong random string used to sign tokens. Generate one with e.g. `openssl rand -base64 48`.

4. Start the server:

   ```bash
   node server.js
   ```

   The API listens on `PORT` (default **4321**).

### Serving the built frontend from Express (optional)

`server.js` can serve a production build from `backend/frontend/build`. To use that:

```bash
cd frontend
npm run build
```

Then copy or configure the build output so it lives at `backend/frontend/build` (or adjust paths in `server.js` to match your deployment). For day-to-day development, run the React dev server separately (below).

## Frontend Setup

1. Change into the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. (Optional) Point the app at your API with Create React App env vars, e.g. `frontend/.env`:

   ```env
   REACT_APP_API_URL=http://localhost:4321
   ```

   Many components currently call `http://localhost:4321` directly; aligning everything on `REACT_APP_API_URL` avoids hardcoding when you deploy.

4. Start the dev server:

   ```bash
   npm start
   ```

   The app usually opens at `http://localhost:3000`.

## Authentication

- **Register** and **login** live under `/api/users`.
- Login returns a **JWT**; protected UI routes use `ProtectedRoute` and stored token / branch / role as needed.
- **Non-admin** logins typically require a valid **`branchId`**; **admin** may omit it depending on backend rules.

## Development Notes

- API responses under `/api` are configured with **`Cache-Control: no-store`** and **ETag disabled** to reduce confusing `304` responses during development.
- Ensure **frontend** and **backend** use the **same** MongoDB database name in `MONGO_URI` as the one you inspect in Compass, or lists will appear empty even though data exists elsewhere.

## License / Ownership

This project appears to be a private or team codebase. Add your preferred **LICENSE** file if you distribute it.
