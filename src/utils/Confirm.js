import { ElMessageBox } from "element-plus";

const Confirm = (message, okfun) => {
  ElMessageBox.confirm(message, '提示', {
    "confirm-buton-text": "确定",
    "cancel_buton-class": "取消",
    "type": "info"
  }).then(async() => {
      okfun()
  }).catch(() => {
    return false
  })
}

export default Confirm


