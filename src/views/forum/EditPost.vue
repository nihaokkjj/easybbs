<script setup>
import EditorMarkdown from '@/components/EditorMarkdown.vue';
import EditorHtml from '@/components/EditorHtml.vue';
import { useRoute, useRouter } from 'vue-router';
import {onMounted, ref, getCurrentInstance, watch, nextTick} from 'vue'
import CoverUpload from '@/components/CoverUpload.vue';
import { ElMessageBox } from 'element-plus';
import AttachmentSelector from '@/components/AttachmentSelector.vue';
import message from '@/utils/Message';

const {proxy} = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const formData = ref({})
const formDataRef = ref()

const markdownHeight = window.innerHeight - 129
const htmlEditorHeight = window.innerHeight

const api = {
  loadBoard: "/forum/loadBoard4Post",
  postArticle: "/forum/postArticle",
  articleDetail4Update: "/forum/articleDetail4Update",
  updateArticle: "/forum/updateArticle",
}
const rules = {
  title: [
    {required: true, message: "请输入标题"},
    {max: 150, message: '标题过长'}
  ],
  boardIds: [
    {required: true, message: '请选择板块'}
  ],
  content: [
    {required: true, message: '请输入内容'}
  ],
  summary: [
    {max: 200, message: '请输入摘要'}
  ],
  integral: [
    {required: true, message: '请输入下载所需积分'},
    {validator: proxy.Verify.number, message: '积分只能是数字'}
  ],
}

//提交信息
const postHandler = () =>{
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)

    if (params.boardIds.length === 1) {
      params.pBoardId = params.boardIds[0]
    } else if (params.boardIds.length === 2) {
      params.pBoardId = params.boardIds[0]
      params.boardId = params.boardIds[1]
    }
    delete params.boardIds
    //设置编辑器类型
    params.editorType = editorType.value
    //获取内容
    params.editorType = editorType.value

      // 如果是markdown编辑器, 则另外处理
      let submitContent = params.content
      if (params.editorType === 0) { // Markdown 编辑器
        submitContent = params.markdownContent
      } else { // 富文本编辑器
        params.markdownContent = '0'
        submitContent = formData.value.content
      }
      params.content = formData.value.content

      // 内容非空校验
      const contentText = submitContent.replace(/<(?!img).*?>/g, "")
      if (!contentText || contentText.trim() === "") {
        proxy.Message.warning("正文不能为空")
        return
      }

    //封面
    if(params.cover && !(params.cover instanceof File)) {
      delete params.cover
    }
    if (params.attachment !== null) {
      params.attachmentType = 1
    } else {
      params.attachmentType = 0
    }
    //附件不是文件类型, 设置为空
    // instanceof 运算符的优先级低于 ! 
    if (params.attachment && !(params.attachment instanceof File)) {
      delete params.attachment
    }

    let result = await proxy.Request({
      url: params.articleId?api.updateArticle : api.postArticle,
      params: params,
    })
    // console.log('result', result)
    if (!result) {
      return
    }
    proxy.Message.success("发布成功")
    router.push(`/post/${result.data}`)
  })
}

//板块信息
const boardProps = {
  multiple: false,
  checkStrictly: true,
  value: "boardId",
  label: "boardName",
}
const boardList = ref([])
const loadBoardList = async () => {
  let result = await proxy.Request({
    url: api.loadBoard,
  })
  if (!result) {
    return
  }
  boardList.value = result.data
}

onMounted(()=>{
  loadBoardList()
})

//0是markdown, 1是富文本编辑器

const editorType = ref(0)

const chnageEditorType = () => {
  proxy.Confirm("切换编辑器会清空正在编辑的内容, 确定要切换吗?",
    () => {
      editorType.value = editorType.value === 0 ? 1 : 0
      formData.value.content = ""
      formData.value.markdownContent = ""
      proxy.VueCookies.set("editorType", editorType, 0)
    }
  )
}
const editorName = ["富文本编辑器", "Markdown编辑器"]

const getArticleDetail = () => {
  //等待dom渲染完毕
  nextTick(async () => {
    formDataRef.value.resetFields()

    if(articleId.value) {
      let result = await proxy.Request({
        url: api.articleDetail4Update,
        params: {
          articleId: articleId.value,
        },
        showError: false,
        errorCallback: (response)=> {
          ElMessageBox.alert(response.info, '错误',{
            "show-case": false,
            callback: (action) => {
              router.go(-1)
            },
          })
        }
      })

      console.log('result', result)
      if (!result) {
        return
      }
      let articleInfo = result.data.forumArticle
      //设置编辑器
      editorType.value = articleInfo.editorType

      //板块信息
      articleInfo.boardIds = []
      articleInfo.boardIds.push(articleInfo.pBoardId)

      if (articleInfo.boardId !== null && articleInfo.boardId !== 0) {
        articleInfo.boardIds.push(articleInfo.boardId)
      }

      //封面
      if (articleInfo.cover) {
        articleInfo.cover = {imageUrl: articleInfo.cover}
      }

      //附件
      if (result.data.attachment) {
        articleInfo.attachment = {
          name: result.data.attachment.fileName,
        }
        articleInfo.integral = result.data.attachment.integral
      }

      formData.value = articleInfo
      // console.log('form', formData.value)
    } else {
      formData.value = {}
      editorType.value = proxy.VueCookies.get("editorType") || 0
    }
  })
}

