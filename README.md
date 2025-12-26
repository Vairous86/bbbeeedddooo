# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8eb5ca98-9d49-4170-8261-e20c95cbd86e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8eb5ca98-9d49-4170-8261-e20c95cbd86e) and start prompting.

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

Simply open [Lovable](https://lovable.dev/projects/8eb5ca98-9d49-4170-8261-e20c95cbd86e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

# Next.js Project Deployment Guide

This guide explains how to deploy your Next.js project on Vercel, ensuring the Admin page and API route work correctly.

## Folder Structure

Ensure the following structure for the Admin page and API route:

```
app/
  admin/
    page.tsx  # Admin page at /admin
  api/
    data/
      route.ts  # API route at /api/data
```

## Environment Variables

Set the following environment variables in your Vercel project:

1. **API_KEY** (server-only): Used to protect write operations in the API.
2. **NEXT_PUBLIC_API_KEY** (optional, client-side): Used for client-side write operations.

### Steps to Set Environment Variables:
1. Go to your Vercel project dashboard.
2. Navigate to **Settings > Environment Variables**.
3. Add the variables:
   - `API_KEY` (e.g., `my-secure-api-key`)
   - `NEXT_PUBLIC_API_KEY` (optional, e.g., `my-public-api-key`)

## Deployment Steps

1. Push your code to a Git repository (e.g., GitHub).
2. Connect your repository to Vercel.
3. Deploy the project.

## Testing

### Admin Page
- URL: `https://[your-project].vercel.app/admin`
- Features:
  - Fetch data from `/api/data`.
  - Add, update, and delete items.
  - Real-time updates every 2 seconds.

### API Route
- URL: `https://[your-project].vercel.app/api/data`
- Methods:
  - **GET**: Fetch all data.
  - **POST**: Add new data (requires `x-api-key` header).
  - **PUT**: Update data (requires `x-api-key` header).
  - **DELETE**: Delete data (requires `x-api-key` header).

## Notes
- Ensure Vercel KV is enabled for your project.
- Test the Admin page and API route after deployment to confirm functionality.
