import type { LoginResponse, Page, QueryRequest, User } from '../typings/types'
import requestWithToken from '../utils/request'

export function queryUser(query: QueryRequest<User>) {
  return requestWithToken<Page<User>>('/user/query', 'POST', query)
}

export function saveUser(data: Partial<User>) {
  if (data.id) {
    return requestWithToken<string>(`/user/${data.id}/update`, 'POST', data)
  }
  return requestWithToken<string>('/user/create', 'POST', data)
}
export function findUserById(id: string) {
  return requestWithToken<User>(`/user/${id}`, 'GET', {})
}

export function invalidUser(id: string) {
  return requestWithToken<boolean>(`/user/${id}/invalid`, 'POST', {})
}
export function validUser(id: string) {
  return requestWithToken<boolean>(`/user/${id}/valid`, 'POST', {})
}
export function deleteUser(ids: string[]) {
  return requestWithToken<boolean>(`/user/delete`, 'POST', ids)
}
export function loginUser(user: Partial<User>) {
  return requestWithToken<LoginResponse>('/user/login', 'POST', user)
}
export function getUserInfo() {
  return requestWithToken<User>('/user/info', 'GET')
}
