# EMDICO Website

Static marketing site with a Node-based email relay used by the contact form.

## Contact form email relay

The contact form (`#contactForm`) now posts to `/api/contact`. A lightweight Express server located in `server/` receives the payload and sends an email using SMTP via Nodemailer.

### Setup

```powershell
cd server
npm install
copy .env.example .env
```

Edit the newly created `.env` file with your SMTP credentials:

- `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` describe your SMTP server connection.
- `SMTP_USER` and `SMTP_PASS` are the credentials for authentication.
- `SMTP_FROM` is optional; defaults to `SMTP_USER`.
- `CONTACT_TO` is the email address that should receive form submissions.
- Set `ALLOWED_ORIGINS` to a comma-separated list of origins allowed to call the API (e.g., `http://localhost:5500`).

### Run the relay locally

```powershell
cd server
npm run dev
```

This starts the API at `http://localhost:4000/api/contact`. When serving the static site locally, ensure the origin matches what you listed in `ALLOWED_ORIGINS`.

### Deploying the relay

Deploy the contents of `server/` to any Node-compatible hosting provider (Render, Railway, Vercel serverless, traditional VPS, etc.). Configure the environment variables there as you did locally.

## Frontend integration

The frontend script in `JS/form.js` handles submission asynchronously, disables the submit button during the request, and shows human-readable success and error messages without opening a mail client popup.
