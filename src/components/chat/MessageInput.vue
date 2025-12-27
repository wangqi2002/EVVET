<script lang="ts" setup>
import { Position, Microphone } from "@element-plus/icons-vue";
import { ref } from "vue";
import emitter from "~/utils/bus";
import { getReply, getText } from "~/api/robot";
import dayjs from "dayjs";
import Recorder from 'js-audio-recorder';

// 发送消息消息事件
const emit = defineEmits<{
    send: [message: string];
}>();

const props = defineProps<{
    isInSession: () => boolean;
}>();

// 输入框内的消息
const message = ref("");

const isListening = ref(false);
const timeOutEvent = ref<ReturnType<typeof setTimeout> | null>(null);
const record = new Recorder({
    sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
    sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
    numChannels: 1, // 声道，支持 1 或 2， 默认是1
    // compiling: false,(0.x版本中生效,1.x增加中)  // 是否边录边转换，默认是false
})

async function sendMessage() {
    if (!props.isInSession()) {
        emitter.emit("createNewSession");
    }
    emit("send", message.value);
    const userMessage = message.value;
    const requestValue = { question: message.value }
    message.value = "";
    const data = await getReply(requestValue); // 获取答复内容
    // emitter.emit("debugMS", data);
    // const data = "这是机器人回复的示例内容。"; // 示例回复内容
    emitter.emit("addReplyMessage", { userMessage, replyMessage: data }); // 发送事件
}
function goTouchstart() {
    timeOutEvent.value = setTimeout(() => {
        isListening.value = true;
        startRecordAudio();
    }, 200); // 长按200毫秒后，触发长按事件
}
// 手如果在200毫秒内就释放，则取消长按事件
async function goTouchend() {
    if (isListening.value) {
        timeOutEvent.value = null;
        record.stop();
        isListening.value = false;
        const wavBlob = record.getWAVBlob();
        // 此处获取到blob对象后需要设置fileName满足当前项目上传需求，其它项目可直接传把blob作为file塞入formData
        const newbolb = new Blob([wavBlob], { type: 'audio/wav' })
        //获取当时时间戳作为文件名
        const fileOfBlob = new File([newbolb], new Date().getTime() + '.wav')
        const requestValue = {audio:fileOfBlob}
        const data = await getText(requestValue)
        // console.log(data);
        // emitter.emit("debugMS", data);
        setTimeout(() => {
            message.value = data.result;
            // emitter.emit("debugMS", resultText.value);
        }, 200);
    }
}

function startRecordAudio() {
    Recorder.getPermission().then(
        () => {
            console.log("开始录音");
            record.start(); // 开始录音
        },
        (error: any) => {
            alert("无法获取麦克风权限");
            isListening.value = false;
            console.log(`${error.name} : ${error.message}`);
        }
    );
}


</script>

<template>
    <div class="message-input">
        <div class="input-wrapper">
            <!-- 按回车键发送，输入框高度三行 -->
            <el-input v-model="message" :autosize="false" :rows="3" class="input" resize="none" type="textarea"
                @keydown.enter="sendMessage" />
            <div class="button-wrapper">
                <el-button type="primary" @mousedown.prevent="goTouchstart()" @mouseup.prevent="goTouchend()"
                    @touchstart.prevent="goTouchstart()" @touchend.prevent="goTouchend()">
                    <el-icon class="el-icon--left">
                        <Microphone />
                    </el-icon>
                    {{ isListening ? '正在录音...' : '按住说话' }}
                </el-button>
                <el-button type="primary" @click="sendMessage">
                    <el-icon class="el-icon--left">
                        <Position />
                    </el-icon>
                    发送
                </el-button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.message-input {
    padding: 0 10px;
    // border-top: 1px solid rgba(black, 0.07);
    // border-left: 1px solid rgba(black, 0.07);
    // border-right: 1px solid rgba(black, 0.07);
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
}

.button-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}
</style>
