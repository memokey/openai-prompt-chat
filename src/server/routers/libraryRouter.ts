import { z } from "zod"

import { protectedProcedure, router } from "../trpc"

export default router({
  hasPrompt: protectedProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ ctx, input }) => {
      const prompt = await ctx.prisma.library.findFirst({
        where: {
          userAddress: ctx.session.user.address,
          prompts: {
            some: {
              address: input.address,
            },
          },
        },
      })
      console.log("alalalal", prompt)
      return !!prompt
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.library.findFirst({
      where: {
        userAddress: ctx.session.user.address,
      },
      include: {
        prompts: true,
      },
    })
  }),
  addPrompt: protectedProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.library.upsert({
        where: {
          userAddress: ctx.session.user.address,
        },
        create: {
          userAddress: ctx.session.user.address,
          prompts: {
            connect: { address: input.address },
          },
        },
        update: {
          prompts: {
            connect: { address: input.address },
          },
        },
      })
    }),
})
