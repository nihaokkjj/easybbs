<script setup>
import {ref, reactive} from 'vue'

const api = {
  checkCode: 'api/checkCode'
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
const changeCheckCode = (type)=> {
  checkCodeUrl.value = api.checkCode+"?type="+type+"&time="+new Data().getTime()
}

const dialogConfig = ref({
  show: false,
  title: '标题',
})

const formData = ref({})
const formDataRef = ref()
const rules = {
  title: [
    {required: true, message: '请输入内容'},
    {max:150, message: '邮箱太长'},
    {validator: 150, message: '请输入正确的邮箱'}
  ]
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
  // nextTick(()=>{
  //   // changeCheckCode(0)
  //   // formDataRef.value.resetFields()
  // })
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


</script>

<template>
<div>
    <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
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
        >
        <template #prefix>
          <span class="iconfont icon-account"></span>
        </template>
      </el-input>
    </el-form-item>

  <!-- 验证码 -->
  <el-form-item prop="emailCode">
    <div class="email-code-panel">
      <el-input
        size="large"
        clearable
        placeholder="请输入验证码"
        v-model="formData.emailcode"
        >
        <template #prefix>
          <span class="iconfont icon-checkcode"></span>
        </template>
      </el-input>
      <button class="email-code">获取验证码</button>
    </div>
      <el-popover placement="left"  
      :width="490"px
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
    <el-form-item prop="name" v-if="onType == 1">
      <el-input
        size="large"
        clearable
        placeholder="请输入昵称"
        v-model="formData.nickName"
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
        v-model="formData.registerPassward"
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
    <!-- 密码 -->
    <el-form-item prop="Repassword" v-if="onType != 1">
      <el-input
      :type="passwordEyeType.reRegisterPasswordEye?'text':'password'"
        size="large"
        clearable
        placeholder="请再次输入密码"
        v-model="formData.Repassward"
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
          clearable
          placeholder="请输入邮箱验证码"
          v-model="formData.passward"
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
    <el-button  class="op-btn" type="primary">{{ dialogConfig.title }}</el-button>
  </el-form>
  </Dialog>

</div>
</template>

<style scoped>
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
   .no-account {
    width: 100%;
      display: flex;
      justify-content: space-between;
    }
    .op-btn {
      width: 100%;
    }
}

</style>