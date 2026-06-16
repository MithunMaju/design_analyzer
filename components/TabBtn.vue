<template>
  <button
    @click="$emit('click')"
    class="px-5 py-4 font-display text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 font-bold"
    :class="active
      ? 'text-theme-dark border-theme-dark'
      : 'text-theme-muted border-transparent hover:text-theme-dark'"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; active: boolean }>();
defineEmits(['click']);
</script>