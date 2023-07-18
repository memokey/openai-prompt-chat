import * as trpcNext from "@trpc/server/adapters/next"
import { appRouter } from "@/server/routers/_app"
import { createTRPCContext } from "@/server/trpc"

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
})
