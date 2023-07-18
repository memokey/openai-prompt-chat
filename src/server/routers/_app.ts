import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, protectedProcedure } from "../trpc"

import chatRouter from "./chatRouter"
import promptsRouter from "./promptsRouter"
import marketPromptsRouter from "./marketPromptsRouter"
import libraryRouter from "./libraryRouter"

export const appRouter = router({
  chat: chatRouter,
  prompt: promptsRouter,
  marketPrompt: marketPromptsRouter,
  library: libraryRouter,
  user: router({
    getKey: protectedProcedure.query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          name: ctx.session.user.address,
        },
      })
      if (!user || !user.key) {
        throw new TRPCError({
          code: "NOT_FOUND",
        })
      }
      return {
        key: user.key,
      }
    }),
    setKey: protectedProcedure
      .input(
        z.object({
          key: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await ctx.prisma.user.update({
          where: {
            name: ctx.session.user.address,
          },
          data: {
            key: input.key,
          },
        })
        return {
          key: user.key,
        }
      }),
  }),
})

export type AppRouter = typeof appRouter
