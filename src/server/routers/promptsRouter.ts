import { z } from "zod"

import { protectedProcedure, router } from "../trpc"
import * as Prisma from "@prisma/client"
import { Prompt } from "@/state/prompts"

function mapAllowedPromptProps(prompt: Prisma.Prompt): Prompt {
  return {
    name: prompt.name,
    text: prompt.text,
    id: prompt.id,
    createdAt: prompt.createdAt,
  }
}

export default router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        text: z.string(),
        createdAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.prisma.prompt.create({
        data: {
          name: input.name,
          text: input.text,
          createdAt: input.createdAt,
          userAddress: ctx.session.user.address,
        },
      })

      return mapAllowedPromptProps(prompt)
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.prompt.deleteMany({
        where: {
          id: input.id,
          userAddress: ctx.session.user.address,
        },
      })

      return {
        id: input.id,
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = await ctx.prisma.prompt.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          text: input.text,
        },
      })

      return mapAllowedPromptProps(prompt)
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const prompts = await ctx.prisma.prompt.findMany({
      where: {
        userAddress: ctx.session.user.address,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return prompts.map(mapAllowedPromptProps)
  }),
})
