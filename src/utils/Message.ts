import { ElMessage } from 'element-plus'
// import {de} from 'element-plus/es/locale'

type MessageCallback = (() => void) | undefined

interface ShowMessageOptions {
	msg: string
	callback?: MessageCallback
	type: 'error' | 'success' | 'warning'
}

const showMessage = ({ msg, callback, type }: ShowMessageOptions) => {
	ElMessage({
		type: type,
		message: msg,
		duration: 2000,
		onClose: () => {
			if (callback) {
				callback()
			}
		},
	})
}

interface MessageAPI {
	error: (msg: string, callback?: MessageCallback) => void
	success: (msg: string, callback?: MessageCallback) => void
	warning: (msg: string, callback?: MessageCallback) => void
}

const message: MessageAPI = {
	error: (msg: string, callback?: MessageCallback) => {
		showMessage({ msg, callback, type: 'error' })
	},
	success: (msg: string, callback?: MessageCallback) => {
		showMessage({ msg, callback, type: 'success' })
	},
	warning: (msg: string, callback?: MessageCallback) => {
		showMessage({ msg, callback, type: 'warning' })
	},
}

export default message
