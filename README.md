# NextJS Convex Starter App

This is a starter application using NextJS and Convex, managed with NX for monorepo capabilities.

## Project Structure

- `apps/webapp`: The frontend NextJS application
- `services/backend`: The Convex backend service

## Development

### Pre-requisites

- Node.js 22 or later
- pnpm package manager
- Convex account - Register at https://www.convex.dev/

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

<br/>

# FAQ

## Why Convex?

Convex is chosen as the backend service for the following reasons:

1. **Simplicity of code generation and architecture**

   Convex follows a reactive paradigm that allows reactive queries from the client to cause automatic re-renders when a dataset has been updated. This significantly reduces complexity and amount of code required, while solving the problem of cache invalidation.

   Simple and less code required for a feature also means fewer chances for AI generated code to be incorrect.

2. **Transactionality and consistency**

   All convex mutations run "inside" of the database. Any error thrown in the mutation will result in an automatic rollback. This ensures that we are able to use a single language for both querying data and business logic, while maintaining transactionality.

3. **Simple end to end reactivity**

   Many platforms offer subscription to DB events (e.g. firebase, supabase). However, it still leaves a significant amount of code to transform the event into the actual state for your application. Convex solves this by simply providing the full state for the query's data, and does a re-render of that state when the data has been updated.

4. **Single language for frontend and backend**
