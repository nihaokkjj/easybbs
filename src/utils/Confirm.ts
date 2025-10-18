import { ElMessageBox , type ElMessageBoxOptions } from "element-plus";

const Confirm = (message: string, okfun: Function) => {
  const options: ElMessageBoxOptions = {
    confirmButtonText: "确定",
    cancelButtonText: "取消", 
     type: "info",
    
  };

  // 使用第二个重载: confirm(message, title, options)
  ElMessageBox.confirm(message, '提示', options)
    .then(async () => {
      // 用户点击“确定”
      okfun();
    })
    .catch(() => {
      return false;
    });
}

export default Confirm


