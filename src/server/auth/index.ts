import type { NextApiRequest, NextApiResponse } from "next"
import type { GetServerSidePropsContext } from "next"
import { AuthOptions, ISODateString, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SSXNextAuth } from "@spruceid/ssx-react/next-auth/backend"
import { SSXServer } from "@spruceid/ssx-server"
import { IncomingMessage, ServerResponse } from "http"

import { prisma } from "@/server/db"

export type UserSession = {
  user: {
    name: string
    email?: string | null
    image?: string | null
    address: string
    did: string
  }
  expires: ISODateString
}

export const authOptions = (
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse
) => {
  const ssxConfig = {}
  const ssx = new SSXServer(ssxConfig)
  const { credentials, authorize } = SSXNextAuth(req as NextApiRequest, ssx)

  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials,
      authorize,
    }),
  ]

  return {
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      session: (sessionData: any) => {
        const { session, token } = sessionData
        if (session.user) {
          session.user.address = token.name
          session.user.did = token.sub
        }
        return session
      },
      signIn: async ({ user }) => {
        if (user && user.name) {
          const userData = await prisma.user.findUnique({
            where: {
              name: user.name,
            },
          })
          if (!userData) {
            await prisma.user.create({
              data: { name: user.name },
            })
          }
        }

        return true
      },
    },
  } as AuthOptions
}

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"]
  res: GetServerSidePropsContext["res"]
}) => {
  return getServerSession(
    ctx.req,
    ctx.res,
    authOptions(ctx.req, ctx.res)
  ) as Promise<UserSession>
}
