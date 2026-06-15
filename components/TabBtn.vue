<template>
  <button
    @click="$emit('click')"
    class="px-5 py-3 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-colors border-b-2"
    :class="active
      ? 'text-accent border-accent'
      : 'text-dim border-transparent hover:text-foreground'"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; active: boolean }>();
defineEmits(['click']);
</script>