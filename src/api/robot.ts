import type { LoginResponse, Page, QueryRequest, User } from '../typings/types'
import requestWithToken from '../utils/request'

export function getRobot() {
    return requestWithToken<string>('/robot', 'GET')
}
