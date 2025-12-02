import type { LoginResponse, Page, QueryRequest, User } from '../typings/types'
import requestWithToken from '../utils/request'

export function getVision() {
    return requestWithToken<string>('/vision', 'GET')
}
