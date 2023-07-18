import { z } from "zod"
import { protectedProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"

import type { Message } from "@/state/chats"
import { Prisma } from "@prisma/client"

export default router({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const chat = await ctx.prisma.chat.create({
      data: {
        name: "",
        userAddress: ctx.session.user.name,
      },
    })

    return { id: chat.id, name: chat.name, messages: [] as Message[] }
  }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.chat.deleteMany({
        where: {
          id: input.id,
          userAddress: ctx.session.user.address,
        },
      })
    }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const chat = await ctx.prisma.chat.findFirst({
        where: {
          id: input.id,
          userAddress: ctx.session.user.name,
        },
      })

      if (!chat)
        throw new TRPCError({
          code: "NOT_FOUND",
        })

      const messages = chat.messages
        .filter((message: any) => {
          return message.text && message.from && message.createdAt
        })
        .map((message) => {
          return message as unknown as Message
        })

      return {
        id: chat.id,
        name: chat.name,
        messages,
      }
    }),
  addMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        message: z.object({
          text: z.string(),
          from: z.enum(["bot", "user"]),
          createdAt: z.date(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const chat = await ctx.prisma.chat.findFirst({
        where: {
          id: input.chatId,
          userAddress: ctx.session.user.address,
        },
      })
      const messages = chat?.messages || []
      const saved = await ctx.prisma.chat.update({
        where: {
          id: input.chatId,
        },
        data: {
          messages: [
            ...messages,
            {
              ...input.message,
            },
          ] as unknown as Prisma.JsonArray,
        },
      })

      return saved
    }),
  getChatHistories: protectedProcedure.query(async ({ ctx }) => {
    const chats = await ctx.prisma.chat.findMany({
      where: {
        userAddress: ctx.session.user.name,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return chats.map(({ id, name }) => ({
      id,
      name,
    }))
  }),
  setChatTitle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const chat = await ctx.prisma.chat.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      })

      return { name: chat.name }
    }),
})
