import type { LoginResponse, Page, QueryRequest, User } from '../typings/types'
import requestWithToken from '../utils/request'

export function getRobot(data?: any) {
    return requestWithToken<string>('/robot', 'GET', data)
}

export function getReply(data?: any) {
    return requestWithToken<string>('/robot/reply', 'GET', data)
}

export function getText(data?: any) {
    return requestWithToken<string>('/robot/text', 'GET', data)
}

export function postText(data?: any) {
    return requestWithToken<string>('/robot/text1', 'POST', data)
}
