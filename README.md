# Svelte Convex Starter App

This is a starter application using Svelte and Convex, managed with NX for monorepo capabilities.

## Project Structure

- `apps/webapp`: The frontend Svelte application
- `services/backend`: The Convex backend service

## Development

To run both the frontend and backend in parallel:

```bash
pnpm run dev
```

This will start:
- The webapp at http://localhost:3000
- The Convex backend development server

## NX Configuration

This project uses NX to manage the monorepo and run tasks in parallel. The main configuration files are:

- `nx.json`: Main NX configuration
- `apps/webapp/project.json`: Webapp project configuration
- `services/backend/project.json`: Backend project configuration

The dev command is configured to run both services in parallel without dependencies between them, allowing for independent development.

## Adding New Projects

To add a new project to the monorepo:

1. Create the project in the appropriate directory (`apps/` or `services/`)
2. Add a `project.json` file to define the project's targets
3. Update the root `package.json` to include the new project in the dev command if needed
