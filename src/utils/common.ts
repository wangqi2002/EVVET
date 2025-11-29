import type { Result } from '../typings/types'
import { ElMessage } from 'element-plus'

export function assertSuccess<T>(result: Result<T>) {
    return new Promise<Result<T>>((resolve, reject) => {
        if (result.success) {
            ElMessage.success({ message: '操作成功' })
            resolve(result)
        }
        reject(result)
    })
}
