s<script setup>
import {ref, reactive, proxyRefs, nextTick} from 'vue'
import { getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { errorMessages } from 'vue/compiler-sfc';
import md5 from 'js-md5'
import { useUserStore } from '@/store';

const router = useRouter()
const userStore = useUserStore()
const { proxy } = getCurrentInstance();
const api = {
  checkCode: '/api/checkCode',
  sendMailCode: '/sendEmailCode',
  register: '/register',
  login: '/login',
  resetPwd: '/resetPwd',
}
//0注册, 1登录, 2找回密码
const onType = ref()

const showPanel = (type)=>{
  onType.value = type
  resetForm()
}
defineExpose({showPanel,})

//验证码
const checkCodeUrl = ref(api.checkCode)
const checkCodeUrl4SendEmailCode = ref(api.checkCode)

const changeCheckCode = (type)=> {
  if (type == 0) {
    checkCodeUrl.value = 
  api.checkCode + "?type=" + type + "&time=" + new Date().getTime()

  } else {
    checkCodeUrl4SendEmailCode.value = 
    api.checkCode + "?type=" + type + "&time=" + new Date().getTime()
  }

  }

  
const formData4SendEmailCode = ref({})
const formData4SendEmailCodeRef = ref()

const dialogConfig4SendEmailCode = ref({
  show: false,
  title: '发送邮箱验证码',
  buttons:[{
    type: "primary",
    text: "发送验证码",
    click: ()=>{
      sendEmailCode();
    }
  }]
})

const dialogConfig = ref({
  show: false,
  title: '标题',
})

//获取邮箱验证码
const getEmailCode = async ()=> {
  formDataRef.value.validateField("email" ,(valid) => {

    if (!valid) {
      return;
    }
    //当邮箱存在时, 才会弹出获取邮箱验证码的弹窗
    dialogConfig4SendEmailCode.value.show = true

    nextTick(() => {
      changeCheckCode(1)
      formData4SendEmailCodeRef.value.resetFields();
      formData4SendEmailCode.value = {
        email: formData.value.email
      }
    })
  }) 
}

//发送邮件
const sendEmailCode = () => {
  formData4SendEmailCodeRef.value.validate( async (valid) => {
    if(!valid) {
    return
  }
  const params = Object.assign({}, formData4SendEmailCode.value)
  params.type = onType.value == 0 ? 0 : 1
  let result = await proxy.Request({
    url: api.sendMailCode,
    params: params,
    errorCallback:() => {
      changeCheckCode(1)
    }
  })
  if (!result) {
    return ;
  }
  //发送成功
  proxy.Message.success("验证码发送成功, 请登录邮箱查看")
  dialogConfig4SendEmailCode.value.show = false
  }) 
}

const checkRePassword = (rule, value, callback)=>{
  if (value !== formData.value.registerPassword) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

// 为发送邮箱验证码弹窗创建单独的 rules
const rules4SendEmailCode = {
  checkCode: [
    {required: true, message: "请输入图片验证码"}
  ],
}


const formData = ref({})
const formDataRef = ref()
const rules = {
  email: [
    {required: true, message: '请输入邮箱'},
    {validator: proxy.Verify.email, message: '请输入正确的邮箱'}
  ],
  password: [
    {required: true, message: "请输入密码"}
  ],
  emailCode: [
    {required: true, message: "请输入邮箱验证码"}
  ],
  nickName: [
    {required: true, message: "请输入昵称"}
  ], 
  registerPassword: [
    {required: true, message: "请输入密码"},
    {
      validator: proxy.Verify.password, 
      message: "密码只能是数字, 字母, 特殊字符 要求8-18位"}
  ],
  reRegisterPassword:  [
    {required: true, message: "请再次输入密码"},
    {
      validator: checkRePassword, 
      message: "两次输入的密码不一致"
    }
  ],
  checkCode: [
    {required: true, message: "请输入图片验证码"}
  ],
}

//重置表单
const resetForm = () => {
  dialogConfig.value.show = true

  if(onType.value === 0) {
    dialogConfig.value.title = '注册'
  } else if (onType.value === 1) {
    dialogConfig.value.title = '登录'
  } else { //2
    dialogConfig.value.title = '重置密码'
  }
  nextTick(()=>{
    changeCheckCode(0)
    formDataRef.value.resetFields()
    formData.value = {}

    //登录
    if(onType.value == 1) {
      const cookieLoginInfo = proxy.VueCookies.get("loginInfo")
      if(cookieLoginInfo) {
        formData.value = cookieLoginInfo
      }
    }
  })
}

//登录/ 注册/ 重置密码 --表单最后的按钮, 提交表单
const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)

    //注册或者重置密码都需要把密码改成现有的
    if (onType.value == 0 || onType.value == 2) {
      //储存注册的密码
      params.password = params.registerPassword
      delete params.registerPassword
      delete params.reRegisterPassword
    } 
    else if(onType.value == 1) {
      let cookieLoginInfo = proxy.VueCookies.get("loginInfo")
      let cookiePassword = 
        cookieLoginInfo == null ? null : cookieLoginInfo.password
      
      if(params.password !== cookiePassword) {
          params.password = md5(params.registerPassword || "")
      //用于生成一段数据的固定长度的摘要（即哈希值）。这个过程是单向的
      //在用户注册或修改密码时，不对明文密码进行存储
      //而是将密码通过 MD5 等哈希算法加密后存入数据库。
      // 当用户登录时，再次对输入的密码进行加密，然后与数据库中的哈希值进行比对  
      }
    }

    let url = null
    if (onType.value == 0) {
      url = api.register
    } else if (onType.value == 1) {
      url = api.login
    } else if (onType.value == 2){
      url = api.resetPwd
    }
    let result = await proxy.Request({
      url: url,
      params: params,
      errorCallback: () => {
        changeCheckCode(0)//刷新验证码
      }
    })

    if (!result) {
      return
    }
    //注册返回
    if (onType.value == 0) {
      proxy.Message.success("注册成功, 请登录")
      showPanel(1) //跳转到登录界面
    } else if (onType.value == 1) { //登录返回
      //登录
      if (params.rememberMe) { //对应表单的""记住我"
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe
        }
        proxy.VueCookies.set("loginInfo", loginInfo, "7d")
      }
      else {
        proxy.VueCookies.remove("loginInfo")
      }
      dialogConfig.value.show = false
      proxy.Message.success("登录成功")
      // debugger
      router.go(0)
    } else if (onType.value == 2) {
      proxy.Message.success("重置密码成功, 请登录")
      //重置密码
      showPanel(1)
    }
  })
}

