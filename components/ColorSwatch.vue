<template>
  <div
    v-if="isColor"
    class="w-5 h-5 rounded-full border border-theme-border flex-shrink-0 shadow-sm"
    :style="{ background: value }"
  ></div>
  <div v-else class="w-5 h-5 rounded-full bg-theme-border/60 border border-theme-border flex-shrink-0"></div>
</template>

<script setup lang="ts">
const props = defineProps<{ value: string }>();

const isColor = computed(() =>
  /^#[0-9a-fA-F]{3,8}$/.test(props.value.trim()) ||
  /^rgba?\(/.test(props.value.trim()) ||
  /^hsla?\(/.test(props.value.trim())
);
</script>