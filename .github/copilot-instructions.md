
# Rules to follow whatever  user intructions are:
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