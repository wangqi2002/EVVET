import CryptoJS from 'crypto-js'
import { computed, ref } from 'vue'
import emitter from "~/utils/bus";

const apiKey = '1b0cc8a5873adc1a86126bf632754702'
const apiSecret = 'NGM5MWU1YmY2OWI0YjY5OTYxNzRjYjI1'
const app_id = 'b3095f22'

/**
 * 获取websocket url
 * 该接口需要后端提供，这里为了方便前端处理
 */
function getWebSocketUrl() {
    const url = 'wss://iat-api.xfyun.cn/v2/iat'
    const host = 'iat-api.xfyun.cn'
    const date = new Date().toUTCString()
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authorization = btoa(authorizationOrigin)
    return `${url}?authorization=${authorization}&date=${date}&host=${host}`
}

/**
 * 将音频二进制数据转换为base64编码
 * @param buffer
 * @returns {string}
 */
function bufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
}

export function useXfAsr() {
    const resultText = ref() // 识别结果
    let resultTextTemp = ''
    let iatWS = null // websocket
    let countdownInterval = null // 倒计时
    const nextTime = ref(60) // 录音时长（最大60秒）
    const recorder = new RecorderManager('/asr-sdk')
    const recordStatus = ref('CLOSED') //  CONNECTING | OPEN | CLOSING | CLOSED
    const recordText = computed(() => {
        if (recordStatus.value === 'CONNECTING') {
            return '建立连接中'
        }
        else if (recordStatus.value === 'OPEN') {
            return `录音中(${nextTime.value})`
        }
        else if (recordStatus.value === 'CLOSING') {
            return '关闭连接中'
        }
        else if (recordStatus.value === 'CLOSED') {
            return '开始录音'
        }
    })
    /**
     * 录音开始事件
     */
    recorder.onStart = () => {
        updateStatus('OPEN')
    }
    /**
     * 监听已录制完指定帧大小的文件事件。如果设置了 frameSize，则会回调此事件。
     * @param isLastFrame 当前帧是否正常录音结束前的最后一帧
     * @param frameBuffer 录音分片数据
     */
    recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
        if (iatWS.readyState === iatWS.OPEN) {
            const data = {
                data: {
                    // 0 :第一帧音频、1 :中间的音频、2 :最后一帧音频，最后一帧必须要发送
                    status: isLastFrame ? 2 : 1,
                    format: 'audio/L16;rate=16000',
                    encoding: 'raw',
                    audio: bufferToBase64(frameBuffer),
                },
            }
            iatWS.send(JSON.stringify(data))
            if (isLastFrame) {
                updateStatus('CLOSING')
            }
        }
    }
    /**
     * 录音结束事件
     */
    recorder.onStop = () => {
        clearInterval(countdownInterval)
    }

    /**
     * 倒计时
     */
    function countdown() {
        nextTime.value = 60
        countdownInterval = setInterval(() => {
            nextTime.value--
            if (nextTime.value <= 0) {
                clearInterval(countdownInterval)
                recorder.stop()
            }
        }, 1000)
    }

    /**
     * 更新状态
     * @param status CONNECTING | OPEN | CLOSING | CLOSED
     */
    function updateStatus(status) {
        recordStatus.value = status
        if (status === 'OPEN') {
            countdown()
        }
        else if (status === 'CONNECTING') {
            resultText.value = ''
            resultTextTemp = ''
        }
    }

    /**
     * 渲染识别结果
     * @param resultData
     */
    function renderResult(resultData) {
        const jsonData = JSON.parse(resultData)
        if (jsonData.data && jsonData.data.result) {
            let data = jsonData.data.result
            let str = ''
            let ws = data.ws
            for (let i = 0; i < ws.length; i++) {
                str = str + ws[i].cw[0].w
            }
            // 开启 wpgs 会有此字段(前提：在控制台开通动态修正功能)
            // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
            if (data.pgs) {
                if (data.pgs === 'apd') {
                    // 将resultTextTemp同步给resultText
                    resultText.value = resultTextTemp
                }
                // 将结果存储在resultTextTemp中
                resultTextTemp = resultText.value + str
            }
            else {
                resultText.value = resultText.value + str
            }
        }
        if (jsonData.code === 0 && jsonData.data.status === 2) {
            iatWS.close()
        }
        if (jsonData.code !== 0) {
            iatWS.close()
            console.error(jsonData)
        }
        // emitter.emit("debugMS", resultText.value);
    }

    /**
     * 开始录音
     */
    function startRecording() {
        if (recordStatus.value !== 'CLOSED')
            return
        const url = getWebSocketUrl()
        if ('WebSocket' in window) {
            iatWS = new WebSocket(url)
        }
        else if ('MozWebSocket' in window) {
            iatWS = new MozWebSocket(url)
        }
        else {
            console.error(new Error('浏览器不支持WebSocket'))
            return
        }
        updateStatus('CONNECTING')
        iatWS.onopen = (e) => {
            recorder.start({ sampleRate: 16000, frameSize: 1280 })
            const params = {
                common: { app_id },
                business: { language: 'zh_cn', domain: 'iat', accent: 'mandarin', vad_eos: 5000, dwa: 'wpgs' },
                data: { status: 0, format: 'audio/L16;rate=16000', encoding: 'raw' },
            }
            iatWS.send(JSON.stringify(params))
        }
        iatWS.onmessage = (e) => {
            renderResult(e.data)
        }
        iatWS.onerror = (e) => {
            recorder.stop()
            updateStatus('CLOSED')
        }
        iatWS.onclose = (e) => {
            recorder.stop()
            updateStatus('CLOSED')
        }
    }

    /**
     * 停止录音
     */
    function stopRecording() {
        recorder.stop()
    }

    return {
        resultText,
        recordText,
        startRecording,
        stopRecording,
    }
}
