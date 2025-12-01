<script lang="ts" setup>
import { Position } from "@element-plus/icons-vue";
import { ref } from "vue";
import { useXfAsr } from "~/utils/useXfAsr.js";
import emitter from "../../utils/bus";
import { getRobot } from "~/api/demo";

// 发送消息消息事件
const emit = defineEmits<{
    send: [message: string];
}>();

const { startRecording, stopRecording, recordText, resultText } = useXfAsr();

// 输入框内的消息
const message = ref("");
const isListening = ref(false);
const timeOutEvent = ref<ReturnType<typeof setTimeout> | null>(null);
function sendMessage() {
    emit("send", message.value);
    // 发送完清除
    message.value = "";
    message.value = "哈哈哈哈哈哈哈哈哈";
    //   emitter.emit("debugMS", {
    //     id: "msg-11",
    //     role: "assistant",
    //     session: undefined as any,
    //     validStatus: "VALID",
    //     updatedAt: "2025-09-06T12:00:03Z",
    //     createdAt: "2025-09-06T12:00:03Z",
    //     data: {
    //       text: message.value,
    //     },
    //     dl: [
    //       { type: "text", content: "这是一个测试消息" },
    //       { type: "image", content: "https://example.com/image.png" },
    //       { type: "text", content: "这是另一个测试消息" },
    //     ],
    //   });

    const data = getRobot()
    emitter.emit("debugMS", data);
    console.log(data)
}
function goTouchstart() {
    timeOutEvent.value = setTimeout(() => {
        isListening.value = true;
        console.log("开始录音");
        startRecording();
    }, 200); // 长按200毫秒后，触发长按事件
}
// 手如果在200毫秒内就释放，则取消长按事件
function goTouchend() {
    if (timeOutEvent.value) {
        clearTimeout(timeOutEvent.value);
        timeOutEvent.value = null;
        stopRecording();
        console.log("结束录音");
        message.value = resultText;
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
