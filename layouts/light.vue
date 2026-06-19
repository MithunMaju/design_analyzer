<template>
  <div class="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-950/10 pt-8 relative overflow-x-hidden">
    <!-- Clean grid decoration background (Outcrowd style) -->
    <div class="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
    
    <main class="relative z-10">
      <slot />
    </main>
  </div>
</template>
