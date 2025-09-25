<script setup>
import { useUserStore } from '@/store'
import { onBeforeUnmount, getCurrentInstance, ref} from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { BackgroundColor, TextStyle, FontFamily } from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image';
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
const {proxy} = getCurrentInstance()
const emit = defineEmits(['update:modelValue', 'htmlContent']);

const userStore = useUserStore()


const editor = useEditor({
  extensions: [
      StarterKit,
      TextStyle,
      BackgroundColor, 
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: `
      <p><span style="color: #777676">欢迎加入讨论！
          我们非常期待听到你的想法。
          请畅所欲言，分享你的见解和故事，
          你的声音对我们很重要。</span></p>
      `,
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
    emit("htmlContent", editor.getHTML());
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
  if (editor.value === null) return
  editor.value.destroy()
})

//颜色选择
const colorOptions = [
  {
    value: '#E63415',
    label: 'red',
  },
  {
    value: '#FF6600',
    label: 'orange',
  },
  {
    value: '#FFDE0A',
    label: 'yellow',
  },
  {
    value: '#1EC79D',
    label: 'green',
  },
  {
    value: '#14CCCC',
    label: 'cyan',
  },
  {
    value: '#4167F0',
    label: 'blue',
  },
  {
    value: '#6222C9',
    label: 'purple',
  },
  {
    value: '#ffffff',
    label: 'white',
  },
]

const colorValue = ref('')

const changeColor = (color) => {
  editor.value.chain().focus().setBackgroundColor(color).run()
}
const unsetBackgroundColor = () => {
  colorValue.value = ''
  editor.value.chain().focus().unsetBackgroundColor().run()
}

//字体选择
const fontOptions = [
{ value: 'Inter', label: 'Inter' },
{ value: 'Comic Sans MS, Comic Sans', label: 'Comic Sans' },
{ value: 'serif', label: 'Serif' },
{ value: 'monospace', label: 'Monospace' },
{ value: 'cursive', label: 'Cursive' },
]

const fontValue =ref('')

const changeFont = (font) => {
  editor.value.chain().focus().setFontFamily(font).run()
}

const unsetFontFamily = () => {
  fontValue.value = ''
  editor.value.chain().focus().unsetFontFamily().run()
}
</script>

<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <!-- <div class="colorSelector"> -->
          <input
            type="color"
            @input.prevent="editor.chain().focus().setBackgroundColor($event.target.value).run()"
            :value="editor.getAttributes('textStyle').backgroundColor || '#ffffff'"
            data-testid="setBackgroundColor"
            :style="{border: '1px solid #ddd'}"
          />
          <el-select
            v-model="colorValue"
            placeholder="背景颜色"
            style="width: 100px"
          >
          <el-option
          v-for="item in colorOptions"
          :ket="item.value"
          :label="item.label"
          :value="item.value"
          @click="changeColor(item.value)"
          >
            <div class="flex items-center">
            <el-tag :color="item.value" style="margin-right: 8px" size="small" />
            <span :style="{ color: item.value }">{{ item.label }}</span>
          </div>
        </el-option>
        <!-- <span>&nbsp;&nbsp;</span> -->
        </el-select>
          <button 
            type="button"
            @click="unsetBackgroundColor">
            无背景色
          </button>
      <!-- </div> -->
        <div class="button-group">
          <el-select
            v-model="fontValue"
            placeholder="字体样式"
            style="width: 100px"
          >
          <el-option
          v-for="item in fontOptions"
          :ket="item.value"
          :label="item.label"
          :value="item.value"
          @click="changeFont(item.value)"
          >
            <div class="flex items-center">
            <el-tag :color="item.value" style="margin-right: 8px" size="small" />
            <span :style="{ color: item.value }">{{ item.label }}</span>
          </div>
        </el-option>
        </el-select>
        <button 
        type="button"
        @click="unsetFontFamily"
        >默认样式</button>
      </div>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>

</template>

<style scoped>

  :deep(.ProseMirror) {
      outline: none;
      border: none;
    }
.container {
  /* Use flexbox to organize the editor and its controls */
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.control-group {
  /* Style for the toolbar group */
  background: #fff;
  border: 1px solid #ccc;
  padding: 2px;
  border-radius: 5px 5px 0 0;
  border-bottom: none;
}
.colorSelector {
  align-items: center;
  text-align: center;
  margin-right: 10px;
}


.button-group {
  /* Style for the buttons within the toolbar */
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* Adds space between buttons */
  align-items: center;
}
.el-tag {
  border: none;
  aspect-ratio: 1;
}
button {
  /* Basic button styles */
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 5px 2px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

button:hover {
  background-color: #e9e9e9;
  border-color: #bbb;
}

/* Active state for buttons, when the color is applied */
button.is-active {
  background-color: #333;
  color: #fff;
  border-color: #333;
}

/* Specific button colors for better visual indication */
button[data-testid="setPurple"] {
  background-color: #958DF1;
}

button[data-testid="setRed"] {
  background-color: #F98181;
}

button[data-testid="setOrange"] {
  background-color: #FBBC88;
}

button[data-testid="setYellow"] {
  background-color: #FAF594;
}

button[data-testid="setBlue"] {
  background-color: #70CFF8;
}

button[data-testid="setTeal"] {
  background-color: #94FADB;
}

button[data-testid="setGreen"] {
  background-color: #B9F18D;
}

/* Style for the color input field */
input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  width: 30px;
  height: 30px;
  border: none;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

input[type="color"]::-moz-color-swatch {
  border: none;
  border-radius: 4px;
}

</style>