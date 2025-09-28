<template>
	<div class="header" v-show="showHeader === true">
		<div class="header-content">
			<!-- logo -->
			<div class="logo">
				<span v-for="item in logoInfo" :style="{ color: item.color }">{{
					item.letter
				}}</span>
			</div>
			<!-- 板块信息 -->
			<div class="menu-pannel">
				<router-link
					class="menu-item home"
					to="/"
					@click="userStore.activePboardId = 0"
					:class="{ active: userStore.activePboardId === 0 }"
					>首页</router-link
				>
				<template v-for="item in boardList" :key="item.boardId">
					<el-popover
						v-if="item.children.length >= 1"
						:width="250"
						title="Title"
						placement="bottom-start"
						trigger="hover">
						<template #reference>
							<span
								class="menu-item"
								@click="boardClickHandler(item)"
								:class="{ active: userStore.activePboardId === item.boardId }">
								{{ item.boardName }}
							</span>
						</template>
						<span class="sub-board-list">
							<span
								class="sub-board"
								v-for="subBoard in item.children"
								@click="subBoardClickHandler(subBoard)"
								:class="{
									active: userStore.activeBoardId === subBoard.boardId,
								}">
								{{ subBoard.boardName }}
							</span>
						</span>
					</el-popover>
					<span
						v-else
						class="menu-item"
						@click="boardClickHandler(item)"
						:class="{ active: userStore.activePboardId === item.boardId }"
						>{{ item.boardName }}</span
					>
				</template>
			</div>
			<!-- 登录注册用户信息 -->
			<div class="user-info-pannel">
				<el-button type="primary" class="op-btn" @click="newPost">
					发帖 <span class="iconfont icon-add"></span>
				</el-button>
				<el-button type="primary" class="op-btn" @click="goSearch">
					搜索<span class="iconfont icon-search"></span>
				</el-button>
				<template v-if="userInfo.userId">
					<div class="message-info">
						<el-dropdown>
							<el-badge
								:value="messageCountInfo.total"
								class="item"
								:hidden="
									messageCountInfo.total === 0 ||
									messageCountInfo.total === null
								">
								<div class="iconfont icon-message"></div>
							</el-badge>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item
									  class="message-item"
										@click="gotoMessage('reply')"
										>
										<span class="text">回复我的</span>
										<span
										  v-if="messageCountInfo.reply > 0"
											class="count"
											>{{
											messageCountInfo.reply > 99
												? '99+'
												: messageCountInfo.reply
										}}</span>
									</el-dropdown-item>
									<el-dropdown-item
										class="message-item"
										@click="gotoMessage('likePost')"
										>
										<span class="text">赞了我的文章</span>
										<span
										v-if="messageCountInfo.likePost > 0"
										class="count">{{
											messageCountInfo.likePost > 99
												? '99+'
												: messageCountInfo.likePost
										}}</span>
									</el-dropdown-item>
									<el-dropdown-item
									class="message-item"
									@click="gotoMessage('downloadAttachment')"
										>
										<span class="text">下载了我的附件</span>
										<span
										v-if="messageCountInfo.downloadAttachment > 0"
										class="count">{{
											messageCountInfo.downloadAttachment > 99
												? '99+'
												: messageCountInfo.downloadAttachment
										}}</span>
									</el-dropdown-item>
									<el-dropdown-item
										class="message-item"
										@click="gotoMessage('likeComment')"
										>
										<span class="text">赞了我的评论</span>
										<span
										v-if="messageCountInfo.likeComment > 0"
										class="count">{{
											messageCountInfo.likeComment> 99
												? '99+'
												: messageCountInfo.likeComment
										}}</span>
									</el-dropdown-item>
									<el-dropdown-item
									 @click="gotoMessage('sys')"
									 class="message-item"
									 >
										<span class="text">系统消息</span>
										<span
										v-if="messageCountInfo.sys > 0"
										class="count">{{
											messageCountInfo.sys > 99
												? '99+'
												: messageCountInfo.sys
										}}</span>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
					<div class="user-info">
						<el-dropdown>
							<Avatar
								:userId="userInfo.userId"
								:width="45"
								:addLink="false"
								class="avatar"></Avatar>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item @click="gotoUcenter">我的主页</el-dropdown-item>
									<el-dropdown-item @click="loginout">退出</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
				</template>
				<el-button-group v-else class="login">
					<el-button
						class="register"
						type="primary"
						plain
						@click="loginAndRegister(1)"
						>登录</el-button
					>
					<el-button
						class="register"removeLogin
						type="primary"
						plain
						@click="loginAndRegister(0)"
						:style="{ 'margin-left': '5px' }"
						>注册</el-button
					>
				</el-button-group>
			</div>
		</div>
	</div>
	<div>
		<LoginAndRegister ref="loginRegisterRef"></LoginAndRegister>
	</div>
	<div class="body-content">
		<router-view></router-view>
	</div>

		<FooterContent></FooterContent>
	<SysSetting></SysSetting>
