<script lang="ts" setup>
import { Position } from "@element-plus/icons-vue";
import { ref } from "vue";
import { useXfAsr } from "~/utils/useXfAsr.js";
import emitter from "~/utils/bus";
import { getRobot } from "~/api/robot";
import dayjs from "dayjs";

// 发送消息消息事件
const emit = defineEmits<{
    send: [message: string];
}>();

const props = defineProps<{
    isInSession: () => boolean;
}>();

const { startRecording, stopRecording, recordText, resultText } = useXfAsr();

// 输入框内的消息
const message = ref("");
const isListening = ref(false);
const timeOutEvent = ref<ReturnType<typeof setTimeout> | null>(null);
async function sendMessage() {
    if (!props.isInSession()) {
        emitter.emit("createNewSession");
    }
    emit("send", message.value);
    const userMessage = message.value;
    const requestValue = { question: message.value }
    message.value = "";
    const data = await getRobot(requestValue); // 获取答复内容
    // emitter.emit("debugMS", data);
    // const data = "这是机器人回复的示例内容。"; // 示例回复内容
    emitter.emit("addReplyMessage", { userMessage, replyMessage: data }); // 发送事件
}
function goTouchstart() {
    timeOutEvent.value = setTimeout(() => {
        isListening.value = true;
        startRecording();
    }, 200); // 长按200毫秒后，触发长按事件
}
// 手如果在200毫秒内就释放，则取消长按事件
async function goTouchend() {
    if (timeOutEvent.value) {
        clearTimeout(timeOutEvent.value);
        timeOutEvent.value = null;
        await stopRecording();
        setTimeout(() => {
            message.value = resultText.value;
            // emitter.emit("debugMS", resultText.value);
        }, 200);
    }
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
                        <Position />
                    </el-icon>
                    {{ recordText }}
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
