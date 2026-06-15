<template>
  <div class="min-h-screen bg-surface text-foreground font-sans">
    <header class="border-b border-border px-6 py-4 flex items-center gap-3">
      <div class="w-2 h-2 rounded-full bg-accent animate-pulse-slow"></div>
      <span class="font-mono text-sm text-dim tracking-widest uppercase">Design Architecture Analyzer</span>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>