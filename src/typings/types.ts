import type { ViteSSGContext } from 'vite-ssg'

export type UserModule = (ctx: ViteSSGContext) => void

export interface ChatMessage extends BaseEntity {
  content: string
  role: string
  session: ChatSession
  validStatus: 'VALID' | 'INVALID'
}

export interface ChatSession extends BaseEntity {
  topic: string
  statistic: Statistic
  messages: ChatMessage[]
  createdBy: User
  validStatus: 'VALID' | 'INVALID'
}

export interface Statistic {
  chatCount: number
  tokenCount: number
  wordCount: number
}

export interface User extends BaseEntity {
  avatar: string
  nickname: string
  username: string
  password: string
}

export interface BaseEntity {
  id: string
  updatedAt: string
  createdAt: string
  validStatus: 'VALID' | 'INVALID'
}
