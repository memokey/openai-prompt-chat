import "@/styles/globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit"
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets"
import { mainnet, polygon, polygonMumbai } from "@wagmi/core/chains"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import { SSXProvider } from "@spruceid/ssx-react"
import { SSXNextAuthRouteConfig } from "@spruceid/ssx-react/next-auth/frontend"
import { Provider as JotaiProvider } from "jotai"

import { trpc } from "@/utils/trpc"

const { chains, provider } = configureChains(
  [/* mainnet, polygon,  */ polygonMumbai],
  [publicProvider()]
)

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [metaMaskWallet({ projectId: "mindgem", chains })],
  },
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const appInfo = {
  appName: "Mindgem",
}

const { server } = SSXNextAuthRouteConfig({
  signInOptions: { callbackUrl: "/protected" },
})
const ssxConfig: any = {
  siweConfig: {
    domain: process.env.NEXT_PUBLIC_AUTH_URL || "localhost:3000",
  },
  providers: {
    server,
  },
}

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        <SSXProvider ssxConfig={ssxConfig}>
          <RainbowKitProvider
            chains={chains}
            appInfo={appInfo}
            theme={lightTheme()}
            modalSize="compact"
          >
            <JotaiProvider>
              <Component {...pageProps} />
            </JotaiProvider>
          </RainbowKitProvider>
        </SSXProvider>
      </SessionProvider>
    </WagmiConfig>
  )
}

export default trpc.withTRPC(App)