</template>

<script setup>
	import SysSetting from './components/SysSetting.vue'
	import FooterContent from './components/FooterContent.vue' 
	import LoginAndRegister from './components/LoginAndRegister.vue'
	import {
		ref,
		getCurrentInstance,
		onMounted,
		watch,
		computed,
		watchEffect,
	} from 'vue'
	import { useRouter, useRoute } from 'vue-router'
	import { useUserStore } from '@/store/index'
	import { messageStore } from '@/store/message'
	
	const { proxy } = getCurrentInstance()

	const userStore = useUserStore()
	const msgStore = messageStore()

	const router = useRouter()
	const route = useRoute()

	const api = {
		getUserInfo: '/getUserInfo',
		loadBoard: '/board/loadBoard',
		loadMessageCount: '/ucenter/getMessageCount',
		loginout: '/logout'
	}

	const logoInfo = ref([
		{
			letter: 'E',
			color: 'red',
		},
		{
			letter: 'a',
			color: 'green',
		},
		{
			letter: 's',
			color: 'skyblue',
		},
		{
			letter: 'y',
			color: 'orange',
		},
		{
			letter: 'b',
			color: 'skyblue',
		},
		{
			letter: 'b',
			color: 'green',
		},
		{
			letter: 's',
			color: 'orange',
		},
	])

	//导航栏的显示效果
	const showHeader = ref(true)
	//获取滚动条的高度
	const getScrollTop = () => {
		let scrollTop =
			document.documentElement.scrollTop ||
			window.pageYOffset ||
			document.body.scrollTop

		return scrollTop
	}

	const initScroll = () => {
		let initScrollTop = getScrollTop()
		let scrollType = 0

		window.addEventListener('scroll', () => {
			let currentScrollTop = getScrollTop()
			if (currentScrollTop > initScrollTop) {
				scrollType = 1
			} else {
				scrollType = 0
			}
			initScrollTop = currentScrollTop
		
			if (scrollType === 1 && currentScrollTop > 150) {
				showHeader.value = false
			} else showHeader.value = true
		})
	}

	//登录
	const loginRegisterRef = ref()
	const loginAndRegister = (type) => {
		loginRegisterRef.value.showPanel(type)
	}

	onMounted(() => {
		initScroll() //导航栏显示效果
		getUserInfo() //登录信息显示问题
		loadBoard() //板块信息
		loadMessageCount() //获取消息数量
	})
	//获取用户信息
	const getUserInfo = async () => {
		let result = await proxy.Request({
			url: api.getUserInfo,
		})

		if (!result) {
			return
		}
		userStore.updateLoginUserInfo(result.data)
	}
	//监听用户登录信息
	const userInfo = ref({})
	watch(
		() => userStore.loginUserInfo,
		(newValue, oldValue) => {
			if (newValue !== undefined && newValue !== null) {
				userInfo.value.userId = newValue.userId
			} else {
				userInfo.value = {}
			}
		},
		{ imediate: true, deep: true }
	)
	//监听是否展示登录框
	watch(
		() => userStore.showLogin,
		(newValue, oldValue) => {
			if (newValue) {
				loginRegisterRef.value.showPanel(1) //展示登录框
			}
		},
		{ imediate: true, deep: true }
	)

	//板块信息
	const boardList = ref([])
	const loadBoard = async () => {
		let result = await proxy.Request({
			url: api.loadBoard,
		})
		if (!result) {
			return
		}
		boardList.value = result.data
		userStore.saveBoardList(result.data)
	}

	//板块点击
	const boardClickHandler = (board) => {
		userStore.activePboardId = board.boardId
		userStore.activeBoardId = null // 清空二级板块的高亮状态
		router.push(`/forum/${board.boardId}`)
	}
	//二级板块
	const subBoardClickHandler = (subBoard) => {
		userStore.activePboardId = subBoard.pBoardId
		userStore.activeBoardId = subBoard.boardId
		router.push(`/forum/${subBoard.pBoardId}/${subBoard.boardId}`)
	}

	//发帖
	const newPost = () => {
		if (!userStore.loginUserInfo) {
			userStore.showLogin = true
		} else {
			router.push('/newPost')
		}
	}

	//跳转到个人主主页
	const gotoUcenter = () => {
		router.push(`/user/${userInfo.value.userId}`)
	}
	//退出登录状态
	const loginout = () => {
		proxy.Confirm('确定要退出吗', async ()=>{
			let result = await proxy.Request({
				url: api.loginout,
			})
			if (!result) {
				return
			}
			userStore.updateLoginUserInfo(null)
			router.go(0)
		})
	} 

	//消息中心
	const gotoMessage = (type) => {
		router.push(`/user/message/${type}`)
	}
	//消息数量
	const messageCountInfo = ref({})

	const loadMessageCount = async () => {
		let result = await proxy.Request({
			url: api.loadMessageCount,
		})
		if (!result) {
			return
		}
		messageCountInfo.value = result.data
		msgStore.updateMessageCountInfo(result.data)
	}

	//监听消息数量
	watch(
		() => msgStore.messageCountInfo,
		(newValue, oldValue) => {
			messageCountInfo.value = newValue || {}
			// console.log('msg', messageCountInfo.value)
		},
		{
			immediate: true, deep: true,
		}
	)

	//搜索
	const goSearch = () => {
		router.push('/search')
	}