//密码显示隐藏操作
const passwordEyeType = reactive({
    passwordEye:false,
    registerPasswordEye:false,
    reRegisterPasswordEye:false,
})

const eyeChange = (type)=>{
  passwordEyeType[type] = !passwordEyeType[type]
}

const dialogClose = () => {
  dialogConfig.value.show = false
  userStore.changeLoginState(false)
}

const diaTop = window.innerHeight - 600 + 'px'
</script>

<template>
<div>
    <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
     width="400px"
     :top="diaTop"
    :showCancel="false"
    @close="dialogClose"
  >
  <!-- 邮箱 -->
  <el-form 
  class="login-register"
  :model="formData" 
  :rules="rules" 
  ref="formDataRef">
    <el-form-item prop="email">
      <el-input
        size="large"
        clearable
        placeholder="请输入邮箱"
        v-model="formData.email"
        maxLength="150"
        >
        <template #prefix>
          <span class="iconfont icon-account"></span>
        </template>
      </el-input>
    </el-form-item>

  <!-- 验证码 -->
  <el-form-item prop="emailCode" v-if="onType != 1">
    <div class="email-code-panel">
      <el-input
        size="large"
        placeholder="请输入验证码"
        v-model="formData.emailCode"
        >
        <template #prefix>
          <span class="iconfont icon-checkcode"></span>
        </template>
      </el-input>
      <el-button 
      class="email-code" 
      type="primary" 
      size="large"
      @click="getEmailCode"
      >获取验证码</el-button>
    </div>
      <el-popover placement="left"  
      :width="490"
      trigger="click">
      <div>
        <p>1、在垃圾箱中查找邮箱验证码</p>
        <p>2、在邮箱中 &it;&it;头像->设互->反垃圾->白名单->设苣部件地址白名单</p>
        <p>3、将邮箱【laoluo@wuhancoder.com】添加到白名单,不知道怎么设置?</p>
        </div>
      <template #reference>
        <span class="a-link" :style="{'fontsize': '14px'}">未收到邮箱验证码?</span>
      </template>
      </el-popover>
  </el-form-item>
       <!-- 昵称 -->
    <el-form-item prop="nickName" v-if="onType == 0">
      <el-input
        size="large"
        clearable
        placeholder="请输入昵称"
        v-model="formData.nickName"
        maxLength="20"
        >
        <template #prefix>
          <span class="iconfont icon-account"></span>
        </template>
      </el-input>
    </el-form-item>
  <!-- 登录密码 -->
    <el-form-item prop="registerPassword">
      <el-input
      :type="passwordEyeType.registerPasswordEye?'text':'password'"
        size="large"
        clearable
        placeholder="请输入密码"
        v-model="formData.registerPassword"
        >
        <template #prefix>
          <span class="iconfont icon-password"></span>
        </template>
        <template #suffix>
          <span 
          @click="eyeChange('registerPasswordEye')"
          :class="[
          'iconfont',
          passwordEyeType.registerPasswordEye
          ?'icon-eye'
          : 'icon-close-eye'
          ]"></span>
        </template>
      </el-input>
    </el-form-item>
    <!-- 确认密码 -->
    <el-form-item prop="reRegisterPassword" v-if="onType != 1">
      <el-input
      :type="passwordEyeType.reRegisterPasswordEye?'text':'password'"
        size="large"
        clearable
        placeholder="请再次输入密码"
        v-model="formData.reRegisterPassword"
        >
        <template #prefix>
          <span class="iconfont icon-password"></span>
        </template>
        <template #suffix>
          <span 
          @click="eyeChange('reRegisterPasswordEye')"
          :class="[
          'iconfont',
          passwordEyeType.reRegisterPasswordEye
          ?'icon-eye'
          : 'icon-close-eye'
          ]"></span>
        </template>
      </el-input>
    </el-form-item>
  <!-- 验证码 -->
    <el-form-item prop="checkCode">
      <div class="check-code-panel">
        <el-input
          size="large"
          placeholder="请输入验证码"
          v-model="formData.checkCode"
          >
          <template #prefix>
            <span class="iconfont icon-checkcode"></span>
          </template>
        </el-input>
        <img 
        :src="checkCodeUrl" 
        class="check-code" 
        @click="changeCheckCode(0)" 
        alt="">
      </div>
    </el-form-item>
    <el-form-item v-if="onType == 1">
      <div class="remember-panel">
      <el-checkbox v-model="formData.rememberMe">记住我</el-checkbox>
      </div>
      <div class="no-account">
        <a href="javascript:void(0)" class="a-link" @click="showPanel(2)">忘记密码?</a>
        <a href="javascript:void(0)" class="a-link" @click="showPanel(0)">没有账号</a>
      </div>
    </el-form-item>
    <el-form-item v-if="onType == 0">
        <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">已有账号?</a>
    </el-form-item>
    <el-form-item v-if="onType == 2">
        <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">去登录?</a>
    </el-form-item>    
    <el-button  class="op-btn" type="primary" @click="doSubmit">{{ dialogConfig.title }}</el-button>
  </el-form>
  </Dialog>

