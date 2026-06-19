<template>
  <div class="max-w-5xl mx-auto px-6 py-4">
    <!-- Combined Hero and CTA Container -->
    <div class="relative w-full border border-white/10 bg-black rounded-2xl overflow-hidden mb-16 min-h-[340px] shadow-2xl">
      <!-- Black background image -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <img
          src="~/public/images/black_hero.jpg"
          alt="Design Analyzer background"
          class="h-full w-full object-cover opacity-80"
        />
      </div>

      <!-- Left side (foreground details and CTA) -->
      <div class="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-between relative z-10 min-h-[340px]">
        <div>
          <span class="font-display text-[9px] text-neutral-400 uppercase tracking-widest font-semibold block mb-4">Pipeline Status: Online</span>
          <h1 class="text-4xl md:text-5xl font-display font-bold text-white leading-tight mt-2 mb-6 uppercase tracking-wide">
            design analyzer
          </h1>
          <p class="text-neutral-300 font-sans text-xs leading-relaxed max-w-md mb-8">
            Deep bundle deconstruction extracts real custom properties, routes, and libraries from live website CSS/JS. Real data, no deceptions.
          </p>
        </div>
        
        <div class="w-full mt-4">
          <NuxtLink
            to="/deconstruct"
            class="inline-flex items-center justify-center px-8 h-12 bg-white hover:bg-neutral-200 text-black font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_#333] rounded-lg transition-all whitespace-nowrap"
          >
            Deconstruct New Site →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
        <div>
          <span class="font-display text-[9px] text-theme-muted uppercase tracking-widest font-semibold block mb-1">Crawl Repository</span>
          <h2 class="font-display font-bold text-2xl uppercase tracking-wider text-theme-dark">Deconstruction History</h2>
        </div>
        
        <!-- Search Controls -->
        <div v-if="history.length" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search history..."
            class="px-4 py-2 bg-theme-card-bg border border-theme-border rounded-lg text-theme-dark placeholder-theme-muted/60 font-mono text-xs focus:outline-none focus:border-theme-dark/40 transition-colors w-full sm:w-64"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-6 h-6 border-2 border-theme-dark border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs text-theme-muted mt-2 font-mono">Loading shared history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredHistory.length === 0" class="bg-theme-card-bg border border-theme-border rounded-2xl p-12 text-center shadow-sm">
        <div class="w-12 h-12 rounded-full bg-theme-bg flex items-center justify-center mx-auto mb-4 border border-theme-border">
          <svg class="w-6 h-6 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="font-display text-sm text-theme-dark uppercase font-bold tracking-wider mb-2">No Deconstructed Sites</h3>
        <p class="text-xs text-theme-muted max-w-md mx-auto leading-relaxed mb-6">
          {{ searchQuery ? 'No search results match your query. Try searching for a different domain or title.' : 'Analyze a website to deconstruct its bundles and generate design reports. Reports are stored in a shared global repository.' }}
        </p>
        <NuxtLink
          to="/deconstruct"
          class="inline-flex items-center justify-center px-6 py-2.5 bg-theme-dark hover:bg-theme-muted text-white font-display font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg"
        >
          Start First Analysis
        </NuxtLink>
      </div>

      <!-- History List -->
      <div v-else class="grid grid-cols-1 gap-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
        <div
          v-for="item in filteredHistory"
          :key="item.url"
          class="bg-theme-card-bg border border-theme-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <!-- Left side: info and stats -->
          <div class="space-y-3 flex-1">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 class="font-display font-bold text-base text-theme-dark uppercase tracking-wide">
                {{ item.title }}
              </h3>
              <a
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="font-mono text-xs text-theme-muted hover:text-theme-dark underline transition-colors"
              >
                {{ item.domain }}
              </a>
            </div>
            
            <div class="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-mono text-theme-muted">
              <span>Analyzed: {{ item.date }}</span>
              <span class="hidden sm:inline">•</span>
              <!-- Stats badges -->
              <span v-if="item.result?.curated?.customProperties?.length">
                Tokens: <strong class="text-theme-dark font-semibold">{{ item.result.curated.customProperties.length }}</strong>
              </span>
              <span v-if="getLibraryCount(item)">
                Libraries: <strong class="text-theme-dark font-semibold">{{ getLibraryCount(item) }}</strong>
              </span>
              <span v-if="item.result?.curated?.routes?.length">
                Routes: <strong class="text-theme-dark font-semibold">{{ item.result.curated.routes.length }}</strong>
              </span>
            </div>
          </div>

          <!-- Right side: Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink
              :to="`/deconstruct?url=${encodeURIComponent(item.url)}`"
              class="px-4 py-2 bg-theme-dark hover:bg-theme-muted text-white font-display text-[9px] uppercase tracking-widest shadow-sm transition-all rounded-lg"
            >
              View Report
            </NuxtLink>
            
            <button
              @click="downloadReport(item)"
              class="px-4 py-2 bg-theme-bg border border-theme-border hover:bg-theme-border/30 text-theme-dark font-display text-[9px] uppercase tracking-widest shadow-sm transition-all rounded-lg"
            >
              Download .md
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('');
const history = ref<any[]>([]);
const loading = ref(false);

onMounted(() => {
  loadHistory();
});

async function loadHistory() {
  loading.value = true;
  try {
    history.value = await $fetch('/api/history');
  } catch (e) {
    console.warn('Failed to load crawl history:', e);
  } finally {
    loading.value = false;
  }
}

const filteredHistory = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return history.value;
  return history.value.filter((item: any) => 
    item.title?.toLowerCase().includes(query) || 
    item.domain?.toLowerCase().includes(query) ||
    item.url?.toLowerCase().includes(query)
  );
});

function getLibraryCount(item: any) {
  const d = item.result?.curated?.detectedLibraries;
  if (!d) return 0;
  return (d.domConfirmed?.length || 0) + (d.scriptConfirmed?.length || 0) + (d.bundleHints?.length || 0);
}

async function downloadReport(item: any) {
  try {
    const detail = await $fetch<any>(`/api/report-detail?url=${encodeURIComponent(item.url)}`);
    if (!detail?.report) return;
    
    const slug = (item.title || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const blob = new Blob([detail.report], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${slug || 'design-report'}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (e) {
    console.error('Failed to download report:', e);
    alert('Failed to retrieve and download the report. It may have been deleted.');
  }
}
</script>

<style scoped>
/* Custom premium scrollbar for the history container */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e2df; /* matches our theme border color */
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #777777; /* matches our theme muted color */
}
</style>
