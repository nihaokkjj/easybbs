import axios from 'axios'
import {ElLoading} from 'element-plus'
import Message from './Message'
import { useUserStore } from '@/store'


const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8"
const contentTypeJson = "application/json"

const instance = axios.create({
  baseURL: "/api",
  timeout: 10 * 1000,
})

let loading = null
//请求前的过滤器
instance.interceptors.request.use(
  (config)=>{
  if(config.showLoading) {
    loading = ElLoading.service({
      lock: true,
      text: "加载中......",
      background:"rgb(0, 0, 0, 0.7)"
    })
  }
  return config
}, (error)=>{
  if(error.config.showLoading && loading) {
    loading.close()
  }
  Message.error("请求发送失败")
  return Promise.reject("请求发送失败")
});

//请求后的过滤器
instance.interceptors.response.use(
  (response) => {
    const {showLoading, errorCallback, showError = true} = response.config
    if(showLoading && loading) {
      loading.close()
    }

    const userStore = useUserStore() //不能写在外部
    //JavaScript 模块的加载顺序是自上而下的。
    // api/Request.js 这个文件可能在 main.js 导入它的时候就被执行了，
    // 而此时 main.js 里的 app.use(pinia) 还没来得及运行。

    //此时，当 useAuthStore() 内部调用 getActivePinia() 时，
    // 它会发现 Vue 应用中还没有任何“活跃的 Pinia 实例”，
    // 因为它还没有被注册。
    const responseData = response.data

    if(responseData.code == 200) { //code状态码微200, 请求成功
      return responseData
    } else if (responseData.code == 901) { //超时
        userStore.changeLoginState(true)
        userStore.updateLoginUserInfo(null)
      return Promise.reject({showError: false, msg: '登录超时'})
    }  else{ //其他错误
      if(errorCallback) {
        errorCallback(responseData)
      }
      return Promise.reject({showError: showError, msg: responseData.info})
    }

  }, (error) => {
    if(error.config.showLoading && loading) {
      loading.close()
    }
    return Promise.reject({showError: true, msg: "网络异常"})
  }
);

const request = (config)=>{
  const {url, params, dataType, errorCallback, showLoading = true, showError = true} = config
  let contentType = contentTypeForm
  let formData = new FormData()
  for (let key in params) {
    formData.append(key, params[key] == undefined ? "" : params[key])
  }

  if(dataType != null && dataType === "json") {
    contentType = contentTypeJson
  }
  let headers = {
    'Content-type': contentType,
    'X-Requested-With': 'XMLHttpRequest',
  }

    return instance.post(url, formData, {
      headers: headers,
      showLoading: showLoading,
      errorCallback: errorCallback,
      showError: showError,
    }) .catch ( error => {
    if (error.showError) {
      Message.error(error.msg)
    }
    return null
  })
}

export default request;