//  the aim is to do logging of all the requests that are made to the server, and also log the response that is sent back to the client, this will help us to debug the application and also to monitor the performance of the application

import { createMiddleware } from '@tanstack/react-start'

const loggingMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next() // <-- This will execute the next middleware in the chain
  return result
})

export { loggingMiddleware }