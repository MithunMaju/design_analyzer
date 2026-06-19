<template>
  <button
    @click="$emit('click')"
    class="px-5 py-4 font-display text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 font-bold"
    :class="active
      ? 'text-neutral-900 border-accent-chrono'
      : 'text-neutral-400 border-transparent hover:text-neutral-700'"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; active: boolean }>();
defineEmits(['click']);
</script>