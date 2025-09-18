import './assets/style.css'
import {createApp} from 'vue'
//引入pinia
import {createPinia} from 'pinia'
import App from './App.vue'
import router from './router/index.ts'

//引入cookies
import VueCookies from 'vue-cookies'
//vue-cookies提供了一个简洁、方便的方式来在 Vue 组件中设置、获取和删除浏览器 Cookie。
//引入element plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//我们使用sass 所以这里将base.css 改成base.scss
// import './assets/base.scss'
//图标 图标在附件中
import './assets/icon/iconfont.css'
import Dialog from './components/Dialog.vue'
import Verify from './utils/Verify.js'
import Message from './utils/Message.js'
import Request from './utils/Request.js'
import Avatar from './components/Avatar.vue'
import Cover from './components/Cover.vue'
import DataList from './components/DataList.vue'
import NoData from './components/NoData.vue'
import Utils from '@/utils/Utils.js'


const app = createApp(App)

const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(ElementPlus);


app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.globalInfo = {
  bodyWidth: 1300,
  avatarUrl: "/api/file/getAvatar/",
  imageUrl: "/api/file/getImage/",

}

app.config.globalProperties.Verify = Verify
app.config.globalProperties.Message = Message
app.config.globalProperties.Request = Request
app.config.globalProperties.Utils = Utils

app.component('Dialog', Dialog )
app.component('Avatar', Avatar)
app.component('Cover', Cover)
app.component('DataList', DataList)
app.component('NoData', NoData)


app.mount('#app')