<!-- 发送邮箱验证码 -->
 <Dialog
  :show="dialogConfig4SendEmailCode.show"
  :title="dialogConfig4SendEmailCode.title"
  :buttons="dialogConfig4SendEmailCode.buttons"
  width="500px"
  :showCancel="false"
  @close="dialogConfig4SendEmailCode.show = false "
 >
  <el-form
    :model="formData4SendEmailCode"
    :rules="rules4SendEmailCode"
    ref="formData4SendEmailCodeRef"
    label-width="80px"
  >
  <!-- 邮箱验证码弹窗 -->
   <el-form-item label="邮箱">
    {{ formData.email }}
   </el-form-item>
  <!-- 输入 -->
   <el-form-item label="验证码" prop="checkCode">
    <div class="check-code-panel">
        <el-input
          size="large"
          clearable
          placeholder="请输入验证码"
          v-model="formData4SendEmailCode.checkCode"
          >
          <template #prefix>
            <span class="iconfont icon-checkcode"></span>
          </template>
        </el-input>
        <img 
        :src="checkCodeUrl4SendEmailCode" 
        class="check-code" 
        @click="changeCheckCode(1)" 
        alt="">
      </div>
   </el-form-item>
    
  </el-form>
 </Dialog>
</div>
</template>

<style scoped>

el-form-item {
  align-items: center;
}
.login-register {

  .email-code-panel {
    display: flex;
    /* justify-content: space-between; */
    .email-code {
      font-size: 12px;
      margin-left: 18px;
      background-color: #007fff;
      color: #fff;
    }
  }
   .no-account {
    width: 100%;
      display: flex;
      justify-content: space-between;
    }
    .op-btn {
      width: 100%;
    }
}
  .check-code-panel {
    display: flex;

    .check-code {
      font-size: 14px;
      color: rgb(179, 157, 129);
      background-color: #fff;
      margin-left: 3px;
      cursor: pointer;
    }
  }

</style>