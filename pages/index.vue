<template>
  <div class="max-w-4xl mx-auto px-6 py-16">
    <!-- Hero -->
    <div class="mb-14">
      <p class="font-mono text-xs text-accent tracking-widest uppercase mb-4">Bundle-Extraction Pipeline</p>
      <h1 class="text-4xl font-bold text-foreground leading-tight mb-4">
        Reverse-engineer any site's<br />
        <span class="text-accent">design system.</span>
      </h1>
      <p class="text-dim text-base max-w-lg">
        Mechanical extraction from real CSS/JS bundles — actual hex codes, Tailwind tokens,
        routes, libraries. No guessing, no hallucination.
      </p>
    </div>

    <!-- Input -->
    <div class="bg-panel border border-border rounded-xl p-6 mb-8">
      <label class="block font-mono text-xs text-dim uppercase tracking-widest mb-3">Target URL</label>
      <div class="flex gap-3">
        <input
          v-model="url"
          type="url"
          placeholder="https://linear.app"
          class="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted font-mono text-sm focus:outline-none focus:border-accent transition-colors"
          @keydown.enter="analyze"
        />
        <button
          @click="analyze"
          :disabled="loading || !url"
          class="px-6 py-3 bg-accent hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-sm rounded-lg transition-colors whitespace-nowrap"
        >
          {{ loading ? 'Analyzing...' : 'Analyze' }}
        </button>
      </div>
    </div>

    <!-- Progress / Status -->
    <div v-if="loading" class="bg-panel border border-border rounded-xl p-6 mb-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
        <span class="font-mono text-xs text-dim uppercase tracking-widest">{{ statusMsg }}</span>
      </div>
      <div class="w-full bg-surface rounded-full h-1">
        <div
          class="bg-accent h-1 rounded-full transition-all duration-500"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-950/30 border border-red-800/50 rounded-xl p-5 mb-8">
      <p class="font-mono text-xs text-red-400 uppercase tracking-widest mb-1">Error</p>
      <p class="text-red-300 text-sm">{{ error }}</p>
    </div>

    <!-- Results -->
    <div v-if="result" class="space-y-6">
      <!-- Cached banner -->
      <div v-if="result.cached" class="bg-accent/10 border border-accent/30 rounded-xl px-4 py-2">
        <span class="font-mono text-xs text-accent">Served from cache — instant result, no re-crawl</span>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="CSS Custom Props" :value="result.curated.customProperties.length" />
        <StatCard label="Libraries Detected" :value="totalLibraryCount" />
        <StatCard label="Routes Found" :value="result.curated.routes.length" />
        <StatCard label="API Endpoints" :value="result.curated.apiEndpoints.length" />
      </div>

      <!-- Screenshots -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-if="result.screenshot" class="bg-panel border border-border rounded-xl overflow-hidden">
          <div class="px-4 py-3 border-b border-border">
            <span class="font-mono text-xs text-dim uppercase tracking-widest">Desktop (1440px)</span>
          </div>
          <img
            :src="`data:image/jpeg;base64,${result.screenshot}`"
            alt="Desktop screenshot"
            class="w-full"
          />
        </div>
        <div v-if="result.mobileScreenshot" class="bg-panel border border-border rounded-xl overflow-hidden">
          <div class="px-4 py-3 border-b border-border">
            <span class="font-mono text-xs text-dim uppercase tracking-widest">Mobile (390px)</span>
          </div>
          <img
            :src="`data:image/jpeg;base64,${result.mobileScreenshot}`"
            alt="Mobile screenshot"
            class="w-full"
          />
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-panel border border-border rounded-xl">
        <div class="flex border-b border-border overflow-x-auto">
          <TabBtn
            v-for="tab in tabs"
            :key="tab.id"
            :label="tab.label"
            :active="activeTab === tab.id"
            @click="activeTab = tab.id"
          />
        </div>

        <div class="p-6">
          <!-- Report tab -->
          <div v-if="activeTab === 'report'">
            <div v-if="reportLoading" class="flex items-center gap-3 py-8">
              <div class="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              <span class="font-mono text-xs text-dim">Synthesizing report with Groq...</span>
            </div>
            <div v-else-if="report">
              <div class="flex justify-end gap-2 mb-4">
                <button
                  @click="copyReport"
                  class="px-3 py-1.5 bg-surface border border-border hover:border-accent rounded-lg font-mono text-xs text-dim hover:text-foreground transition-colors"
                >
                  {{ copied ? 'Copied!' : 'Copy Markdown' }}
                </button>
                <button
                  @click="downloadReport"
                  class="px-3 py-1.5 bg-surface border border-border hover:border-accent rounded-lg font-mono text-xs text-dim hover:text-foreground transition-colors"
                >
                  Download .md
                </button>
              </div>
              <div
                class="prose prose-invert prose-sm max-w-none font-sans text-foreground"
                v-html="renderedReport"
              ></div>
            </div>
            <div v-else class="text-center py-8">
              <button
                @click="generateReport"
                class="px-6 py-3 bg-accent hover:bg-accent-dim text-white font-mono text-sm rounded-lg transition-colors"
              >
               Generate Report with Groq
              </button>
              <p class="text-dim text-xs mt-3">Uses Groq API — free tier</p>
              <p v-if="reportError" class="text-red-400 font-mono text-xs mt-3">{{ reportError }}</p>
            </div>
          </div>

          <!-- Custom Properties tab -->
          <div v-if="activeTab === 'tokens'" class="space-y-2">
            <p class="font-mono text-xs text-dim uppercase tracking-widest mb-4">
              {{ result.curated.customProperties.length }} CSS custom properties
            </p>
            <div
              v-for="prop in result.curated.customProperties"
              :key="prop.name"
              class="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
            >
              <ColorSwatch :value="prop.value" />
              <span class="font-mono text-xs text-accent">{{ prop.name }}</span>
              <span class="font-mono text-xs text-dim ml-auto">{{ prop.value }}</span>
              <span class="font-mono text-[10px] text-muted">{{ prop.source }}</span>
            </div>
            <p v-if="!result.curated.customProperties.length" class="text-dim text-sm">No custom properties detected</p>
          </div>

          <!-- Libraries tab -->
          <div v-if="activeTab === 'libraries'" class="space-y-3">
            <p class="font-mono text-xs text-dim uppercase tracking-widest mb-4">
              Detected via runtime globals, script versions, and bundle strings
            </p>
            <div v-if="result.curated.detectedLibraries?.domConfirmed?.length" class="mb-4">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-2">Confirmed (runtime)</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="lib in result.curated.detectedLibraries.domConfirmed" :key="lib" class="px-3 py-1.5 bg-surface border border-accent/30 rounded-lg font-mono text-xs text-accent">{{ lib }}</span>
              </div>
            </div>
            <div v-if="result.curated.detectedLibraries?.scriptConfirmed?.length" class="mb-4">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-2">Confirmed (script filenames)</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="lib in result.curated.detectedLibraries.scriptConfirmed" :key="lib" class="px-3 py-1.5 bg-surface border border-border rounded-lg font-mono text-xs text-foreground">{{ lib }}</span>
              </div>
            </div>
            <div v-if="result.curated.detectedLibraries?.bundleHints?.length">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-2">Bundle hints (unconfirmed)</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="lib in result.curated.detectedLibraries.bundleHints" :key="lib" class="px-3 py-1.5 bg-surface border border-border/50 rounded-lg font-mono text-xs text-muted">{{ lib }}</span>
              </div>
            </div>
            <div v-if="result.curated.fonts.length" class="mt-6">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">Google Fonts (imported)</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="font in result.curated.fonts"
                  :key="font"
                  class="px-3 py-1.5 bg-surface border border-accent/30 rounded-lg font-mono text-xs text-accent"
                >
                  {{ font }}
                </span>
              </div>
            </div>
            <div v-if="result.curated.domEvidence" class="mt-6">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">Computed Fonts (rendered)</p>
              <div class="space-y-1 font-mono text-xs">
                <p class="text-foreground">body: <span class="text-accent">{{ result.curated.domEvidence.desktop.bodyFont }}</span></p>
                <p class="text-foreground">h1: <span class="text-accent">{{ result.curated.domEvidence.desktop.h1Font }}</span></p>
              </div>
            </div>
          </div>

          <!-- Routes tab -->
          <div v-if="activeTab === 'routes'" class="space-y-2">
            <p class="font-mono text-xs text-dim uppercase tracking-widest mb-4">
              Extracted route / path patterns from bundle text
            </p>
            <div
              v-for="route in result.curated.routes"
              :key="route"
              class="py-2 border-b border-border/50 last:border-0"
            >
              <span class="font-mono text-xs text-foreground">{{ route }}</span>
            </div>
            <p v-if="!result.curated.routes.length" class="text-dim text-sm">No routes extracted</p>

            <div v-if="result.curated.apiEndpoints.length" class="mt-6">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">API Endpoints</p>
              <div
                v-for="ep in result.curated.apiEndpoints"
                :key="ep"
                class="py-2 border-b border-border/50 last:border-0"
              >
                <span class="font-mono text-xs text-accent break-all">{{ ep }}</span>
              </div>
            </div>

            <div v-if="result.curated.domEvidence?.desktop?.navLinks?.length" class="mt-6">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">Navigation Links (rendered)</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="link in result.curated.domEvidence.desktop.navLinks"
                  :key="link"
                  class="px-2 py-1 bg-surface border border-border rounded font-mono text-xs text-foreground"
                >
                  {{ link }}
                </span>
              </div>
            </div>

            <div v-if="result.curated.domEvidence?.desktop?.filterItems?.length" class="mt-6">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">Filter Items (rendered)</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in result.curated.domEvidence.desktop.filterItems"
                  :key="item"
                  class="px-2 py-1 bg-surface border border-border rounded font-mono text-xs text-foreground"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tailwind tab -->
          <div v-if="activeTab === 'tailwind'" class="space-y-6">
            <div v-if="result.curated.tailwindVersion" class="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg">
              <span class="font-mono text-xs text-accent">{{ result.curated.tailwindVersion }}</span>
            </div>
            <p v-else class="text-dim text-sm">No Tailwind version detected</p>

            <div
              v-for="(values, bucket) in result.curated.tailwindArbitraryValues"
              :key="bucket"
            >
              <div v-if="values.length">
                <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">{{ bucket }}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="val in values"
                    :key="val"
                    class="px-2 py-1 bg-surface border border-border rounded font-mono text-xs text-foreground"
                  >
                    {{ val }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Fallback: real rendered colors when Tailwind arbitrary colors are empty -->
            <div v-if="!result.curated.tailwindArbitraryValues.colors?.length && result.curated.domEvidence?.desktop?.colorSamples?.length">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">Computed Colors (rendered, since no Tailwind arbitrary colors found)</p>
              <div class="space-y-2">
                <div
                  v-for="color in result.curated.domEvidence.desktop.colorSamples"
                  :key="color"
                  class="flex items-center gap-3 py-1"
                >
                  <div class="w-6 h-6 rounded border border-border" :style="{ background: color }"></div>
                  <span class="font-mono text-xs text-foreground">{{ color }}</span>
                </div>
              </div>
            </div>

            <!-- Fallback: hex colors from raw CSS -->
            <div v-if="result.curated.domEvidence?.cssEvidence?.colors?.length" class="mt-6">
              <p class="font-mono text-xs text-dim uppercase tracking-widest mb-3">Hex Colors (from CSS)</p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="color in result.curated.domEvidence.cssEvidence.colors"
                  :key="color"
                  class="flex items-center gap-2 px-2 py-1 bg-surface border border-border rounded"
                >
                  <div class="w-4 h-4 rounded border border-border" :style="{ background: color }"></div>
                  <span class="font-mono text-xs text-foreground">{{ color }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Raw JSON tab -->
          <div v-if="activeTab === 'raw'">
            <pre class="text-xs font-mono text-dim overflow-auto max-h-[600px] whitespace-pre-wrap">{{ JSON.stringify(result.curated, null, 2) }}</pre>
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

async function analyze() {
  if (!url.value || loading.value) return;

  loading.value = true;
  error.value = '';
  result.value = null;
  report.value = '';
  reportError.value = '';
  progress.value = 0;
  activeTab.value = 'report';

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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.prose h1, .prose h2, .prose h3 { color: #e2e2f0; }
.prose p, .prose li { color: #8888a8; }
.prose code { color: #6366f1; background: #111118; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.8em; }
.prose pre { background: #111118; border: 1px solid #1e1e2e; border-radius: 8px; }
.prose a { color: #6366f1; }
.prose strong { color: #e2e2f0; }
.prose hr { border-color: #1e1e2e; }
.prose table th, .prose table td { border-color: #1e1e2e; }
.prose blockquote { border-left-color: #6366f1; color: #8888a8; }
</style>
