import * as LitJsSdk from "@lit-protocol/lit-node-client"
import { ethConnect } from "@lit-protocol/auth-browser"
import { providers } from "ethers"

export class Lit {
  private client: LitJsSdk.LitNodeClient
  constructor(litNetwork = "serrano") {
    this.client = new LitJsSdk.LitNodeClient({
      litNetwork,
    })
  }

  async connect() {
    await this.client.connect()
  }

  async encryptPrompt(
    prompt: string,
    contractAddress: string,
    provider: providers.Web3Provider,
    chain = "mumbai"
  ) {
    const signer = provider.getSigner()
    const accounts = await provider.send("eth_requestAccounts", [])
    const account = accounts[0]
    const chainId = await signer.getChainId()
    const authSig = await ethConnect.signAndSaveAuthMessage({
      web3: provider,
      account,
      resources: "",
      chainId,
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      prompt
    )
    const accessControlConditions = [
      {
        contractAddress,
        standardContractType: "ERC721",
        chain,
        method: "balanceOf",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: ">",
          value: "0",
        },
      },
    ]
    const encryptedSymmetricKey = await this.client.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    })

    return {
      encryptedKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        "base16"
      ),
      encryptedString: await LitJsSdk.blobToBase64String(encryptedString),
    }
  }

  async decryptPrompt(
    contractAddress: string,
    keyToDecrypt: string,
    encryptedPrompt: string,
    provider: providers.Web3Provider,
    chain = "mumbai"
  ) {
    let _symmetricKey
    const signer = provider.getSigner()
    const accounts = await provider.send("eth_requestAccounts", [])
    const account = accounts[0]
    const chainId = await signer.getChainId()
    const authSig = await ethConnect.signAndSaveAuthMessage({
      web3: provider,
      account,
      resources: "",
      chainId,
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    })
    const accessControlConditions = [
      {
        contractAddress,
        standardContractType: "ERC721",
        chain,
        method: "balanceOf",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: ">",
          value: "0",
        },
      },
    ]
    try {
      _symmetricKey = await this.client.getEncryptionKey({
        accessControlConditions,
        toDecrypt: keyToDecrypt,
        chain,
        authSig,
      })
    } catch (_) {
      throw new Error("Cannot get the decryption key")
    }

    let decryptedString
    if (_symmetricKey) {
      try {
        const encryptedPromptBlob = LitJsSdk.base64StringToBlob(encryptedPrompt)
        decryptedString = await LitJsSdk.decryptString(
          encryptedPromptBlob,
          _symmetricKey
        )
      } catch (e) {
        throw new Error("Cannot decrypt the prompt")
      }
    }

    return decryptedString
  }
}
