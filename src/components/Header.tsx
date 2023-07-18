import { useSession, signOut as nextauthSignOut } from "next-auth/react"
import { useSSX } from "@spruceid/ssx-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect } from "react"
import * as LitJsSdk from "@lit-protocol/lit-node-client"

export default function Header() {
  const { ssx, ssxLoaded } = useSSX()
  const { data: session, status } = useSession()
  const handleSignIn = async () => {
    await ssx?.signIn()
  }

  const signOut = useCallback(async () => {
    try {
      await ssx?.signOut()
      LitJsSdk.disconnectWeb3()
    } catch (e) {
      console.error(e)
    }
    nextauthSignOut({ callbackUrl: "/" })
  }, [ssx])

  useEffect(() => {
    if (window.ethereum && status === "authenticated") {
      window.ethereum.on("accountsChanged", async () => {
        await signOut()
      })
    }
  }, [signOut, status])

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Mindgem</a>
      </div>
      <div className="flex-none">
        <ConnectButton chainStatus={"icon"} />
        {status !== "authenticated" || !ssxLoaded ? (
          <button
            className="btn btn-square btn-ghost px-10 mx-4"
            onClick={handleSignIn}
            disabled={!ssxLoaded}
          >
            Login
          </button>
        ) : (
          <>
            <button
              className="btn btn-square btn-ghost px-10 mx-4"
              onClick={signOut}
              disabled={!ssxLoaded}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}
