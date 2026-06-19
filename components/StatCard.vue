<template>
  <div class="bg-[#0d0d0e]/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-sm transform hover:-translate-y-0.5 transition-all duration-300">
    <p class="font-display text-4xl font-bold text-white tracking-tight">{{ value }}</p>
    <p class="font-sans text-[10px] text-neutral-400 uppercase tracking-wider mt-2 font-medium">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: number }>();
</script>