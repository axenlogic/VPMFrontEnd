# Virtual Peace of Mind Frontend

A modern React + TypeScript frontend for the Virtual Peace of Mind management system with JWT authentication, user profile management, and a beautiful UI built with shadcn/ui.

## Project info

**URL**: https://lovable.dev/projects/81ec6d2a-ef6f-4a84-a81e-a4927f29d6c7

## Environment Setup

### Required Environment Variables

This project uses Vite, which requires environment variables to be prefixed with `VITE_`.

**For Local Development:**

Create a `.env.local` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

**For Production:**

Create a `.env.production` file:

```bash
VITE_API_BASE_URL=/api
VITE_ENV=production
```

When deploying behind Nginx, proxy `/api` to the live Cloud Run service (`https://medicalcare-api-52493984131.us-central1.run.app`).

**Note:** `.env.local` and `.env.production` files are gitignored. Never commit real API URLs or secrets.

### Backend Integration

See `BACKEND_INTEGRATION.md` for detailed instructions on connecting to the backend API.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/81ec6d2a-ef6f-4a84-a81e-a4927f29d6c7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/81ec6d2a-ef6f-4a84-a81e-a4927f29d6c7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
