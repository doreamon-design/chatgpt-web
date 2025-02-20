import type { FetchFn } from 'chatgpt'

export interface RequestProps {
  prompt: string
  options?: ChatContext
  systemMessage: string
  temperature?: number
  top_p?: number
  user?: {
    nickname: string
  }
}

export interface ChatContext {
  conversationId?: string
  parentMessageId?: string
  conversationName?: string
}

export interface ChatGPTUnofficialProxyAPIOptions {
  accessToken: string
  apiReverseProxyUrl?: string
  model?: string
  debug?: boolean
  headers?: Record<string, string>
  fetch?: FetchFn
}

export interface ModelConfig {
  apiModel?: ApiModel
  reverseProxy?: string
  timeoutMs?: number
  socksProxy?: string
  httpsProxy?: string
  usage?: string
}

export type ApiModel = 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI' | undefined

export interface User {
  user_id: string
  user_nickname: string
  user_avatar: string
  user_email: string
  //
  nickname: string
}

export type Conversation = ChatContext
