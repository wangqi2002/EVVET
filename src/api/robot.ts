import type { LoginResponse, Page, QueryRequest, User } from '../typings/types'
import requestWithToken from '../utils/request'

export function getRobot(data?: any) {
    return requestWithToken<string>('/robot', 'GET', data)
}
