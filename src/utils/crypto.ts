import * as eth from "@polybase/eth"
import cryptojs from "crypto-js"

export async function encryptKey(key: string) {
  const accounts = await eth.requestAccounts()
  const account = accounts[0]
  return eth.encrypt(key, account)
}

export async function decryptKey(key: string) {
  const accounts = await eth.requestAccounts()
  const account = accounts[0]
  return eth.decrypt(key, account)
}

export function getNewKey() {
  const KEY_SIZE = 256
  const array = new Uint8Array(KEY_SIZE / 8)
  const key = window.crypto.getRandomValues(array)
  return new TextDecoder().decode(key)
}

export function encryptText(text: string, keyString: string) {
  return cryptojs.AES.encrypt(text, keyString).toString()
}

export function decryptText(encryptedMessage: string, stringKey: string) {
  const decryptedMessageBytes = cryptojs.AES.decrypt(
    encryptedMessage,
    stringKey
  )
  return decryptedMessageBytes.toString(cryptojs.enc.Utf8)
}
