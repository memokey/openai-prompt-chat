import { ChatOpenAI } from "langchain/chat_models/openai"
import { ConversationChain } from "langchain/chains"
import { BufferMemory, ChatMessageHistory } from "langchain/memory"
import { HumanChatMessage, AIChatMessage } from "langchain/schema"
import { PromptTemplate } from "langchain/prompts"
import { CallbackManager } from "langchain/callbacks"

import { Message } from "@/state/chats"

export class Chatter {
  private memory: BufferMemory
  private chain: ConversationChain
  private prompt: PromptTemplate
  private apiKey: string
  constructor(
    apiKey: string,
    messages?: Message[],
    modelName = "gpt-3.5-turbo"
  ) {
    const pastMessages = messages?.map((message) => {
      if (message.from === "user") {
        return new HumanChatMessage(message.text)
      } else {
        return new AIChatMessage(message.text)
      }
    })
    this.apiKey = apiKey
    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      temperature: 0.9,
      modelName,
      streaming: true,
    })
    this.prompt = PromptTemplate.fromTemplate(
      `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{chat_history}
Human: {input}
AI:`
    )

    this.memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(pastMessages),
      memoryKey: "chat_history",
    })
    this.chain = new ConversationChain({
      llm: model,
      prompt: this.prompt,
      memory: this.memory,
    })
  }

  changeModel(modelName: string) {
    const model = new ChatOpenAI({
      openAIApiKey: this.apiKey,
      temperature: 0.9,
      modelName,
      streaming: true,
    })
    this.chain = new ConversationChain({
      llm: model,
      prompt: this.prompt,
      memory: this.memory,
    })
  }

  async call(
    text: string,
    newToken: (t: string) => void,
    end: () => void,
    error: (e: Error) => void
  ) {
    return this.chain.call(
      { input: text },
      CallbackManager.fromHandlers({
        handleLLMNewToken: (token) => {
          newToken(token)
        },
        handleLLMEnd: () => {
          end()
        },
        handleLLMError: (e) => {
          error(e)
        },
      })
    )
  }

  async setTitle() {
    return this.chain.call({
      input: `Write a title for this discussion in 20 characters maximum. Just return the title and do not put any quotation marks.`,
    })
  }
}
