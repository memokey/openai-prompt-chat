import { WebBundlr } from "@bundlr-network/client"
import { ethers } from "ethers"

export class Bundlr {
  private bundlr: WebBundlr
  constructor(
    provider: ethers.providers.Web3Provider,
    url = "https://devnet.bundlr.network",
    currency = "matic"
  ) {
    this.bundlr = new WebBundlr(url, currency, provider)
  }

  async waitForReady() {
    return this.bundlr.ready()
  }

  async upload(data: string) {
    // TODO: change data to the proper json object
    let amount = new TextEncoder().encode(data).length
    const priceAtomic = await this.bundlr.getPrice(amount)
    await this.bundlr.fund(priceAtomic)
    const response = await this.bundlr.upload(data)
    return `https://arweave.net/${response.id}`
  }

  async download(uri: string) {
    let res = await fetch(uri)
    return res.json()
  }
}
