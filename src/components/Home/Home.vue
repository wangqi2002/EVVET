<!-- eslint-disable no-console -->
<script lang="ts" setup>
import dayjs from "dayjs";
import { onMounted, ref } from "vue";
import { CirclePlus, Close, EditPen } from "@element-plus/icons-vue";
import { el } from "element-plus/es/locales.mjs";

import type { ChatMessage, ChatSession } from "../../typings/types";
import { chatSessionsData } from "../../utils/virtualData";
import emitter from "../../utils/bus";

import MessageInput from "../chat/MessageInput.vue";
import MessageRow from "../chat/MessageRow.vue";
import FloatingWindow from "../FloatingWindow.vue";
import SessionItem from "../chat/SessionItem.vue";

// import { findChatSessionById, queryChatSession, saveChatSession } from '@/api/chat-session'
// import { Client } from '@stomp/stompjs'
// import { useUserStore } from '@/stores/user'
// import { storeToRefs } from 'pinia'

const isEdit = ref(false);
const activeSession = ref<
    Pick<ChatSession, "id" | "statistic" | "messages" | "topic">
>({
    id: "",
    topic: "",
    statistic: { tokenCount: 0, wordCount: 0, chatCount: 0 },
    messages: [],
});
const sessionList = ref([] as ChatSession[]);
const responseMessage = ref({} as ChatMessage);
const userInfo = ref({
    avatar: "src/assets/avatar.png",
    nickname: "koko",
    username: "kokoko",
    password: "abcABC123",
});
const debugMS = ref([]);
// const { userInfo } = storeToRefs(useUserStore());

function emitterListen() {
    let cnt = 0;
    emitter.on("debugMS", (data) => {
        if (cnt < 10) {
            debugMS.value.push(data as never);
        } else {
            debugMS.value.shift();
            debugMS.value.push(data as never);
        }
        cnt = cnt + 1;
    });

    // 监听新增回复消息事件
    emitter.on("addReplyMessage", (data: any) => {

        const userMsg = {
            id: `msg-${Date.now()}`,
            content: data.userMessage,
            role: "user",
            createdAt: dayjs().toISOString(),
            updatedAt: dayjs().toISOString(),
            validStatus: "VALID",
        };
        const replyMsg = {
            id: `msg-${Date.now() + 1}`,
            content: data.replyMessage,
            role: "assistant",
            createdAt: dayjs().toISOString(),
            updatedAt: dayjs().toISOString(),
            validStatus: "VALID",
        };
        activeSession.value.messages.push(userMsg as never, replyMsg as never);
        let session = sessionList.value.find((s) => s.id === activeSession.value.id);
        if (session) {
            session = activeSession.value as never;
        }
    });

    // 监听新建会话事件
    emitter.on("createNewSession", () => {
        const newSession = {
            id: `session-${Date.now()}`,
            topic: `新的聊天 ${sessionList.value.length + 1}`,
            statistic: {
                chatCount: 0,
                tokenCount: 0,
                wordCount: 0,
            },
            messages: [],
            createdBy: {
                id: "user-0",
                avatar: "/avatars/default.png",
                nickname: "默认用户",
                username: "default_user",
                password: "default_password",
                updatedAt: dayjs().toISOString(),
                createdAt: dayjs().toISOString(),
                validStatus: "VALID",
            },
            validStatus: "VALID",
            updatedAt: dayjs().toISOString(),
            createdAt: dayjs().toISOString(),
        };
        sessionList.value.unshift(newSession as never);
        activeSession.value = newSession;
    });
}

onMounted(() => {
    console.log("home-in");
    sessionList.value.push(...chatSessionsData);
    emitterListen();

    /* // 查询自己的聊天会话
    queryChatSession({ pageSize: 1000, pageNum: 1, query: {} }).then((res) => {
      // 讲会话添加到列表中
      sessionList.value.push(...res.result.list)
      // 默认选中的聊天会话是第一个
      if (sessionList.value.length > 0) {
        activeSession.value = sessionList.value[0]
      }
    }) */
});
// 切换会话
function handleSessionSwitch(session: ChatSession) {
    activeSession.value = session;
}
// 从会话列表中删除会话
function handleDeleteSession(session: ChatSession) {
    const index = sessionList.value.findIndex((value) => {
        return value.id === session.id;
    });
    sessionList.value.splice(index, 1);
}
// 新增会话
function handleCreateSession() {
    const newSession = {
        id: `session-${Date.now()}`,
        topic: `新的聊天 ${sessionList.value.length + 1}`,
        statistic: {
            chatCount: 0,
            tokenCount: 0,
            wordCount: 0,
        },
        messages: [],
        createdBy: {
            id: "user-0",
            avatar: "/avatars/default.png",
            nickname: "默认用户",
            username: "default_user",
            password: "default_password",
            updatedAt: dayjs().toISOString(),
            createdAt: dayjs().toISOString(),
            validStatus: "VALID",
        },
        validStatus: "VALID",
        updatedAt: dayjs().toISOString(),
        createdAt: dayjs().toISOString(),
    };
    sessionList.value.unshift(newSession as never);
}
function handleUpdateSession() {
    const session = sessionList.value.find((s) => s.id === activeSession.value.id);
    if (session) {
        session.topic = activeSession.value.topic;
    }
    isEdit.value = false;
}

// ChatGPT的回复
function handleSendMessage(message: string) {
    console.log("handleSendMessage");
}

function isInSession() {
    return activeSession.value.id !== "";
}
</script>