</script>

<style scoped lang="scss">
	.header {
		top: 0px;
		left: 0px;
		position: fixed;
		height: 60px;
		width: 100%;
		z-index: 1000;
		box-shadow: 0 2px 6px 0 #ddd;

		.header-content {
			align-items: center;
			margin: 0 auto;
			background-color: #fff;
			height: 60px;
			display: flex;

			.logo {
				display: block;
				text-decoration: none;
				margin-left: 50px;
				margin-right: 5px;
				span {
					font-size: 30px;
					font-weight: 600;
				}
			}

			.menu-pannel {
				flex: 1;
				.menu-item {
					color: #2b2828;
					margin-left: 18px;
				}
				.menu-item:hover {
					color: var(--link);
				}
				.home {
					text-decoration: none;
					color: #000;
				}
				.active {
					color: var(--link);
				}
			}
			.user-info-pannel {
				flex: 1;
				align-items: center;
				width: 400px;
				display: flex;
				.op-btn {
					.icon-message {
						margin-left: 10px;
					}
				}
				.message-info {
					cursor: pointer;
					margin-left: 10px;
					margin-right: 15px;
					.item {
						outline: none;
						.icon-message {
							font-size: 22px;
							color: rgb(138, 130, 130);
						}
					}
				}
				.user-info {
					.avatar {
						outline: none;
					}
				}

				.login {
					margin-left: 10px;

					.register,
					.register:active,
					.register:focus {
						border: 0.5px solid skyblue;
						border-radius: 9900px;
					}
					.register:hover {
						background-color: #409eff;
					}
				}
			}
		}
	}

	.sub-board-list {
		display: flex;
		flex-wrap: wrap;
		.sub-board {
			padding: 0px 10px;
			border-radius: 20px;
			margin-right: 10px;
			background-color: #f0efef;
			border: 1px solid #ddd;
			color: #6d6767;
			margin-top: 10px;
			cursor: pointer;
		}
		.sub-board:hover {
			color: var(--link);
		}
		.active {
			background: var(--link);
			color: #fff;
		}
		.active:hover {
			color: #fff;
		}
	}

	.body-content {
		margin-top: 10px;
		position: relative;
		min-height: calc(100vh - 165px);
	}

	.message-item {
		display: flex;
		justify-content: space-around;
		.text {
			flex: 1;
		}
		.count {
			font-size: 10px;
			width: 18px;
			height: 18px;
			border-radius: 50%;
			text-align: center;
			line-height: 18px;
			color: #fff;
			background: rgba(233, 81, 44, 0.726);
		}
	}
</style>
