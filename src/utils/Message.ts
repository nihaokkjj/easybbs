import { ElMessage } from 'element-plus';

/**
 * 通用消息提示函数
 * @param msg 提示内容
 * @param callback 关闭后的回调函数（可选）
 * @param type 消息类型（默认 'info'，支持 'error' | 'success' | 'warning' | 'info' | 'loading'）
 */
const showMessage = (
  msg: string,
  callback?: () => void,
  type: 'error' | 'success' | 'warning' | 'info' | 'loading' = 'info'
) => {
  ElMessage({
    type: type,
    message: msg,
    duration: 2000,
    onClose: () => {
      if (callback) {
        callback();
      }
    },
  });
};

// 封装不同类型的消息方法
const message = {
  error: (msg: string, callback?: () => void) => {
    showMessage(msg, callback, 'error');
  },
  success: (msg: string, callback?: () => void) => {
    showMessage(msg, callback, 'success');
  },
  warning: (msg: string, callback?: () => void) => {
    showMessage(msg, callback, 'warning');
  },
};

export default message;