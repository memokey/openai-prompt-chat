import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import superjson from "superjson"
import z from "zod"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import { Chatter } from "@/services/chatGPT"
import { ChatPersona } from "@/state/chats"

export const config = {
  runtime: "edge",
}

const bodySchema = z.object({
  messages: z.array(
    z.object({
      text: z.string(),
      createdAt: z.date(),
      from: z.enum([ChatPersona.BOT, ChatPersona.USER]),
    })
  ),
})

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
})

export default async function handler(req: NextRequest): Promise<Response> {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!session?.name) return new Response("Not authorized", { status: 401 })

  if (process.env.NODE_ENV === "production") {
    const { success } = await ratelimit.blockUntilReady(session.name, 15_000)

    if (!success) {
      return new Response("Too many requests", { status: 429 })
    }
  }

  const json = await req.json()

  const body = superjson.deserialize(json)

  try {
    const { messages } = bodySchema.parse(body)

    if (process.env.OPENAI_KEY) {
      const chatter = new Chatter(process.env.OPENAI_KEY, messages)

      const title = await chatter.setTitle()

      return new Response(title.response)
    } else {
      return new Response("Server error", { status: 500 })
    }
  } catch (e) {
    console.error(e)
    return new Response("Wrong request", { status: 400 })
  }
}
