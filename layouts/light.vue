<template>
  <div class="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-950/10 pt-8 relative overflow-x-hidden">
    <!-- Layer 1: Static Base Grid (Always visible at 3% opacity) -->
    <div class="fixed inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
    
    <!-- Layer 2: Interactive Glow Grid (Lights up in teal near the mouse cursor) -->
    <div 
      class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300"
      :style="glowGridStyle"
    ></div>
    
    <main class="relative z-10">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

const mouseX = ref(0);
const mouseY = ref(0);
const isHovering = ref(false);

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseleave', handleMouseLeave);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseleave', handleMouseLeave);
});

const glowGridStyle = computed(() => {
  const mask = `radial-gradient(300px circle at ${mouseX.value}px ${mouseY.value}px, black 0%, transparent 100%)`;
  return {
    backgroundImage: 'linear-gradient(to right, #208b9b 1px, transparent 1px), linear-gradient(to bottom, #208b9b 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    maskImage: mask,
    WebkitMaskImage: mask,
    opacity: isHovering.value ? 0.25 : 0
  };
});
</script>
