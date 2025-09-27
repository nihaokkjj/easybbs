<script setup>

const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  }, 
  title: {
    type: String,
    default: '标题',
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '30%'
  },
  top: {
    type: String,
    default: '50%'
  },
  buttons: {
    type: Array,
  },
  showCancle: {
    type: Boolean,
    default: true
  },

})

const emit = defineEmits(['close'])
const close = () => {
  emit('close')
}
</script>

<template>
  <div>
    <el-dialog
    :model-value="show"
    :show-close="showClose"
    :draggable="true"
    :close-on-click-modal="false"
    :title="title"
    :width="width"
    :top="top"
    class="cust-dialog"
    @close="close"
  >
  <div class="dialog-body">
    <slot></slot>
  </div>
    <template v-if="(buttons && buttons.length > 0 || showCancle)">
      <div class="dialog-footer">
        <el-button link @click="close()" v-if="showCancle">取消</el-button>
        <el-button v-for="btn in buttons" :type="btn.type" @click="btn.click()">
          {{ btn.text }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.cust-dialog {
  margin: 0px auto;
  width: 200px;
  .el-dialog__body {
    padding: 0px;
  }
  .dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    padding: 15px;
    min-height: 100px;
    max-height: calc(100vh - 300px);
    overflow: auto;
  }
  .dialog-footer {
    text-align: center;
    padding: 5px 20px;
  }
}
</style>