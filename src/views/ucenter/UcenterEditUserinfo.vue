<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const {proxy} = getCurrentInstance()
const api = {
  updataUserInfo: "/ucenter/updateUserInfo"
}
const diaTop = window.innerHeight - 630 + 'px'

const dialogConfig = ref({
  show: false,
  title: '编辑个人信息',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        updateUserInfoHandler()
      }
    }
  ]
})

const dialogClose = () => {
  dialogConfig.value.show = false
}

const formData = ref({})
const formDataRef = ref()

const emit = defineEmits(["resetUserInfo"])
const updateUserInfoHandler = () => {
  if (!formDataRef.value) {
    console.log('unde')
    return
  }
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: api.updataUserInfo,
      params,
    })
    if (!result) {
      return
    }
    dialogConfig.value.show = false
    emit("resetUserInfo", params)
    if (params.avatar instanceof File) {
      router.go(0)
    }
  }) 
}

const showEditUserInfoDialog = (userInfo) => {
  dialogConfig.value.show = true
  nextTick(() => {
    
    const dataInfo = JSON.parse(JSON.stringify(userInfo))
    dataInfo.avatar = {
      imageUrl: dataInfo.userId,
    }
    formData.value = dataInfo
  })
}

defineExpose({showEditUserInfoDialog})
</script>

<template>
    <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
     width="400px"
     :top="diaTop"
    :showCancel="false"
    @close="dialogClose"
  >
    <el-form 
    :model="formData"
     ref="formDataRef">
      <el-form-item label="昵称" props="nickName">
        <el-input
        v-model="formData.nickName"
        ></el-input>
      </el-form-item>
      <el-form-item label="头像" props="avatar">
        <CoverUpload
        :imageUrlPrefix="proxy.globalInfo.avatarUrl"
        v-model="formData.avatar"
        ></CoverUpload>
      </el-form-item>
      <el-form-item label="性别" props="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :label="0">男</el-radio>
          <el-radio :label="1">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="个人描述" prop="Description">
        <el-input
          clearable
          placeholder="请输入简介"
          type="textarea"
          :rows="5"
          :maxlength="100"
          resize="none"
          show-word-limit
          v-model="formData.personDescription"
          ></el-input>
        </el-form-item>
    </el-form>
  </Dialog>
</template>

<style scoped>

</style>