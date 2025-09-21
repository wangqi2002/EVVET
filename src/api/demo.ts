import type { LoginResponse, Page, QueryRequest, User } from '../typings/types'
import requestWithToken from '../utils/request'

export function getstring() {
  return requestWithToken<string>('/demo/get', 'GET')
}

export function poststring(id: string) {
  return requestWithToken<string>(`/demo/post`, 'POST', id)
}
