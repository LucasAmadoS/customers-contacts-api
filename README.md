# Customers & Contacts API

A Node.js REST API for managing customers, each customer's contacts, and the system's users. It includes JWT authentication, avatar upload, and a welcome email sent through a background job queue.

Built while following a Node.js back-end course, then reviewed with a focus on security and error handling.

## Tech stack

- **Node.js** + **Express 5**
- **PostgreSQL** + **Sequelize** (ORM and migrations)
- **JWT** + **bcrypt** for authentication
- **Yup** for data validation
- **Multer** for file uploads
- **Bee-Queue** + **Redis** for the job queue
- **Nodemailer** (tested with Mailtrap) for sending emails

## Features

- CRUD for **customers** and each customer's **contacts** (one-to-many relationship)
- CRUD for **users** with hashed passwords. Users can only update or delete their own account
- Changing the password requires the current password
- **JWT** login. Every route except sign-up and login requires a token
- List endpoints with **filters** (name, email, status, date range), **sorting** and **pagination**
- **Avatar upload** (JPG, PNG, GIF or WEBP, up to 5 MB) linked to the user
- **Welcome email** sent through a queue, retried up to 3 times on failure
- **Centralized error handling** with clear responses (400, 401, 403, 404, 409)

## Getting started

Requirements: Node.js 20.12+, PostgreSQL and Redis running.

```bash
# 1. Install dependencies
npm install

# 2. Create .env from the example and fill it in
cp .env.example .env

# 3. Run the migrations
npx sequelize-cli db:migrate

# 4. Start the API (http://localhost:3000)
npm run start:dev

# 5. In another terminal, start the email queue worker
npm run queue
```

## Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/users` | Sign up | — |
| POST | `/sessions` | Log in (returns the token) | — |
| GET | `/users` | List users | ✔ |
| GET | `/users/:id` | Get a user | ✔ |
| PUT | `/users/:id` | Update your own user | ✔ |
| DELETE | `/users/:id` | Delete your own user | ✔ |
| POST | `/files` | Upload a file (field `file`) | ✔ |
| GET | `/files/:filename` | View an uploaded file | — |
| GET | `/customers` | List customers | ✔ |
| GET | `/customers/:id` | Get a customer with its contacts | ✔ |
| POST | `/customers` | Create a customer | ✔ |
| PUT | `/customers/:id` | Update a customer | ✔ |
| DELETE | `/customers/:id` | Delete a customer | ✔ |
| GET | `/customers/:customerId/contacts` | List a customer's contacts | ✔ |
| GET | `/customers/:customerId/contacts/:id` | Get a contact | ✔ |
| POST | `/customers/:customerId/contacts` | Create a contact | ✔ |
| PUT | `/customers/:customerId/contacts/:id` | Update a contact | ✔ |
| DELETE | `/customers/:customerId/contacts/:id` | Delete a contact | ✔ |

Routes marked ✔ require the `Authorization: Bearer <token>` header.

### List filters

```
GET /customers?name=silva&status=active&createdAfter=2026-01-01&sort=name:asc&page=1&limit=10
```

| Parameter | Usage |
|---|---|
| `name`, `email` | partial, case-insensitive match |
| `status` | `active`, `archived` or `active,archived` (customers and contacts) |
| `createdAfter`, `createdBefore` | ISO date, e.g. `2026-01-31` |
| `updatedAfter`, `updatedBefore` | ISO date |
| `sort` | `field:asc` or `field:desc`, comma-separated |
| `page`, `limit` | pagination (25 per page by default, 100 max) |

## Project structure

```
src/
├── app/
│   ├── controllers/   # route handlers
│   ├── models/        # Sequelize models
│   ├── middlewares/   # authentication and error handling
│   ├── helpers/       # list filters builder
│   ├── jobs/          # queue jobs (welcome email)
│   └── errors/
├── config/            # database, JWT, email, Redis, upload
├── database/          # connection and migrations
├── lib/               # queue and mailer
├── routes.js
├── app.js
├── server.js          # API entry point
└── queue.js           # queue worker entry point
```

## Author

**Lucas Amado** — [LinkedIn](https://www.linkedin.com/in/lucasamadosp/) · [GitHub](https://github.com/LucasAmadoS)
