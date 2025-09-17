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
					>首页</router-link>
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
								{{subBoard.boardName}}
							</span>
						</span>
					</el-popover>
					<span
						v-else
						class="menu-item"
						@click="boardClickHandler(item)"
						:class="{ active: userStore.activePboardId === item.boardId }"
						>{{ item.boardName }}</span>
				</template>
			</div>
			<!-- 登录注册用户信息 -->
			<div class="user-info-pannel">
				<el-button type="primary" class="op-btn">
					发帖 <span class="iconfont icon-add"></span>
				</el-button>
				<el-button type="primary" class="op-btn" @click="goSearch">
					搜索<span class="iconfont icon-search"></span>
				</el-button>
				<template v-if="userInfo.userId">
					<div class="message-info">
						<el-dropdown>
							<el-badge :value="12" class="item">
								<div class="iconfont icon-message"></div>
							</el-badge>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item>回复我的</el-dropdown-item>
									<el-dropdown-item>赞了我的文章</el-dropdown-item>
									<el-dropdown-item>下载了我的附件</el-dropdown-item>
									<el-dropdown-item>赞了我的评论</el-dropdown-item>
									<el-dropdown-item>系统消息</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
					<div class="user-info">
						<el-dropdown>
							<Avatar :userId="userInfo.userId" :width="45"></Avatar>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item>我的主页</el-dropdown-item>
									<el-dropdown-item>退出</el-dropdown-item>
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
						class="register"
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
</template>

<script setup>
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

	const { proxy } = getCurrentInstance()

	const userStore = useUserStore()

	const router = useRouter()
	const route = useRoute()

	const api = {
		getUserInfo: '/getUserInfo',
		loadBoard: '/board/loadBoard',
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
			// console.log(scrollType === 1 ? 'shang' : 'xia')
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

	//搜索
	const goSearch = () => {
		router.push('/search')
	}

	onMounted(() => {
		initScroll() //导航栏显示效果
		getUserInfo() //登录信息显示问题
		loadBoard() //板块信息
	})
	//获取用户信息
	const getUserInfo = async () => {
		let result = await proxy.Request({
			url: api.getUserInfo,
		})

		if (!result) {
			return
		}
		userStore.updateLoginUserInfo(result.data?.userId)
	}
	//监听用户登录信息
	const userInfo = ref({})
	watch(
		() => userStore.loginUserInfo,
		(newValue, oldValue) => {
			if (newValue !== undefined && newValue !== null) {
				userInfo.value.userId = newValue
			} else {
				userInfo.value = {}
			}
		},
		{ imediate: true, deep: true }
	)
	//监听是否展示登录框
	watch(
		() => userStore.showLoginState,
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
					.iconfont {
						margin-left: 10px;
					}
				}
				.message-info {
					cursor: pointer;
					margin-left: 10px;
					margin-right: 15px;
					.icon-message {
						font-size: 25px;
						color: rgb(138, 130, 130);
					}
				}
				.message-info:hover {
					outline: none;
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
	}
</style>
