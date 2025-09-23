<script setup>
import { useUserStore } from '@/store'
import { onBeforeUnmount} from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Aim } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  height: {
    type: Number,
    default: 500,
  },
})
const emit = defineEmits(['update:modelValue', 'update:html']);

const userStore = useUserStore()

const editor = useEditor({
  extensions: [
      StarterKit.configure({undoRedo: false,}),  
      Highlight.configure({ multicolor: true }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Placeholder.configure({
      placeholder: '请输入内容...', // 你想要的提示文本
    }),
  ],
  onDrop: ({ event, editor }) => {
    // 监听拖拽事件，处理图片上传
    const hasFiles = event.dataTransfer?.files?.length;
Aim
    if (!hasFiles) {
      return;
    }

    const file = event.dataTransfer.files[0];
    if (file.type.startsWith('image/')) {
      uploadImage(file, editor);
      event.preventDefault(); // 阻止浏览器默认行为，避免打开图片
    }
  },
  onPaste: ({ event, editor }) => {
    // 监听粘贴事件，处理图片上传
    const hasFiles = event?.clipboardData?.files?.length;
    if (!hasFiles) {
      return;
    }

    const file = event.clipboardData.files[0];
    if (file.type.startsWith('image/')) {
      uploadImage(file, editor);
      event.preventDefault(); // 阻止浏览器默认行为
    }
  },
  onUpdate: ({ editor }) => {
    // 监听内容变化，同步 v-model
    emit("update:modelValue", editor.getHTML());
    emit("update:html", editor.getHTML());
  },
});

// 自定义上传函数
const uploadImage = async (file, editorInstance) => {
  
  let result = await proxy.Request({
    url: '/api/file/uploadImage', 
    params: {
      file: file,
    },
  });

  if (!result || result.code !== 200) {
    // 登录超时或其他错误
    if (result && result.code === 901) {
      // 登录超时处理逻辑
      userStore.showLogin = true
      return
    }
    proxy.Message.error(result.info || '图片上传失败');
    return;
  }

  // 成功后，获取图片 URL 并插入到编辑器
  const url = proxy.globalInfo.imageUrl + result.data.fileName;
  editorInstance.commands.setImage({ src: url });
  // 确保图片后有可供光标定位的空段落
  editorInstance.commands.enter();
}

 onBeforeUnmount(() => {
  if (editor === null) return
  editor.destroy()
})

</script>

<template>
<div class="title">html编辑器</div>
  <editor-content
   :editor="editor"
   class="editor" 
  ></editor-content>
</template>

<style scoped>

  .title {
    background: #fff;
    font-size: 25px;
    text-align: center;
    padding: 5px 0;
  }
  .editor {
    padding: 10px 20px;
    background: #fff;
    border: 1px solid #e2dfdf;
    border-radius: 5px;
    min-height: 285px;
  }
  :deep(.ProseMirror) {
      outline: none;
      border: none;
    }

</style>