<template>
    <!-- 最外层页面于窗口同宽，使聊天面板居中 -->
    <div class="home-view">
        <!-- 整个聊天面板 -->
        <div class="chat-panel">
            <!-- 左侧的会话列表 -->
            <div class="session-panel">
                <div class="title">ai-assistant</div>
                <div class="description">构建你的AI助手</div>
                <div class="session-list">
                    <!-- for循环遍历会话列表用会话组件显示，并监听点击事件和删除事件。点击时切换到被点击的会话，删除时从会话列表中提出被删除的会话。 -->
                    <!--  -->
                    <SessionItem v-for="(session, index) in sessionList" :key="session.id"
                        :active="session.id === activeSession.id" :session="sessionList[index]" class="session"
                        @click="handleSessionSwitch(session)" @delete="handleDeleteSession" />
                </div>
                <div class="button-wrapper">
                    <div class="new-session">
                        <el-button @click="handleCreateSession">
                            <el-icon :size="15" class="el-icon--left">
                                <CirclePlus />
                            </el-icon>
                            新的聊天
                        </el-button>
                    </div>
                </div>
            </div>
            <!-- 右侧的消息记录 -->
            <div class="message-panel">
                <!-- 会话名称 -->
                <div class="header">
                    <div class="front">
                        <!-- 如果处于编辑状态则显示输入框让用户去修改 -->
                        <div v-if="isEdit" class="title">
                            <!-- 按回车代表确认修改 -->
                            <el-input v-model="activeSession.topic" @keydown.enter="handleUpdateSession" />
                        </div>
                        <!-- 否则正常显示标题 -->
                        <div v-else class="title">
                            {{ activeSession.topic }}
                        </div>
                        <div class="description">
                            与ai-assistant的{{ activeSession.messages.length }}条对话
                        </div>
                    </div>
                    <!-- 尾部的编辑按钮 -->
                    <div class="rear">
                        <el-icon :size="20">
                            <!-- 不处于编辑状态显示编辑按钮 -->
                            <EditPen v-if="!isEdit" @click="isEdit = true" />
                            <!-- 处于编辑状态显示取消编辑按钮 -->
                            <Close v-else @click="isEdit = false" />
                        </el-icon>
                    </div>
                </div>
                <el-divider border-style="solid" />
                <div class="message-list">
                    <!-- 过渡效果 -->
                    <transition-group name="list">
                        <MessageRow v-for="(message, index) in activeSession.messages" :key="message.createdAt + index"
                            :avatar="userInfo.avatar" :message="message" />
                    </transition-group>
                </div>
                <!-- 监听发送事件 -->
                <MessageInput class="input-card" @send="handleSendMessage" :isInSession="isInSession" />
            </div>
        </div>
    </div>
    <FloatingWindow :width="360" :maxHeight="300" :initialX="200" :initialY="120" :data="debugMS">
        <template #title>工具窗口</template>
    </FloatingWindow>
</template>

<style lang="scss" scoped>
.home-view {
    width: 100%;
    height: calc(100% - 2px);

    .chat-panel {
        height: 100%;
        display: flex;
        justify-content: center;
        // border-radius: 20px;
        background-color: white;
        box-shadow: 0 0 20px 20px rgba(black, 0.05);

        .session-panel {
            width: 25%;
            height: calc(100% - 40px);
            border-top-left-radius: 20px;
            border-bottom-left-radius: 20px;
            padding: 20px;
            position: relative;
            border-right: 1px solid rgba(black, 0.07);
            background-color: rgb(231, 248, 255);

            /* 标题 */
            .title {
                margin-top: 20px;
                font-size: 20px;
                color: rgba(black, 0.7);
            }

            /* 描述*/
            .description {
                color: rgba(black, 0.7);
                font-size: 14px;
                margin-top: 10px;
            }

            .session-list {
                .session {
                    /* 每个会话之间留一些间距 */
                    margin-top: 20px;
                }
            }

            .button-wrapper {
                /* session-panel是相对布局，这边的button-wrapper是相对它绝对布局 */
                position: absolute;
                bottom: 20px;
                left: 0;
                display: flex;
                /* 让内部的按钮显示在右侧 */
                justify-content: flex-end;
                /* 宽度和session-panel一样宽*/
                width: 100%;

                /* 按钮于右侧边界留一些距离 */
                .new-session {
                    margin-right: 20px;
                }
            }
        }

        /* 右侧消息记录面板*/
        .message-panel {
            width: 65%;
            height: 100%;
            border-right: 1px solid rgba(0, 0, 0, 0.07);
            border-top-right-radius: 5px;
            border-top-left-radius: 5px;
            display: flex;
            flex-direction: column;

            .header {
                padding: 20px 20px 0 20px;
                display: flex;
                /* 会话名称和编辑按钮在水平方向上分布左右两边 */
                justify-content: space-between;

                /* 前部的标题和消息条数 */
                .front {
                    .title {
                        color: rgba(black, 0.7);
                        font-size: 20px;
                    }

                    .description {
                        margin-top: 10px;
                        color: rgba(black, 0.5);
                    }
                }

                /* 尾部的编辑和取消编辑按钮 */
                .rear {
                    display: flex;
                    align-items: center;
                }
            }

            .message-list {
                flex: 1;
                padding: 15px;
                // 消息条数太多时，溢出部分滚动
                overflow-y: scroll;

                // 当切换聊天会话时，消息记录也随之切换的过渡效果
                .list-enter-active,
                .list-leave-active {
                    transition: all 0.5s ease;
                }

                .list-enter-from,
                .list-leave-to {
                    opacity: 0;
                    transform: translateX(30px);
                }
            }

            .input-card {
                height: 120px;
            }
        }
    }
}
</style>
