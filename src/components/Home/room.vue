<!-- eslint-disable no-console -->
<script lang="ts" setup>
	import dayjs from 'dayjs';
	import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
	import { CirclePlus, Close, EditPen } from '@element-plus/icons-vue';
	import type { ChatMessage, ChatSession, ChatMode } from '../../typings/types';
	import { chatSessionsData } from '../../utils/virtualData';
	import emitter from '../../utils/bus';
	import MessageInput from '../chat/MessageInput.vue';
	import MessageRow from '../chat/MessageRow.vue';
	import FloatingWindow from '../FloatingWindow.vue';
	import SessionItem from '../chat/SessionItem.vue';
	// import { sendChatMsg, sendWorkMsg } from '@/api/chat-session'

	const msgListRef = ref<HTMLElement | null>(null);
	const isEdit = ref(false);

	// 当前激活会话，类型直接使用ChatSession，空会话用初始默认对象
	const activeSession = ref<ChatSession>({
		id: '',
		topic: '',
		mode: 'chat',
		statistic: { tokenCount: 0, wordCount: 0, chatCount: 0 },
		messages: [],
		createdBy: {
			id: '',
			avatar: '',
			nickname: '',
			username: '',
			password: '',
			updatedAt: '',
			createdAt: '',
			validStatus: 'VALID',
		},
		validStatus: 'VALID',
		updatedAt: '',
		createdAt: '',
	});

	const sessionList = ref<ChatSession[]>([]);
	const responseMessage = ref<ChatMessage>({} as ChatMessage);
	const userInfo = ref({
		avatar: 'src/assets/avatar.png',
		nickname: 'koko',
		username: 'kokoko',
		password: 'abcABC123',
	});
	const debugMS = ref<unknown[]>([]);

	function emitterListen() {
		let cnt = 0;
		emitter.on('debugMS', (data) => {
			if (cnt < 10) {
				debugMS.value.push(data);
			} else {
				debugMS.value.shift();
				debugMS.value.push(data);
			}
			cnt = cnt + 1;
		});

		// 监听新增用户消息
		emitter.on('addSendMessage', (data: { userMessage: string; mode: ChatMode }) => {
			const userMsg: ChatMessage = {
				id: `msg-${Date.now()}`,
				content: data.userMessage,
				role: 'user',
				sessionId: activeSession.value.id,
				createdAt: dayjs().toISOString(),
				updatedAt: dayjs().toISOString(),
				validStatus: 'VALID',
			};
			activeSession.value.messages.push(userMsg);
			// 同步更新sessionList里原始会话数据
			const session = sessionList.value.find((s) => s.id === activeSession.value.id);
			if (session) {
				session.messages = [...activeSession.value.messages];
			}
			scrollToBottom();
		});

		// 监听AI回复消息
		emitter.on('addReplyMessage', (data: { replyMessage: string }) => {
			const replyMsg: ChatMessage = {
				id: `msg-${Date.now() + 1}`,
				content: data.replyMessage,
				role: 'assistant',
				sessionId: activeSession.value.id,
				createdAt: dayjs().toISOString(),
				updatedAt: dayjs().toISOString(),
				validStatus: 'VALID',
			};
			activeSession.value.messages.push(replyMsg);
			const session = sessionList.value.find((s) => s.id === activeSession.value.id);
			if (session) {
				session.messages = [...activeSession.value.messages];
			}
			scrollToBottom();
		});

		emitter.on('createNewSession', () => {
			createNewSessionItem();
		});
	}

	/** 创建新会话 */
	function createNewSessionItem() {
		const newSession: ChatSession = {
			id: `session-${Date.now()}`,
			topic: `新的聊天 ${sessionList.value.length + 1}`,
			mode: 'chat',
			statistic: {
				chatCount: 0,
				tokenCount: 0,
				wordCount: 0,
			},
			messages: [],
			createdBy: {
				id: 'user-0',
				avatar: '/avatars/default.png',
				nickname: '默认用户',
				username: 'default_user',
				password: 'default_password',
				updatedAt: dayjs().toISOString(),
				createdAt: dayjs().toISOString(),
				validStatus: 'VALID',
			},
			validStatus: 'VALID',
			updatedAt: dayjs().toISOString(),
			createdAt: dayjs().toISOString(),
		};
		sessionList.value.unshift(newSession);
		activeSession.value = newSession;
	}

	function scrollToBottom() {
		nextTick(() => {
			if (!msgListRef.value) return;
			const dom = msgListRef.value;
			dom.scrollTo({ top: dom.scrollHeight, behavior: 'smooth' });
		});
	}

	onMounted(() => {
		console.log('home-in');
		emitterListen();
		// sessionList.value.push(...chatSessionsData);
		// if (sessionList.value.length > 0) {
		//   activeSession.value = sessionList.value[0]
		// }
	});

	onUnmounted(() => {
		emitter.off('debugMS');
		emitter.off('addSendMessage');
		emitter.off('addReplyMessage');
		emitter.off('createNewSession');
	});

	watch(
		() => activeSession.value.messages.length,
		() => {
			const dom = msgListRef.value;
			const isNearBottom = dom ? dom.scrollHeight - dom.scrollTop - dom.clientHeight < 50 : true;
			if (isNearBottom) {
				scrollToBottom();
			}
		},
	);

	// 切换会话
	function handleSessionSwitch(session: ChatSession) {
		activeSession.value = session;
		nextTick(() => {
			scrollToBottom();
		});
	}

	// 删除会话
	function handleDeleteSession(session: ChatSession) {
		const index = sessionList.value.findIndex((value) => value.id === session.id);
		sessionList.value.splice(index, 1);
		// 如果删除的是当前会话，重置activeSession
		if (activeSession.value.id === session.id) {
			activeSession.value = {
				id: '',
				topic: '',
				mode: 'chat',
				statistic: { tokenCount: 0, wordCount: 0, chatCount: 0 },
				messages: [],
				createdBy: {
					id: '',
					avatar: '',
					nickname: '',
					username: '',
					password: '',
					updatedAt: '',
					createdAt: '',
					validStatus: 'VALID',
				},
				validStatus: 'VALID',
				updatedAt: '',
				createdAt: '',
			};
		}
	}

	// 新建会话按钮
	function handleCreateSession() {
		createNewSessionItem();
	}

	// 保存会话标题修改
	function handleUpdateSession() {
		const session = sessionList.value.find((s) => s.id === activeSession.value.id);
		if (session) {
			session.topic = activeSession.value.topic;
		}
		isEdit.value = false;
	}

	/**
	 * 发送消息：区分 chat / work 模式请求后端不同接口
	 */
	async function handleSendMessage(message: string) {
		if (!message.trim() || !activeSession.value.id) return;
		const currentMode: ChatMode = activeSession.value.mode;
		console.log('发送消息，mode:', currentMode, message);

		emitter.emit('addSendMessage', {
			userMessage: message,
			mode: currentMode,
		});

		try {
			let res: { reply: string };
			if (currentMode === 'chat') {
				// res = await sendChatMsg({
				//   sessionId: activeSession.value.id,
				//   content: message,
				//   mode: 'chat',
				// });
				res = { reply: `【对话模式】收到消息：${message}` };
			} else {
				// res = await sendWorkMsg({
				//   sessionId: activeSession.value.id,
				//   content: message,
				//   mode: 'work',
				// });
				res = { reply: `【工作模式】收到消息：${message}` };
			}
			emitter.emit('addReplyMessage', { replyMessage: res.reply });
		} catch (err) {
			console.error('请求失败', err);
			emitter.emit('addReplyMessage', { replyMessage: '请求出错，请重试' });
		}
	}

	function isInSession() {
		return !!activeSession.value.id;
	}
