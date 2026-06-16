<template>
  <div class="bg-theme-card-bg border border-theme-border rounded-xl p-5 shadow-sm transform hover:-translate-y-0.5 transition-all duration-300">
    <p class="font-display text-4xl font-bold text-theme-dark tracking-tight">{{ value }}</p>
    <p class="font-sans text-[10px] text-theme-muted uppercase tracking-wider mt-2 font-medium">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: number }>();
</script>