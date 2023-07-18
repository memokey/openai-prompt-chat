import { Contract, providers } from "ethers"
import { Bundlr } from "./bundlr"
import { Lit } from "./lit"
import { createNft, getContract, mintNft, setNftUri } from "./nft"
import { PromptDataToSell, PromptSellResult } from "@/state/prompts"

type PromptData = {
  name: string
  description: string
  price: number
  text: string
  key: string
}

export class PromptManager {
  private lit: Lit
  private bundlr: Bundlr
  private provider: providers.Web3Provider
  constructor() {
    this.provider = new providers.Web3Provider(window.ethereum)
    this.lit = new Lit()
    this.bundlr = new Bundlr(this.provider)
  }

  async setup() {
    await this.bundlr.waitForReady()
    await this.lit.connect()
  }

  async sellPrompt(
    promptData: PromptDataToSell,
    price: string,
    updateStateMessage: (message: string) => void
  ): Promise<PromptSellResult> {
    updateStateMessage("Creating Nft")
    const nft = await createNft(this.provider, price)
    updateStateMessage("Encrypting Prompt")
    const encryptedPrompt = await this.lit.encryptPrompt(
      promptData.text,
      nft.address,
      this.provider
    )
    const json = JSON.stringify({
      name: promptData.name,
      description: promptData.description,
      price: promptData.price,
      text: encryptedPrompt.encryptedString,
      key: encryptedPrompt.encryptedKey,
      tags: promptData.tags,
    })
    updateStateMessage("Uploading data")
    const jsonUrl = await this.bundlr.upload(json)
    updateStateMessage("Updating data uri")
    await setNftUri(nft, jsonUrl)

    return {
      name: promptData.name,
      description: promptData.description,
      address: nft.address,
      url: jsonUrl,
      price: promptData.price,
      tags: promptData.tags,
    }
  }

  async buyPrompt(
    address: string,
    uri: string,
    price: string,
    updateStateMessage: (message: string) => void
  ) {
    // const nft = getContract(this.provider, address)
    // const uri = getNftUri(nft)
    updateStateMessage("Minting NFT")
    await mintNft(this.provider, address, price)
    updateStateMessage("Downloading data")
    const json = (await this.bundlr.download(uri)) as PromptData
    updateStateMessage("Decrypting prompt")
    const decryptedPrompt = await this.lit.decryptPrompt(
      address,
      json.key,
      json.text,
      this.provider
    )
    return decryptedPrompt
  }

  async importPrompt(
    address: string,
    uri: string,
    updateStateMessage: (message: string) => void
  ) {
    updateStateMessage("Downloading data")
    const json = (await this.bundlr.download(uri)) as PromptData
    updateStateMessage("Decrypting prompt")
    const decryptedPrompt = await this.lit.decryptPrompt(
      address,
      json.key,
      json.text,
      this.provider
    )
    return decryptedPrompt
  }
}