const articleId =ref(null)

const setHtmlContentH = (HTMLcontent) => {
  formData.value.content = HTMLcontent
}

const setHtmlContentMark = (HTMLcontent) => {
  formData.value.content = HTMLcontent
}
watch(
  () => route,
  (newValue, oldValue) => {
    if (
      newValue.path.indexOf("/editPost") != -1||
      newValue.path.indexOf("/newPost") != -1
    ) {
      articleId.value = newValue.params.articleId
      getArticleDetail()
    }
  },
  {immediate: true, deep: true}
)
</script>

<template>
  <div class="edit-post">
      <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="80px"
      class="post-panel"
    >
    <div class="post-editor">
      <el-card :body-style="{ padding: '1px' }">
        <template #header>
          <div class="changeEditor">
            <span class="title">正文</span>
            <span
             class="change-editor-type"
             @click="chnageEditorType"
             >
              <span class="iconfont icon-change">
               切换为{{ editorName[editorType] }}
              </span>
            </span>
          </div>
        </template>
      </el-card>
      <EditorMarkdown
       :height="markdownHeight"
       v-if="editorType === 0"
       v-model="formData.markdownContent"
       @htmlContent="setHtmlContentMark"
       ></EditorMarkdown>
        <EditorHtml
        v-if="editorType === 1"
        @htmlContent="setHtmlContentH"
        ></EditorHtml>
      </div>
      
    <div class="post-setting">
      <el-card
       :body-style="{ padding: '3px', maxHeight: '400px', overflowY: 'auto'}"
        >
        <template #header>
          <span>设置</span>
        </template>
        <div class="setting-inner">
          <el-form-item label="标题" prop="title">
            <el-input
              clearable
              placeholder="请输入标题"
              :maxlength="150"
              v-model="formData.title"
            ></el-input>
          </el-form-item>
          <el-form-item label="板块" prop="boardIds">
            <el-cascader
              placeholder="请选择板块"
              :options="boardList"
              :props="boardProps"
              clearable
              v-model="formData.boardIds"
              :style="{width: '100%'}"
            />
          </el-form-item>
          <!-- 封面 -->
          <el-form-item label="封面" prop="">
            <CoverUpload
              v-model="formData.cover"
              ></CoverUpload>
          </el-form-item>
          <!--textarea输入-->
          <el-form-item label="摘要" prop="summary">
            <el-input
              clearable
              placeholder="提示信息"
              type="textarea"
              :rows="4"
              :maxlength="200"
              resize="none"
              show-word-limit
              v-model="formData.summary"
            ></el-input>
          </el-form-item>
          <el-form-item label="附件" prop="">
            <AttachmentSelector
            v-model="formData.attachment"
            ></AttachmentSelector>
          </el-form-item>
          <el-form-item
            label="积分"
            prop="integral"
            v-if="formData.attachment">
            <el-input
            clearable
            placeholder="请输入积分"
            v-model="formData.integral"
            ></el-input>
            <span class="tips">附件下载积分0,表示无需积分下载</span>
          </el-form-item>
          <el-form-item label="" prop="">
            <el-button
            type="primary"
            :style="{width: '100%'}"
            @click="postHandler"
            >保存</el-button>
          </el-form-item>
        </div>
      </el-card>
   </div>
  </el-form>
 </div>

</template>

<style scoped>
.edit-post {
  margin-top: 62px;
  .post-panel {
    display: flex;
    .post-editor {
      flex: 1;
      margin: 0 10px;
      .changeEditor {
        cursor: pointer;
        display: flex;
        font-size: 13px;
        .title {
          flex: 1;
          font-size: 15px;
        }
        .change-editor-type {
          color: var(--link);
        }
      }
    }
    .post-setting {
      width: 430px;
      display: flex;
      flex-direction: column;
      margin-right: 15px;
      .setting-inner {
        padding-right: 15px;
        max-height: calc(100vh - 100px);
        overflow: auto;
      }
      .tips {
        color: #6e6e6e;
        font-size: 12px;
      }
    }
  }
}
</style>