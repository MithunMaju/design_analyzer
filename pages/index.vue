<template>
  <div class="max-w-5xl mx-auto px-6 py-4">
    <!-- Combined Hero and CTA Container -->
    <div class="relative w-full border border-white/10 bg-black rounded-2xl overflow-hidden mb-20 min-h-[380px] shadow-2xl flex flex-col lg:flex-row items-stretch">
      <!-- Black background image -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <img
          src="~/public/images/black_hero.jpg"
          alt="Design Analyzer background"
          class="h-full w-full object-cover opacity-75"
        />
      </div>

      <!-- Left side (foreground details and CTA) -->
      <div class="w-full lg:w-3/5 p-8 md:p-12 flex flex-col justify-between relative z-10 min-h-[380px]">
        <div>
          <span class="font-display text-[9px] text-neutral-400 uppercase tracking-widest font-semibold block mb-4">Pipeline Status: Online</span>
          <h1 class="text-4xl md:text-5xl font-display font-bold text-white leading-tight mt-2 mb-6 uppercase tracking-wide">
            design analyzer
          </h1>
          <p class="text-neutral-300 font-sans text-xs leading-relaxed max-w-md mb-8">
            Reverse-engineer any live web design system. Dissect computed CSS variables, Tailwind tokens, routing paths, and dependency packages directly from live browser bundles. Refined by Gemini AI.
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

      <!-- Right side: Floating Mockup Preview -->
      <div class="hidden lg:flex items-center justify-center lg:w-2/5 p-8 relative z-10">
        <div class="w-full max-w-[340px] bg-theme-card-bg/95 border border-theme-border rounded-2xl p-4 shadow-xl relative overflow-hidden backdrop-blur-md">
          <!-- Browser Header -->
          <div class="flex items-center gap-1.5 border-b border-theme-border pb-3 mb-4">
            <span class="w-2 h-2 rounded-full bg-red-400/80"></span>
            <span class="w-2 h-2 rounded-full bg-yellow-400/80"></span>
            <span class="w-2 h-2 rounded-full bg-green-400/80"></span>
            <span class="font-mono text-[8px] text-theme-muted ml-3 uppercase tracking-wider">deconstruct_session_active</span>
          </div>
          
          <!-- Code Block / Tokens preview inside browser -->
          <div class="space-y-3 font-mono text-[9px] text-theme-muted">
            <div><span class="text-indigo-500 font-semibold">const</span> designSystem = {</div>
            <div class="pl-3">colors: {</div>
            <div class="pl-6 flex items-center gap-2">
              primary: <span class="text-neutral-900 font-semibold">"#0f172a"</span>,
              <span class="w-2.5 h-2.5 rounded bg-slate-900 border border-neutral-300"></span>
            </div>
            <div class="pl-6 flex items-center gap-2">
              accent: <span class="text-neutral-900 font-semibold">"#6366f1"</span>,
              <span class="w-2.5 h-2.5 rounded bg-indigo-500 border border-neutral-300"></span>
            </div>
            <div class="pl-3">},</div>
            <div class="pl-3">fontStack: <span class="text-neutral-900 font-semibold">"Space Grotesk, Inter"</span>,</div>
            <div class="pl-3">libraries: [</div>
            <div class="pl-6"><span class="px-1.5 py-0.5 bg-neutral-100 border border-theme-border text-theme-dark font-sans text-[7px] uppercase tracking-wider font-bold rounded">Vue 3</span>, <span class="px-1.5 py-0.5 bg-neutral-100 border border-theme-border text-theme-dark font-sans text-[7px] uppercase tracking-wider font-bold rounded">Tailwind</span>]</div>
            <div class="pl-3">]</div>
            <div>};</div>
          </div>
          
          <!-- Floating mini badge -->
          <div class="absolute -right-2 -bottom-2 bg-theme-dark border border-neutral-800 text-white rounded-xl p-3 shadow-2xl w-36 font-mono text-[8px] uppercase tracking-wider space-y-1.5">
            <span class="text-neutral-400 block text-[7px]">Pipeline Status</span>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini Ready</span>
            </div>
            <div class="border-t border-neutral-800 pt-1.5 text-[7px] text-neutral-400">
              128 custom props
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Capabilities Grid Section -->
    <div class="mb-20">
      <div class="text-center max-w-xl mx-auto mb-12">
        <span class="font-display text-[9px] text-theme-muted uppercase tracking-widest font-semibold block mb-2">Capabilities</span>
        <h2 class="font-display font-bold text-2xl uppercase tracking-wider text-theme-dark">Reverse Engineering Kit</h2>
        <p class="text-theme-muted text-[11px] font-sans mt-2 leading-relaxed">Dissect, inspect, and analyze any modern web framework design system instantly.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Feature 1 -->
        <div class="bg-theme-card-bg border border-theme-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div class="w-8 h-8 rounded-lg bg-theme-bg border border-theme-border flex items-center justify-center mb-4">
            <svg class="w-4 h-4 text-theme-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-theme-dark uppercase tracking-wider mb-2">Token Extractor</h3>
          <p class="text-[11px] text-theme-muted leading-relaxed font-sans">
            Dissects computed styles to discover CSS custom properties, variables, and font-family stacks. Generates interactive color swatches automatically.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="bg-theme-card-bg border border-theme-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div class="w-8 h-8 rounded-lg bg-theme-bg border border-theme-border flex items-center justify-center mb-4">
            <svg class="w-4 h-4 text-theme-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-theme-dark uppercase tracking-wider mb-2">Tailwind reverse-engineering</h3>
          <p class="text-[11px] text-theme-muted leading-relaxed font-sans">
            Scans document node classes to reverse-engineer custom theme configuration settings, arbitrary values, and framework versions.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="bg-theme-card-bg border border-theme-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div class="w-8 h-8 rounded-lg bg-theme-bg border border-theme-border flex items-center justify-center mb-4">
            <svg class="w-4 h-4 text-theme-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-theme-dark uppercase tracking-wider mb-2">Stack Auditor</h3>
          <p class="text-[11px] text-theme-muted leading-relaxed font-sans">
            Identifies JS runtime globals, library tags, and script URLs to audit frameworks (Vue, React, Svelte, Alpine) and bundler configs (Vite, Webpack).
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="bg-theme-card-bg border border-theme-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div class="w-8 h-8 rounded-lg bg-theme-bg border border-theme-border flex items-center justify-center mb-4">
            <svg class="w-4 h-4 text-theme-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-theme-dark uppercase tracking-wider mb-2">AI Architectural Reports</h3>
          <p class="text-[11px] text-theme-muted leading-relaxed font-sans">
            Feeds structural extraction logs to Gemini 2.5 API to write detailed architectural markdown reports outlining brand DNA, typography, color scheme, and blueprint.
          </p>
        </div>
      </div>
    </div>

    <!-- Workflow Section -->
    <div class="mb-20 bg-black border border-white/10 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
      <!-- Grid pattern background -->
      <div class="absolute inset-0 z-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div class="relative z-10 text-center max-w-xl mx-auto mb-10">
        <span class="font-display text-[9px] text-neutral-400 uppercase tracking-widest block mb-2 font-semibold">The Pipeline</span>
        <h2 class="font-display font-bold text-xl uppercase tracking-wider text-white">How Deconstruction Works</h2>
      </div>

      <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Step 1 -->
        <div class="space-y-3">
          <div class="font-mono text-[9px] text-neutral-500 font-bold uppercase tracking-wider">01 / Edge Crawl</div>
          <h4 class="font-display text-xs font-semibold uppercase tracking-wider text-white">Browser Sandbox</h4>
          <p class="text-[10px] text-neutral-300 font-sans leading-relaxed">
            Spins up headless Chromium instances globally via Cloudflare Puppeteer to render the website layout and capture viewport images.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="space-y-3">
          <div class="font-mono text-[9px] text-neutral-500 font-bold uppercase tracking-wider">02 / Code Dissect</div>
          <h4 class="font-display text-xs font-semibold uppercase tracking-wider text-white">Evidence Parser</h4>
          <p class="text-[10px] text-neutral-300 font-sans leading-relaxed">
            Injects DOM analyzer scripts to map calculated colors, CSS properties, fonts, scripts, and navigation routes. Includes server HTML fallbacks.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="space-y-3">
          <div class="font-mono text-[9px] text-neutral-500 font-bold uppercase tracking-wider">03 / AI Synthesis</div>
          <h4 class="font-display text-xs font-semibold uppercase tracking-wider text-white">Gemini Generator</h4>
          <p class="text-[10px] text-neutral-300 font-sans leading-relaxed">
            Synthesizes all parsed data nodes using Gemini AI into an academic markdown design report, including brand DNA, typography, color scheme, and blueprint.
          </p>
        </div>
      </div>
    </div>

    <!-- History Section (Shared Repository Ledger) -->
    <div class="space-y-6 mb-16">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
        <div>
          <span class="font-display text-[9px] text-theme-muted uppercase tracking-widest font-semibold block mb-1">Crawl Repository</span>
          <h2 class="font-display font-bold text-xl uppercase tracking-wider text-theme-dark">Shared Deconstructions Ledger</h2>
        </div>
        
        <!-- Search Controls -->
        <div v-if="history.length" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search repository..."
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

      <!-- History Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredHistory"
          :key="item.url"
          class="group bg-theme-card-bg border border-theme-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <!-- Card Thumbnail with Aspect Ratio 1200/630 -->
          <NuxtLink
            :to="`/deconstruct?url=${encodeURIComponent(item.url)}`"
            class="relative w-full aspect-[1200/630] overflow-hidden bg-neutral-900 border-b border-theme-border flex items-center justify-center cursor-pointer"
          >
            <!-- SVG illustration if generated by Gemini -->
            <div
              v-if="item.svg"
              v-html="item.svg"
              class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
            ></div>
            <!-- Screenshot image -->
            <img
              v-else-if="item.screenshot"
              :src="`data:image/jpeg;base64,${item.screenshot}`"
              alt="Website preview"
              class="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <!-- Premium Placeholder pattern if no screenshot -->
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[linear-gradient(to_bottom_right,#171717,#0a0a0a)] text-center select-none">
              <!-- Grid background lines -->
              <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]"></div>
              <!-- Code block mock -->
              <div class="relative font-mono text-[8px] text-neutral-500 mb-2 max-w-full truncate">
                &lt;{{ item.domain }}&gt;
              </div>
              <span class="text-[9px] uppercase tracking-widest font-mono text-neutral-400 font-bold border border-neutral-800 px-2 py-1 rounded bg-black/40 relative z-10">
                Screenshot Skipped
              </span>
            </div>
            <!-- Vignette overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          </NuxtLink>

          <!-- Card Body -->
          <div class="p-5 flex-1 flex flex-col">
            <!-- Category Tag -->
            <div class="flex items-center gap-1.5 mb-2.5">
              <span class="w-[2px] h-2.5 rounded-full" :class="getCategoryColor(item.category)"></span>
              <span class="text-[9px] font-bold uppercase tracking-wider text-theme-muted">
                {{ item.category }}
              </span>
            </div>

            <!-- Title & Domain -->
            <NuxtLink
              :to="`/deconstruct?url=${encodeURIComponent(item.url)}`"
              class="block group-hover:underline cursor-pointer"
            >
              <h3 class="font-display font-bold text-sm text-theme-dark uppercase tracking-wide line-clamp-1">
                {{ item.title }}
              </h3>
            </NuxtLink>
            
            <a
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block font-mono text-[10px] text-theme-muted hover:text-indigo-600 transition-colors mt-1 mb-3 truncate max-w-full"
            >
              {{ item.domain }}
            </a>

            <!-- Description / Design Summary -->
            <p class="text-[11px] text-theme-muted font-sans leading-relaxed line-clamp-3 mb-5">
              {{ item.summary || 'Reverse engineering report detailing layout architecture, colors, custom properties, and library ecosystems for ' + item.title + '.' }}
            </p>

            <!-- Card Footer Stats and Actions -->
            <div class="mt-auto pt-4 border-t border-theme-border/60 flex items-center justify-between text-[9px] font-mono text-theme-muted gap-2">
              <div class="flex items-center gap-3">
                <span title="Tokens Count">Tokens: <strong>{{ item.result?.curated?.customProperties?.length || 0 }}</strong></span>
                <span title="Libraries Count">Libraries: <strong>{{ getLibraryCount(item) }}</strong></span>
              </div>
              
              <div class="flex items-center gap-2">
                <button
                  @click.stop.prevent="downloadReport(item)"
                  class="px-2.5 py-1 bg-theme-bg border border-theme-border hover:bg-theme-border/50 text-theme-dark font-display text-[8px] uppercase tracking-wider rounded transition-colors whitespace-nowrap"
                >
                  Download .md
                </button>
              </div>
            </div>
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
const userDeconstructedUrls = ref<string[]>([]);

onMounted(() => {
  loadHistory();
  if (process.client) {
    const stored = localStorage.getItem('user_deconstructions');
    if (stored) {
      try {
        userDeconstructedUrls.value = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse user deconstructions from local storage:', e);
        userDeconstructedUrls.value = [];
      }
    } else {
      userDeconstructedUrls.value = [];
    }
  }
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
  // Only show deconstructions that this user has performed or viewed
  const list = history.value.filter((item: any) => userDeconstructedUrls.value.includes(item.url));

  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return list;
  return list.filter((item: any) => 
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

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    'Travel & Tourism': 'bg-rose-500',
    'Shopping & E-commerce': 'bg-amber-500',
    'Finance & Payments': 'bg-emerald-500',
    'AI & Machine Learning': 'bg-indigo-500',
    'Productivity & SaaS': 'bg-violet-500',
    'Portfolio & Personal': 'bg-cyan-500',
    'Media & Content': 'bg-blue-500',
    'Developer Tools': 'bg-slate-700',
    'Social & Community': 'bg-orange-500',
    'Technology': 'bg-teal-500'
  };
  return colors[category] || 'bg-neutral-500';
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
