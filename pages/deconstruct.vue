<template>
  <div class="max-w-5xl mx-auto px-6 py-4">
    <!-- Back to Home Link -->
    <div class="mb-6 flex justify-between items-center">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white uppercase tracking-widest font-mono font-bold transition-colors">
        <span>← Back to Home</span>
      </NuxtLink>
    </div>

    <!-- Combined Hero and URL Input Container -->
    <div id="deconstruct" class="relative w-full border border-white/10 bg-black rounded-2xl overflow-hidden mb-16 min-h-[380px] shadow-2xl">
      <!-- Black background image -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <img
          src="~/public/images/black_hero.jpg"
          alt="Design Analyzer background"
          class="h-full w-full object-cover"
        />
      </div>

      <!-- Left side (foreground details and input) -->
      <div class="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-between relative z-10 min-h-[380px]">
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
          <span class="font-display text-[10px] text-white/90 font-bold uppercase tracking-widest block mb-2 font-semibold">Target URL to Analyze</span>
          <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end w-full">
            <input
              v-model="url"
              type="url"
              placeholder="https://linear.app"
              class="flex-1 h-12 bg-transparent border border-white rounded-lg px-4 text-white placeholder-neutral-500 font-mono text-sm focus:outline-none transition-colors"
              @keydown.enter="analyze"
            />
            <button
              @click="analyze"
              :disabled="loading || !url"
              class="px-8 h-12 bg-white hover:bg-neutral-200 disabled:opacity-60 text-black font-display font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_#333] rounded-lg transition-all whitespace-nowrap"
            >
              {{ loading ? 'Analyzing...' : 'Deconstruct' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress / Status -->
    <div v-if="loading" class="bg-black border border-white/10 rounded-2xl p-6 mb-16 shadow-2xl">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
        <span class="font-display text-[10px] text-white uppercase tracking-widest font-bold">{{ statusMsg }}</span>
      </div>
      <div class="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
        <div
          class="bg-white h-1 transition-all duration-500"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-black border border-white/10 rounded-2xl p-6 mb-16 text-left shadow-2xl">
      <p class="font-display text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-2">Extraction Error</p>
      <p class="text-white font-mono text-xs">{{ error }}</p>
    </div>

    <!-- Results section (The House Blend) -->
    <div v-if="result" class="space-y-10 border-t border-theme-border pt-16 mb-20" id="results">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <span class="font-display text-[9px] text-theme-muted uppercase tracking-widest font-semibold block mb-2">Analysis Results</span>
          <h2 class="font-display font-bold text-2xl uppercase tracking-wider text-theme-dark">The House Blend.</h2>
        </div>
        <!-- Cached badge -->
        <div class="flex gap-2 items-center">
          <div v-if="result.cached" class="mt-4 md:mt-0 font-mono text-[9px] text-theme-muted border border-theme-border px-3 py-1 uppercase tracking-wider">
            Served from cache — instant load
          </div>
          <div v-else-if="loadedFromLocalHistory" class="mt-4 md:mt-0 font-mono text-[9px] text-theme-muted border border-theme-border px-3 py-1 uppercase tracking-wider">
            Loaded from local history — offline
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="CSS Custom Props" :value="result.curated.customProperties.length" />
        <StatCard label="Libraries Detected" :value="totalLibraryCount" />
        <StatCard label="Routes Found" :value="result.curated.routes.length" />
        <StatCard label="API Endpoints" :value="result.curated.apiEndpoints.length" />
      </div>

      <!-- Screenshots -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Desktop Screenshot Card -->
        <div class="bg-theme-card-bg border border-theme-border p-3 rounded-2xl overflow-hidden shadow-md flex flex-col h-[600px]">
          <div class="px-3 py-2 border-b border-theme-border flex justify-between items-center flex-shrink-0">
            <div class="flex gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
            </div>
            <span class="font-display text-[9px] text-theme-muted uppercase tracking-wider font-semibold">Desktop (1440px)</span>
          </div>
          <div v-if="result.screenshot" class="flex-1 overflow-x-hidden overflow-y-auto mt-2 rounded-lg screenshot-viewport">
            <img
              :src="`data:image/jpeg;base64,${result.screenshot}`"
              alt="Desktop screenshot"
              class="w-full block h-auto object-cover object-top"
            />
          </div>
          <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neutral-50 dark:bg-neutral-900/40 mt-2 rounded-lg border border-dashed border-theme-border">
            <svg class="w-10 h-10 text-theme-muted/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="font-display text-[10px] text-theme-dark uppercase tracking-widest font-bold mb-2">Screenshot Skipped</p>
            <p class="text-[11px] text-theme-muted max-w-[240px] leading-relaxed">
              Target site has heavy media load times or security challenges causing the screenshot proxy step to be omitted to prioritize data/custom property extraction.
            </p>
          </div>
        </div>

        <!-- Mobile Screenshot Card -->
        <div class="bg-theme-card-bg border border-theme-border p-3 rounded-2xl overflow-hidden shadow-md flex flex-col h-[600px]">
          <div class="px-3 py-2 border-b border-theme-border flex justify-between items-center flex-shrink-0">
            <div class="flex gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
            </div>
            <span class="font-display text-[9px] text-theme-muted uppercase tracking-wider font-semibold">Mobile (390px)</span>
          </div>
          <div v-if="result.mobileScreenshot" class="flex-1 overflow-x-hidden overflow-y-auto mt-2 rounded-lg screenshot-viewport">
            <img
              :src="`data:image/jpeg;base64,${result.mobileScreenshot}`"
              alt="Mobile screenshot"
              class="w-full block h-auto object-cover object-top"
            />
          </div>
          <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neutral-50 dark:bg-neutral-900/40 mt-2 rounded-lg border border-dashed border-theme-border">
            <svg class="w-10 h-10 text-theme-muted/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p class="font-display text-[10px] text-theme-dark uppercase tracking-widest font-bold mb-2">Screenshot Skipped</p>
            <p class="text-[11px] text-theme-muted max-w-[240px] leading-relaxed">
              Target site has heavy media load times or security challenges causing the screenshot proxy step to be omitted to prioritize data/custom property extraction.
            </p>
          </div>
        </div>
      </div>

      <!-- Tab Details Card -->
      <div class="border border-theme-border bg-theme-card-bg rounded-2xl overflow-hidden mt-12 shadow-md">
        <div class="flex border-b border-theme-border bg-theme-card-bg overflow-x-auto">
          <TabBtn
            v-for="tab in tabs"
            :key="tab.id"
            :label="tab.label"
            :active="activeTab === tab.id"
            @click="activeTab = tab.id"
          />
        </div>

        <div class="p-6 md:p-8">
          <!-- Report Tab -->
          <div v-if="activeTab === 'report'">
            <div v-if="reportLoading" class="flex items-center gap-3 py-12 justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-theme-dark animate-ping"></div>
              <span class="font-display text-[10px] text-theme-muted uppercase tracking-widest font-semibold">Synthesizing design report...</span>
            </div>
            <div v-else-if="report">
              <div class="flex justify-end gap-2 mb-6">
                <button
                  @click="copyReport"
                  class="px-4 py-2 bg-theme-dark hover:bg-theme-muted text-white font-display text-[9px] uppercase tracking-widest shadow-sm"
                >
                  {{ copied ? 'Copied!' : 'Copy Markdown' }}
                </button>
                <button
                  @click="downloadReport"
                  class="px-4 py-2 bg-theme-dark hover:bg-theme-muted text-white font-display text-[9px] uppercase tracking-widest shadow-sm"
                >
                  Download .md
                </button>
              </div>
              <div
                class="prose prose-sm max-w-none text-theme-dark"
                v-html="renderedReport"
              ></div>
            </div>
            <div v-else class="text-center py-12">
              <button
                @click="generateReport"
                class="px-8 py-3 bg-theme-dark hover:bg-theme-muted text-white font-display text-[10px] uppercase tracking-widest shadow-sm"
              >
                Generate Report with Gemini
              </button>
              <p class="text-theme-muted text-[10px] mt-3 uppercase font-mono tracking-wider">Uses Gemini API — free tier</p>
              <p v-if="reportError" class="text-red-600 font-mono text-xs mt-3">{{ reportError }}</p>
            </div>
          </div>

          <!-- Custom Properties tab -->
          <div v-if="activeTab === 'tokens'" class="space-y-3">
            <p class="font-display text-[10px] text-theme-muted uppercase tracking-widest mb-4 border-b border-theme-border pb-2">
              {{ result.curated.customProperties.length }} custom variables extracted
            </p>
            <div class="divide-y divide-theme-border">
              <div
                v-for="prop in result.curated.customProperties"
                :key="prop.name"
                class="flex items-center gap-3 py-3 px-1"
              >
                <ColorSwatch :value="prop.value" />
                <span class="font-mono text-xs text-theme-dark font-medium">{{ prop.name }}</span>
                <span class="font-mono text-xs text-theme-muted ml-auto">{{ prop.value }}</span>
                <span class="font-mono text-[9px] text-theme-muted/60 pl-2 uppercase tracking-wider">{{ prop.source }}</span>
              </div>
            </div>
            <p v-if="!result.curated.customProperties.length" class="text-theme-muted text-xs font-mono">No custom properties detected</p>
          </div>

          <!-- Libraries tab -->
          <div v-if="activeTab === 'libraries'" class="space-y-6">
            <p class="font-display text-[10px] text-theme-muted uppercase tracking-widest mb-4 border-b border-theme-border pb-2">
              Libraries & dependencies detected
            </p>
            
            <div v-if="result.curated.detectedLibraries?.domConfirmed?.length" class="mb-4">
              <p class="font-display text-[10px] text-theme-muted uppercase tracking-widest mb-2">Confirmed (Runtime DOM Globals)</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="lib in result.curated.detectedLibraries.domConfirmed" :key="lib" class="px-3 py-1 bg-theme-dark text-white font-mono text-xs">{{ lib }}</span>
              </div>
            </div>

            <div v-if="result.curated.detectedLibraries?.scriptConfirmed?.length" class="mb-4">
              <p class="font-display text-[10px] text-theme-muted uppercase tracking-widest mb-2">Confirmed (Script Filenames)</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="lib in result.curated.detectedLibraries.scriptConfirmed" :key="lib" class="px-3 py-1 bg-theme-bg border border-theme-border text-theme-dark font-mono text-xs">{{ lib }}</span>
              </div>
            </div>

            <div v-if="result.curated.detectedLibraries?.bundleHints?.length">
              <p class="font-display text-[10px] text-theme-muted uppercase tracking-widest mb-2">Bundle hints (unconfirmed)</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="lib in result.curated.detectedLibraries.bundleHints" :key="lib" class="px-3 py-1 bg-theme-bg border border-theme-border/60 text-theme-muted font-mono text-xs">{{ lib }}</span>
              </div>
            </div>

            <div v-if="result.curated.fonts.length" class="mt-6">
              <p class="font-display text-[10px] text-theme-muted uppercase tracking-widest mb-3">Google Fonts</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="font in result.curated.fonts"
                  :key="font"
                  class="px-3 py-1 bg-theme-bg border border-theme-dark text-theme-dark font-mono text-xs"
                >
                  {{ font }}
                </span>
              </div>
            </div>
          </div>

          <!-- Routes tab -->
          <div v-if="activeTab === 'routes'" class="space-y-6">
            <p class="font-display text-[10px] text-theme-muted uppercase tracking-widest mb-4 border-b border-theme-border pb-2">
              Route paths & api bindings
            </p>
            
            <div class="bg-theme-bg border border-theme-border p-4">
              <p class="font-display text-[10px] text-theme-dark uppercase tracking-widest mb-3 font-semibold">Application Routes</p>
              <div class="max-h-60 overflow-y-auto divide-y divide-theme-border pr-2">
                <div
                  v-for="route in result.curated.routes"
                  :key="route"
                  class="py-2 font-mono text-xs text-theme-dark"
                >
                  {{ route }}
                </div>
              </div>
              <p v-if="!result.curated.routes.length" class="text-theme-muted text-xs font-mono">No routes extracted</p>
            </div>

            <div v-if="result.curated.apiEndpoints.length" class="bg-theme-bg border border-theme-border p-4">
              <p class="font-display text-[10px] text-theme-dark uppercase tracking-widest mb-3 font-semibold">API Endpoints</p>
              <div class="max-h-60 overflow-y-auto divide-y divide-theme-border pr-2">
                <div
                  v-for="ep in result.curated.apiEndpoints"
                  :key="ep"
                  class="py-2 font-mono text-xs text-theme-dark break-all"
                >
                  {{ ep }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tailwind tab -->
          <div v-if="activeTab === 'tailwind'" class="space-y-6">
            <div v-if="result.curated.tailwindVersion" class="inline-flex items-center px-3 py-1 bg-theme-dark text-white text-xs font-mono">
              {{ result.curated.tailwindVersion }}
            </div>
            <p v-else class="text-theme-muted text-xs font-mono">No Tailwind framework detected</p>

            <div
              v-for="(values, bucket) in result.curated.tailwindArbitraryValues"
              :key="bucket"
              class="border border-theme-border p-4"
            >
              <div v-if="values.length">
                <p class="font-display text-[10px] text-theme-dark uppercase tracking-widest mb-2 font-semibold">{{ bucket }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="val in values"
                    :key="val"
                    class="px-2.5 py-1 bg-theme-card-bg border border-theme-border text-theme-dark font-mono text-xs"
                  >
                    {{ val }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Fallbacks -->
            <div v-if="!result.curated.tailwindArbitraryValues.colors?.length && result.curated.domEvidence?.desktop?.colorSamples?.length" class="border border-theme-border p-4">
              <p class="font-display text-[10px] text-theme-dark uppercase tracking-widest mb-3 font-semibold">Rendered Color Samples</p>
              <div class="flex flex-wrap gap-4">
                <div
                  v-for="color in result.curated.domEvidence.desktop.colorSamples"
                  :key="color"
                  class="flex items-center gap-2 px-2 py-1 bg-theme-card-bg border border-theme-border"
                >
                  <div class="w-5 h-5 border border-theme-dark/15" :style="{ background: color }"></div>
                  <span class="font-mono text-xs text-theme-dark">{{ color }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Raw JSON tab -->
          <div v-if="activeTab === 'raw'" class="bg-theme-card-bg p-4 border border-theme-border overflow-hidden">
            <pre class="text-xs font-mono text-theme-muted overflow-auto max-h-[600px] whitespace-pre-wrap pr-2">{{ JSON.stringify(result.curated, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked';

const url = ref('');
const loading = ref(false);
const reportLoading = ref(false);
const statusMsg = ref('');
const progress = ref(0);
const error = ref('');
const result = ref<any>(null);
const report = ref('');
const reportError = ref('');
const activeTab = ref('report');
const copied = ref(false);
const loadedFromLocalHistory = ref(false);

const totalLibraryCount = computed(() => {
  const d = result.value?.curated?.detectedLibraries;
  if (!d) return 0;
  return (d.domConfirmed?.length || 0) + (d.scriptConfirmed?.length || 0) + (d.bundleHints?.length || 0);
});

const tabs = [
  { id: 'report', label: 'Report' },
  { id: 'tokens', label: 'CSS Tokens' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'libraries', label: 'Libraries' },
  { id: 'routes', label: 'Routes' },
  { id: 'raw', label: 'Raw JSON' },
];

const renderedReport = computed(() => {
  if (!report.value) return '';
  return marked(report.value);
});

// Load parameters or check cache history
onMounted(() => {
  const queryUrl = useRoute().query.url as string;
  if (queryUrl) {
    url.value = queryUrl;
    try {
      const historyJson = localStorage.getItem('crawl_history') || '[]';
      const history = JSON.parse(historyJson);
      const matched = history.find((item: any) => item.url === queryUrl);
      if (matched && matched.result && matched.report) {
        result.value = matched.result;
        report.value = matched.report;
        loadedFromLocalHistory.value = true;
        console.log('Loaded from local history cache instantly!');
      }
    } catch (e) {
      console.warn('Failed to load local history from localStorage:', e);
    }
  }
});

function saveToHistory() {
  if (!result.value || !report.value) return;
  try {
    const historyJson = localStorage.getItem('crawl_history') || '[]';
    const history = JSON.parse(historyJson);
    const domain = new URL(result.value.curated.meta.url).hostname;
    const urlVal = result.value.curated.meta.url;
    const titleVal = result.value.curated.meta.title || domain;

    // Remove duplicates
    const filtered = history.filter((item: any) => item.url !== urlVal);
    filtered.unshift({
      url: urlVal,
      title: titleVal,
      domain,
      date: new Date().toLocaleDateString(),
      report: report.value,
      result: result.value // Save result for instant offline reloading
    });

    // Save only the top 30 history items to prevent hitting localStorage size limits
    localStorage.setItem('crawl_history', JSON.stringify(filtered.slice(0, 30)));
    loadedFromLocalHistory.value = false;
  } catch (e) {
    console.error('Failed to save to history:', e);
  }
}

async function analyze() {
  if (!url.value || loading.value) return;

  loading.value = true;
  error.value = '';
  result.value = null;
  report.value = '';
  reportError.value = '';
  progress.value = 0;
  activeTab.value = 'report';
  loadedFromLocalHistory.value = false;

  try {
    statusMsg.value = 'Launching browser & rendering page...';
    progress.value = 20;

    statusMsg.value = 'Capturing desktop + mobile evidence...';
    progress.value = 50;

    const res = await $fetch('/api/crawl', {
      method: 'POST',
      body: { url: url.value },
    });

    progress.value = 80;
    statusMsg.value = 'Processing extraction...';

    result.value = res;
    progress.value = 100;
    statusMsg.value = 'Done';

    if ((res as any).report) {
      report.value = (res as any).report;
      saveToHistory();
    } else {
      await generateReport();
    }
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Crawl failed';
  } finally {
    loading.value = false;
  }
}

async function generateReport() {
  if (!result.value) {
    reportError.value = 'Please analyse a URL first — enter a URL above and click Analyse.';
    return;
  }
  reportLoading.value = true;
  reportError.value = '';

  try {
    const res = await $fetch('/api/report', {
      method: 'POST',
      body: {
        curated: result.value.curated,
        screenshot: result.value.screenshot,
        mobileScreenshot: result.value.mobileScreenshot,
      },
    });
    report.value = (res as any).report;
    saveToHistory();
    downloadReport();

    try {
      await $fetch('/api/cache-report', {
        method: 'POST',
        body: {
          domain: new URL(result.value.curated.meta.url).hostname,
          report: report.value,
        },
      });
    } catch {
      // non-critical
    }
  } catch (err: any) {
    reportError.value = err?.data?.message || err?.message || 'Report generation failed';
  } finally {
    reportLoading.value = false;
  }
}

async function copyReport() {
  if (!report.value) return;
  await navigator.clipboard.writeText(report.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function downloadReport() {
  if (!report.value) return;
  const slug = (result.value?.curated?.meta?.title || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const blob = new Blob([report.value], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slug || 'design-report'}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Satisfy&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.prose h1, .prose h2, .prose h3 { color: #111111; font-family: 'Space Grotesk', sans-serif; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; text-transform: uppercase; tracking-wide: true; }
.prose h1 { font-size: 1.3rem; }
.prose h2 { font-size: 1.15rem; }
.prose h3 { font-size: 1.05rem; }
.prose p, .prose li { color: #555555; font-family: 'Inter', sans-serif; line-height: 1.6; margin-bottom: 0.85rem; font-size: 0.85em; }
.prose code { color: #111111; background: #fafafa; border: 1px solid #e5e5e5; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.85em; font-family: 'JetBrains Mono', monospace; }
.prose pre { background: #fafafa; border: 1px solid #e5e5e5; border-radius: 6px; padding: 1rem; margin: 1rem 0; overflow-x: auto; }
.prose pre code { color: #111111; background: transparent; border: 0; padding: 0; }
.prose a { color: #111111; text-decoration: underline; text-underline-offset: 2px; font-weight: 500; }
.prose a:hover { opacity: 0.7; }
.prose strong { color: #111111; font-weight: 600; }
.prose hr { border-color: #e5e5e5; margin: 1.5rem 0; }
.prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.prose table th, .prose table td { border: 1px solid #e5e5e5; padding: 0.5rem 0.75rem; text-align: left; }
.prose table th { background: #fafafa; color: #111111; font-family: 'Space Grotesk', sans-serif; }
.prose blockquote { border-left: 2px solid #111111; padding-left: 1rem; color: #555555; opacity: 0.9; margin: 1rem 0; italic: true; }

/* Custom scrollbar for scrollable screenshot viewports */
.screenshot-viewport::-webkit-scrollbar {
  width: 5px;
}
.screenshot-viewport::-webkit-scrollbar-track {
  background: transparent;
}
.screenshot-viewport::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
.bg-theme-dark .screenshot-viewport::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}
</style>
