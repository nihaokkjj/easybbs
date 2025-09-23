<script setup>
import EditorMarkdown from '@/components/EditorMarkdown.vue';
import EditorHtml from '@/components/EditorHtml.vue';

import {ref, getCurrentInstance} from 'vue'
import CoverUpload from '@/components/CoverUpload.vue';
import AttachmentSelector from '@/components/AttachmentSelector.vue';

const {proxy} = getCurrentInstance()

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
    {required: true, message: "请输入内容"}
  ],
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

loadBoardList()

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
          <span>正文</span>
        </template>
      </el-card>
      <!-- <EditorMarkdown :height="markdownHeight"></EditorMarkdown> -->
      <EditorHtml></EditorHtml>
      </div>
      
    <div class="post-setting">
      <el-card
       :body-style="{ padding: '3px', maxHeight: '400px', overflowY: 'auto'}"
       class="c">
        <template #header>
          <span>设置</span>
        </template>
        <div class="setting-inner">
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
              :rows="5"
              :maxlength="150"
              resize="none"
              show-word-limit
              v-model="formData.summary"
            ></el-input>
          </el-form-item>
          <el-form-item label="附件" prop="">
            <AttachmentSelector
            v-model="formData.attachment"></AttachmentSelector>
          </el-form-item>
          <el-form-item label="" prop="">
            <el-button
            type="primary"
            :style="{width: '100%'}">保存</el-button>
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
    }
    .post-setting {
      width: 450px;
      display: flex;
      flex-direction: column;
      margin-right: 15px;
      .setting-inner {
        padding-right: 15px;
        max-height: calc(100vh - 100px);
        overflow: auto;
      }
    }
  }
}
</style>