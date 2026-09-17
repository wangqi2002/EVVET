import type { ViteSSGContext } from 'vite-ssg'

export type UserModule = (ctx: ViteSSGContext) => void

export interface BaseEntity {
    id: string
    updatedAt: string
    createdAt: string
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

// 新增：对话模式类型
export type ChatMode = 'chat' | 'work'

export interface ChatMessage extends BaseEntity {
    content: string
    role: string
    session: ChatSession
    validStatus: 'VALID' | 'INVALID'
}
// export interface ChatMessage extends BaseEntity {
//   content: string
//   role: 'user' | 'assistant' // 约束role取值，更严谨
//   sessionId: string // ✅ 修改：由完整session对象改为sessionId，消除循环引用
//   validStatus: 'VALID' | 'INVALID'
// }

export interface ChatSession extends BaseEntity {
    topic: string
    statistic: Statistic
    messages: ChatMessage[]
    createdBy: User
    validStatus: 'VALID' | 'INVALID'
    mode: ChatMode
}


export interface Result<T> {
    code: number
    success?: boolean
    msg: string
    result: T
}

export interface ChatConfig extends BaseEntity {
    model: number
    temperature: number
    maxTokens: number
    presencePenalty: number
    apiKey: string
    createdBy: User
    validStatus: 'VALID' | 'INVALID'
}

export class LoginResponse {
    tokenName!: string
    tokenValue!: string
    loginId!: string
}

export type EditMode = 'CREATE' | 'EDIT'

export interface MyFile {
    name: string
    path: string
    status: 'ready' | 'uploading' | 'finish'
    file?: File
}

export interface QueryRequest<T> {
    pageNum: number
    pageSize: number
    keyword?: string
    query?: Partial<T>
}

export interface Page<T> {
    list: T[]
    total: number
    pageSize: number
    pageNum: number
    totalPages: number
}
