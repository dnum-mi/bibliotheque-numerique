<script setup>
import { ref, defineExpose } from 'vue'

defineProps({
  message: String,
})

const isOpen = ref(false)
const resolve = ref(null)

const open = () => {
  isOpen.value = true
  return new Promise((res) => {
    resolve.value = res
  })
}

const close = () => {
  isOpen.value = false
  if (resolve.value) {
    resolve.value(false)
  }
}

const confirm = () => {
  isOpen.value = false
  if (resolve.value) {
    resolve.value(true)
  }
}

defineExpose({ open })
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <p>{{ message }}</p>
      <div class="modal-buttons">
        <button @click="confirm">
          Confirmer
        </button>
        <button @click="close">
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1001;
  min-width: 300px;
}
.modal-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
