import type { Method } from 'axios'
import type { Result } from '../typings/types'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import emitter from "~/utils/bus";


const baseUrl = '/api'
const http = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
})
http.interceptors.request.use((request) => {
  // const token = window.localStorage.getItem('token')
  // request.headers.set('token', token ?? '')
  return request
})
http.interceptors.response.use(
  (res) => {
    return res.data
  },
  ({ response }) => {
    if (response.data.code !== 1) {
      ElMessage.warning({ message: response.data.msg })
    }
    else {
      /* empty */
    }
    return response.data
  },
)
async function requestWithToken<T>(url: string, method: Method, data?: any): Promise<Result<T>> {
  emitter.emit("debugMS", {value:data,
      url: url,
    });
  if (method === 'get' || method === 'GET') {
    return await http({ url, method, params: data })
  }
  else {
    return await http({ url, method, data })
  }
}
export default requestWithToken
