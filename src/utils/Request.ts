import axios, {
	type AxiosInstance,
	// 导入 InternalAxiosRequestConfig 用于拦截器
	type InternalAxiosRequestConfig,
	type AxiosResponse,
	// AxiosRequestConfig 现在被我们增强了，所以保留导入
	type AxiosRequestConfig,
} from 'axios'
import { ElLoading, type LoadingInstance } from 'element-plus'
import Message from './Message'
import { useUserStore } from '@/store'

// -------------------------------------------------------------------
// 💡 模块增强替代方案：直接扩展 Axios 的原生类型
// 告诉 TypeScript，AxiosRequestConfig 和 InternalAxiosRequestConfig 
// 现在包含了我们的自定义字段，彻底消除类型不兼容错误。
// -------------------------------------------------------------------
declare module 'axios' {
	export interface AxiosRequestConfig {
		showLoading?: boolean // 是否显示加载动画
		errorCallback?: (data: ApiResponse) => void // 自定义错误处理回调
		showError?: boolean // 是否自动显示错误提示
	}
	// InternalAxiosRequestConfig 是拦截器接收的类型，也需要增强
	export interface InternalAxiosRequestConfig {
		showLoading?: boolean
		errorCallback?: (data: ApiResponse) => void
		showError?: boolean
	}
}
// -------------------------------------------------------------------

// 假设 useUserStore 返回的类型（如果 store 中已定义，可导入使用）
interface UserStore {
	changeLoginState: (isExpired: boolean) => void
	updateLoginUserInfo: (info: any | null) => void
}

// 后端接口返回数据的通用结构
interface ApiResponse {
	code: number // 状态码（200 成功，901 超时等）
	info?: string // 错误信息
	[key: string]: any // 其他可能的返回字段
}

// 请求函数的入参配置
interface RequestConfig {
	url: string // 请求地址（必填）
	params?: Record<string, any> // 请求参数（键值对）
	dataType?: 'json' // 数据类型（可选，默认为 form 表单）
	errorCallback?: (data: ApiResponse) => void // 错误回调
	showLoading?: boolean // 是否显示加载动画
	showError?: boolean // 是否自动显示错误
}

// 错误对象结构
interface RequestError {
	showError: boolean
	msg: string
}

const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8'
const contentTypeJson = 'application/json'

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
	baseURL: '/api',
	timeout: 10 * 1000,
})

let loading: LoadingInstance | null = null // 加载动画实例（指定类型）

// 请求拦截器
// 参数类型现在可以直接使用 InternalAxiosRequestConfig，因为它已被增强
instance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// ⚠️ 注意：这里不再需要类型断言，可以直接访问自定义属性
		if (config.showLoading) {
			loading = ElLoading.service({
				lock: true,
				text: '加载中......',
				background: 'rgb(0, 0, 0, 0.7)',
			})
		}
		return config
	},
	(error: any) => {
		// 同样可以直接访问 error.config 上的自定义属性
		if (error.config?.showLoading && loading) {
			loading.close()
		}
		Message.error('请求发送失败', () => {})
		return Promise.reject<RequestError>({
			showError: true,
			msg: '请求发送失败',
		})
	}
)

// 响应拦截器
instance.interceptors.response.use(
	(response:  AxiosResponse<ApiResponse>) => {
		// response.config 类型现在已经被增强
		const config = response.config 
		const { showLoading, errorCallback, showError = true } = config

		// 关闭加载动画
		if (showLoading && loading) {
			loading.close()
		}

		const userStore: UserStore = useUserStore() // 明确 store 类型
		const responseData: ApiResponse = response.data

		if (responseData.code === 200) {
			// 成功：返回后端数据
			return response
		} else if (responseData.code === 901) {
			// 登录超时：更新用户状态
			userStore.changeLoginState(true)
			userStore.updateLoginUserInfo(null)
			return Promise.reject<RequestError>({ showError: false, msg: '登录超时' }) as Promise<AxiosResponse<ApiResponse>>
		} else {
			// 其他错误：执行自定义回调或默认处理
			if (errorCallback) {
				errorCallback(responseData)
			}
			return Promise.reject<RequestError>({
				showError: showError,
				msg: responseData.info || '请求失败',
			})
		}
	},
	(error: any) => {
		const config = error.config
		if (config?.showLoading && loading) {
			loading.close()
		}
		return Promise.reject<RequestError>({ showError: true, msg: '网络异常' })
	}
)

// 封装请求函数
const request = (
	config: RequestConfig
): Promise<ApiResponse | null> => {
	const {
		url,
		params = {}, // 默认空对象（避免 undefined）
		dataType,
		errorCallback,
		showLoading = true,
		showError = true,
	} = config

	// 处理请求头和数据格式
	let contentType = contentTypeForm
	let requestData: FormData | Record<string, any> = new FormData()

	// 转换 params 为 FormData（form 格式）
	if (dataType !== 'json') {
		for (const key in params) {
			// 处理 undefined 值（转为空字符串）
			const value = params[key] === undefined ? '' : params[key]
			requestData.append(key, value)
		}
	} else {
		// json 格式：直接使用 params 作为数据
		contentType = contentTypeJson
		requestData = params
	}

	// 发送请求
	return instance
		// post 的配置参数现在可以使用增强后的类型
		.post<ApiResponse>(url, requestData, {
			// 明确 post 方法的返回数据类型
			headers: {
				'Content-type': contentType,
				'X-Requested-With': 'XMLHttpRequest',
			},
			showLoading,
			errorCallback,
			showError,
		} as AxiosRequestConfig) 
		// 修复点 4: 在 request 函数中链式调用 then，解构出 data，并返回最终的数据类型 ApiResponse
		.then(response => {
			// 由于拦截器在 code === 200 时返回了完整的 response，这里可以安全地返回 data
			return response.data;
		})
		.catch((error: RequestError) => {
			// 自动显示错误提示（根据 showError 配置）
			if (error.showError) {
				Message.error(error.msg, () => {})
			}
			return null
		})
}


export default request
