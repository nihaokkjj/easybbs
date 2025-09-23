<script setup>
import CommentImage from './CommentImage.vue';
import { ref } from 'vue';
import { getCurrentInstance } from 'vue';

const {proxy} = getCurrentInstance()

const props = defineProps({
  articleId: {
    type: String
  },
  avatarWidth: {
    type: Number,
  },
  userId: {
    type: String
  },
  showInsertImg: {
    type: Boolean,
  },
  placeholderInfo: {
    type: String,
    default: "请文明发言,做一个棒棒的程序员!"
  },
  pCommentId: {
    type: Number,
  } ,
  replyUserId: {
    type: String
  },
})

const api = {
  postComment: "/comment/postComment",
}


const checkPostComment = (rule, value, callback) => {
  if (value === null && formData.value.image === null) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}
  const formData = ref({})
  const formDataRef = ref({})
  const rules = {
    content: [
      {required: true, message: "请输入评论内容", validator: checkPostComment},
      {min: 5, message: "评论至少5个字"}
    ]
  }

  const emit = defineEmits(["postCommentFinish"])

  const postCommentDo = () => {
    formDataRef.value.validate(async (valid) => {

      if (!valid) {
        return;
      }

      let params = Object.assign({}, formData.value)
      params.articleId = props.articleId
      params.pCommentId = props.pCommentId
      params.replyUserId = props.replyUserId
      
      let result = await proxy.Request({
        url: api.postComment,
        params,
      })
      proxy.Message.success("评论发表成功")
      formDataRef.value.resetFields()
      removeCommentImg()
      emit("postCommentFinish", result.data)
    }) 
  }
  // 选择图片
  const commentImg = ref(null)
  const selectImg = (file) => {
    file = file.file
    let img = new FileReader()
    img.readAsDataURL(file)
    img.onload = ({target}) => {
      let imgData = target.result
      commentImg.value = imgData
      formData.value.image = file
    }
  }

//删除图片
const removeCommentImg = () => {
  commentImg.value = null
  formData.value.image = null
}
</script>

<template>
  <div class="post-comment-panel">
    <Avatar 
    :width="avatarWidth" 
    :userId="userId"
    ></Avatar>
      <div class="comment-form">
        <el-form
          :model="formData"
          :rules="rules"
          ref="formDataRef"
        >
          <!-- textarea输入 -->
          <el-form-item  prop="content">
            <el-input
              clearable
              :placeholder=placeholderInfo
              type="textarea"
              :maxlength="200"
              resize="none"
              show-word-limit
              v-model="formData.content"
            >
            </el-input>
            <div 
              class="insert-img" 
              v-if="showInsertImg">
              <div class="pre-img" v-if="commentImg">
                <CommentImage 
                  :src="commentImg"
                ></CommentImage>
                <span
                 class="iconfont icon-remove"
                 @click="removeCommentImg"
                 ></span>
              </div>
              <el-upload 
              v-else
              name="file" 
              :show-file-list="false"
              accept=".png,.PNG,.jpg,.JPG,.jepg,.JEPG,.gif,.GIF,.bmp,.BMP"
              :multiple="false"
              :http-request="selectImg"
              >
                <span class="iconfont icon-image"></span>
              </el-upload>
          </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="send-btn" @click="postCommentDo">发表</div>
  </div>
</template>

<style scoped>
.post-comment-panel {
    margin-top: 10px;
    display: flex;
    align-items: top;
    .comment-form{
      margin: 0 10px;
      flex: 1;
      .insert-img {
        line-height: normal; 
        .iconfont {
          cursor: pointer;
          margin-top: 3px;
          font-size: 21px;
          color: #4b4848;
        }
        .pre-img {
          margin-top: 10px;
          position: relative;
          .iconfont {
            position: absolute;
            top: -10px;
            right: -10px;
            color: rgb(104, 102, 102);
          }
        }
      }
    }
    .send-btn {
      width: 55px;
      height: 55px;
      background: var(--link);
      color: #fff;
      text-align: center;
      line-height: 55px;
      font-size: 18px;
      border-radius: 10px;
      cursor: pointer;
  }
}

</style>