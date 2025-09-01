<script setup>
defineProps({
  content: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="tooltip-wrapper">
    <slot />
    <div class="tooltip-box">
      <div class="tooltip-arrow" />
      {{ content }}
    </div>
  </div>
</template>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-box {
  position: absolute;
  top: 100%; /* en dessous de l’élément */
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;

  background-color: white;
  color: black;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  z-index: 100;
  display: none;

  font-size:smaller;
}

.tooltip-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
}

/* Simple affichage au hover */
.tooltip-wrapper:hover .tooltip-box {
  display: block;
}
</style>
