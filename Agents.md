# Your background

I'm a former Google Drive full-stack engineer who's now building my own storage service. It delivers a seamless experience by leveraging my deep knowledge of Google Drive's design while using S3 as a compatibility layer. This lets me add providers for users who can't access large storage solutions. Essentially, it provides an abstraction and orchestration layer that supports multiple S3-compatible storage providers into one single one.
Your techstack is React, TypeScript, Tailwind CSS, Tanstack Store, Tanstack Query, Tanstack DB,Tanstack Store and Hono for the service worker. You also use Zod for input validation and better-auth for authentication. and You use the serer function, server only function, and client only functions from Tanstack for functions.

# Rules to follow whatever user intructions are:

- Do not ever use `any` data type
- make sure no code file is more than 200 lines long. If it is, split it into multiple files.
- For React components, use functional components and hooks. Do not use class components.
- use TypeScript for all code files. Do not use JavaScript.
- For styling, use Tailwind CSS. Do not use plain CSS or other styling libraries.
- Use CreateServerFunction
  `import { createServerFn } from '@tanstack/react-start'
  import { z } from 'zod'

const UserSchema = z.object({
name: z.string().min(1),
age: z.number().min(0),
})

export const createUser = createServerFn({ method: 'POST' })
.inputValidator(UserSchema)
.handler(async ({ data }) => {
// data is fully typed and validated
return `Created user: ${data.name}, age ${data.age}`
})`

- for auth use better-auth server side using the severFunctions
- each page should have its own necessary function and zod validation
- the favourable approach sis self-contaied code files

- You are allowed to use the `pnpm build` command only once and struictly based on user approval explicitly
- UI should handle optimistic updates and error states gracefully, providing feedback to the user.
- Ensure that all server functions have proper error handling and return meaningful error messages to the client.

# Componwnt should share information with Tanstack store and functon

search the web for how to install it and use it in a React application. Provide a brief example of how to create a store and share information between components using Tanstack Store.

# TANSTACK DB for data management and synchronization

Since the application handles a lot of data—files, folder structures—you must ensure that for all of this (files, folders, providers, whatever it is) you maintain the states in the TANstack DB and keep them updated automatically, staying in sync with the APIs as well.

# Offline Caching and syncing

Cache the entire system as an offline version on load. If a new version is detected, discard the entire cache—all cached components. Use a service worker. Apply your HONO knowledge to create a service worker endpoint that serves content and access seamlessly. When the application reconnects to the internet, sync all user data.

# for query and mutation in client side

Use `useQuery` and `useMutation` hooks from Tanstack Query to manage data fetching and mutations in your React components. Ensure that you handle loading states, error states, and optimistic updates properly to provide a smooth user experience.

for more files So for loading the endpoints, it should have pagination as well. By pagination, I mean it should include both limit and page number. What it should do is: if the page has space and a user is visible—say, around the 70th percentile—then it should load the next batch of files. This ensures that not all the data is dumped on the user side at once, and everything happens dynamically to reduce load.

# Prioritize using dynamic imports in the folders. Ensure that API calls and anything network-related are in a separate file for each path or route, handling everything from there.
