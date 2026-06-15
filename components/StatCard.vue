<template>
  <div class="bg-panel border border-border rounded-xl p-4">
    <p class="font-mono text-2xl font-bold text-foreground">{{ value }}</p>
    <p class="font-mono text-xs text-dim uppercase tracking-widest mt-1">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: number }>();
</script>