<template>
  <div 
    class="min-h-screen text-white font-sans selection:bg-white/10 pt-8 bg-cover bg-center bg-fixed bg-no-repeat relative bg-[#030303]"
    style="background-image: url('/images/starry_bg.jpg');"
  >
    <!-- Soft overlay to blend starry background into ChronoTask deep dark theme -->
    <div class="absolute inset-0 bg-black/70 z-0 pointer-events-none"></div>
    
    <main class="relative z-10">
      <slot />
    </main>
  </div>
</template>