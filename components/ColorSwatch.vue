<template>
  <div
    v-if="isColor"
    class="w-4 h-4 rounded border border-border/50 flex-shrink-0"
    :style="{ background: value }"
  ></div>
  <div v-else class="w-4 h-4 rounded bg-border/50 flex-shrink-0"></div>
</template>

<script setup lang="ts">
const props = defineProps<{ value: string }>();

const isColor = computed(() =>
  /^#[0-9a-fA-F]{3,8}$/.test(props.value.trim()) ||
  /^rgba?\(/.test(props.value.trim()) ||
  /^hsla?\(/.test(props.value.trim())
);
</script>