</script>

<template>
	<div class="home-view">
		<div class="chat-panel">
			<!-- 左侧会话列表 -->
			<div class="session-panel">
				<div class="title">ai-assistant</div>
				<div class="description">构建你的AI助手</div>
				<div class="session-list">
					<SessionItem
						v-for="(session, index) in sessionList"
						:key="session.id"
						:active="session.id === activeSession.id"
						:session="sessionList[index]"
						class="session"
						@click="handleSessionSwitch(session)"
						@delete="handleDeleteSession"
					/>
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
			<!-- 右侧消息面板 -->
			<div class="message-panel">
				<div class="header">
					<div class="front">
						<div v-if="isEdit" class="title">
							<el-input v-model="activeSession.topic" @keydown.enter="handleUpdateSession" />
						</div>
						<div v-else class="title">
							{{ activeSession.topic }}
						</div>
						<div class="description">与ai-assistant的{{ activeSession.messages.length }}条对话</div>
						<div class="mode-select" v-if="isInSession()">
							<el-radio-group v-model="activeSession.mode" size="small">
								<el-radio-button label="chat">对话</el-radio-button>
								<el-radio-button label="work">工作</el-radio-button>
							</el-radio-group>
						</div>
					</div>
					<div class="rear">
						<el-icon :size="20">
							<EditPen v-if="!isEdit" @click="isEdit = true" />
							<Close v-else @click="isEdit = false" />
						</el-icon>
					</div>
				</div>
				<el-divider border-style="solid" />
				<div class="message-list" ref="msgListRef">
					<transition-group name="list">
						<MessageRow
							v-for="(message, index) in activeSession.messages"
							:key="message.createdAt + index"
							:avatar="userInfo.avatar"
							:message="message"
						/>
					</transition-group>
				</div>
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
				.title {
					margin-top: 20px;
					font-size: 20px;
					color: rgba(black, 0.7);
				}
				.description {
					color: rgba(black, 0.7);
					font-size: 14px;
					margin-top: 10px;
				}
				.session-list {
					.session {
						margin-top: 20px;
					}
				}
				.button-wrapper {
					position: absolute;
					bottom: 20px;
					left: 0;
					display: flex;
					justify-content: flex-end;
					width: 100%;
					.new-session {
						margin-right: 20px;
					}
				}
			}
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
					justify-content: space-between;
					.front {
						.title {
							color: rgba(black, 0.7);
							font-size: 20px;
						}
						.description {
							margin-top: 10px;
							color: rgba(black, 0.5);
						}
						.mode-select {
							margin-top: 12px;
						}
					}
					.rear {
						display: flex;
						align-items: center;
					}
				}
				.message-list {
					flex: 1;
					padding: 15px;
					overflow-y: scroll;
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
