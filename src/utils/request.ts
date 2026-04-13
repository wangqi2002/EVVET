import type { Method } from 'axios'
import type { Result } from '../typings/types'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import emitter from "~/utils/bus";


const baseUrl = '/api'
const http = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
})
http.interceptors.request.use((request) => {
    // emitter.emit("debugMS", request);
    // const token = window.localStorage.getItem('token')
    // request.headers.set('token', token ?? '')
    return request
}, (error) => {
    // 对请求错误做些什么
    ElMessage.warning({ message: error.data.msg })
    return Promise.reject(error);
})
http.interceptors.response.use(
    (res) => {
        emitter.emit("debugMS", { "response": res });
        return res.data
    },
    ({ error }) => {
        emitter.emit("debugMS", { "error": error });
        if (error.data.code !== 1) {
            ElMessage.warning({ message: error.data.msg })
        }
        else {
            /* empty */
        }
        return Promise.reject(error);
    },
)
async function requestWithToken<T>(url: string, method: Method, data?: any): Promise<Result<T>> {
    emitter.emit("debugMS", { "request": { url, method, data } });
    if (method === 'get' || method === 'GET') {
        return await http({ url, method, params: data })
    }
    else {
        return await http({ url, method, data })
    }
}
export default requestWithToken
