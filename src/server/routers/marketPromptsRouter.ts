import { z } from "zod"

import { protectedProcedure, router } from "../trpc"

export default router({
  create: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        url: z.string(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.prisma.marketPrompt.create({
        data: {
          address: input.address,
          name: input.name,
          description: input.description,
          price: input.price,
          url: input.url,
          creator: ctx.session.user.address,
          tags: {
            create: input.tags.map((tag) => ({ name: tag })),
          },
        },
      })

      return prompt
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.marketPrompt.findMany({
      include: {
        tags: true,
      },
    })
  }),
})
