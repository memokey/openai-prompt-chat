import { ContractFactory, ethers } from "ethers"
import * as json from "@/data/abi/Prompt.json"

const { abi, bytecode } = json

export async function createNft(
  provider: ethers.providers.Web3Provider,
  price: string
) {
  if (Number.isNaN(parseFloat(price))) {
    throw new Error("price is not a string containing a number")
  }
  const signer = provider.getSigner()
  const factory = new ContractFactory(abi, bytecode, signer)
  const contract = await factory.deploy(ethers.utils.parseEther(price))
  await contract.deployTransaction.wait()

  return contract
}

export function getContract(
  provider: ethers.providers.Web3Provider,
  address: string
) {
  const signer = provider.getSigner()
  return new ethers.Contract(address, abi, signer)
}

export async function setNftUri(contract: ethers.Contract, uri: string) {
  const tx = await contract.seturi(uri)
  await tx.wait()
}

export async function getNftUri(contract: ethers.Contract) {
  return contract.geturi()
}

export async function mintNft(
  provider: ethers.providers.Web3Provider,
  contractAddress: string,
  price: string
) {
  if (Number.isNaN(parseFloat(price))) {
    throw new Error("price is not a string containing a number")
  }
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  const to = await signer.getAddress()

  const tx = await contract.safeMint(to, {
    value: ethers.utils.parseEther(price),
  })
  await provider.waitForTransaction(tx.hash)
}
