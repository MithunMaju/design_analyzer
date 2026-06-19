<template>
  <div class="max-w-5xl mx-auto px-6 py-4">
    <!-- Header in ChronoTask style (logo only, links and actions removed) -->
    <header class="reveal-item flex items-center justify-between py-6 mb-12 border-b border-neutral-100 relative z-10">
      <div class="flex items-center gap-2">
        <!-- Custom ChronoTask check/clock-style SVG Icon in plum/magenta -->
        <svg class="w-5 h-5 text-accent-chrono" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="font-display font-bold text-xs tracking-widest uppercase text-neutral-900">design<span class="text-accent-chrono">analyzer</span></span>
      </div>
    </header>

    <!-- Combined Hero and CTA Container (ChronoTask Landing Page Style - Light Mode) -->
    <div class="relative w-full mb-20 min-h-[380px] flex flex-col lg:flex-row items-center justify-between gap-12 py-4">
      <!-- Left side: Headline and CTAs -->
      <div class="w-full lg:w-3/5 flex flex-col justify-center min-h-[320px] relative z-10">
        <div class="space-y-4">
          <h1 class="reveal-item reveal-delay-1 text-4xl md:text-5xl font-display font-extrabold text-neutral-900 leading-tight uppercase tracking-wide">
            design analyzer
            <span class="text-accent-chrono block text-xl md:text-2xl mt-3 font-normal font-sans tracking-normal capitalize text-neutral-500">
              Your essential tool for design system deconstruction
            </span>
          </h1>
          
          <p class="reveal-item reveal-delay-2 text-neutral-600 font-sans text-xs leading-relaxed max-w-lg pt-2">
            Deep-extract CSS variables, Tailwind tokens, application routing paths, and dependency packages directly from live browser bundles. Clean evidence, parsed in real-time, refined by Gemini AI.
          </p>
        </div>
        
        <div class="reveal-item reveal-delay-3 w-full mt-8 flex flex-wrap gap-4">
          <NuxtLink
            to="/deconstruct"
            class="inline-flex items-center justify-center px-8 h-12 bg-neutral-950 hover:bg-accent-chrono text-white font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-black/10 hover:shadow-accent-chrono/20 whitespace-nowrap"
          >
            Deconstruct New Site →
          </NuxtLink>
          <a
            href="#ledger-gallery"
            class="inline-flex items-center justify-center px-8 h-12 bg-neutral-950 hover:bg-accent-chrono text-white font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-black/10 hover:shadow-accent-chrono/20 whitespace-nowrap"
          >
            Explore Gallery →
          </a>
        </div>
      </div>

      <!-- Right side: Floating Mockup Preview (ChronoTask Time Tracker / Analysis Active Mockup - Light Mode) -->
      <div class="reveal-item reveal-delay-4 hidden lg:flex items-center justify-center lg:w-2/5 relative z-10">
        <!-- Floating ambient glowing backdrops -->
        <div class="absolute w-64 h-64 bg-accent-chrono/5 rounded-full blur-3xl -top-10 -right-10 pointer-events-none"></div>
        <div class="absolute w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -bottom-10 -left-10 pointer-events-none"></div>

        <div class="w-full max-w-[360px] bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <!-- Mockup Header -->
          <div class="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-accent-chrono animate-pulse"></span>
              <span class="font-mono text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Active Analysis Tracker</span>
            </div>
            <span
              class="font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-bold border transition-all duration-300"
              :class="{
                'text-emerald-600 bg-emerald-50 border-emerald-100': mockTrackerStatus === 'Running',
                'text-amber-600 bg-amber-50 border-amber-100': mockTrackerStatus === 'Synthesizing',
                'text-indigo-600 bg-indigo-50 border-indigo-100': mockTrackerStatus === 'Complete' || mockTrackerStatus === 'Waiting'
              }"
            >
              {{ mockTrackerStatus === 'Waiting' ? 'Complete' : mockTrackerStatus }}
            </span>
          </div>
          
          <!-- Target Domain Block -->
          <div class="bg-neutral-50 border border-neutral-100/70 rounded-xl p-4 mb-4">
            <span class="font-sans text-[8px] text-neutral-400 uppercase tracking-wider block mb-1 font-semibold">Target Domain</span>
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-display font-bold text-sm text-neutral-800 tracking-wide transition-all duration-300">{{ currentMock.domain }}</h4>
              <span class="font-mono text-[9px] text-accent-chrono font-bold transition-all duration-300">{{ mockTrackerElapsed.toFixed(1) }}s elapsed</span>
            </div>
            <div class="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div class="h-1.5 rounded-full transition-all duration-100 bg-gradient-to-r" :class="currentMock.color" :style="{ width: mockTrackerProgress + '%' }"></div>
            </div>
            <div class="flex justify-between text-[8px] font-mono text-neutral-500">
              <span class="transition-all duration-300">{{ getMockTrackerPhaseText() }}</span>
              <span>{{ Math.round(mockTrackerProgress) }}%</span>
            </div>
          </div>

          <!-- Analysis stats inside mockup -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-neutral-50 border border-neutral-100/70 rounded-xl p-3">
              <span class="text-[8px] text-neutral-400 uppercase block mb-1 font-semibold">Tokens Found</span>
              <div class="flex items-baseline gap-1.5">
                <span class="font-display font-bold text-base text-neutral-800 transition-all duration-300">{{ mockTrackerTokens }}</span>
                <span class="text-[8px] text-emerald-600 font-mono transition-opacity duration-300" :class="mockTrackerStatus === 'Running' ? 'opacity-100' : 'opacity-0'">+12/s</span>
              </div>
            </div>
            <div class="bg-neutral-50 border border-neutral-100/70 rounded-xl p-3">
              <span class="text-[8px] text-neutral-400 uppercase block mb-1 font-semibold">Ecosystem</span>
              <div class="flex flex-wrap gap-1 mt-1 transition-all duration-300">
                <span class="px-1.5 py-0.5 bg-accent-chrono/10 text-accent-chrono font-mono text-[7px] rounded font-bold uppercase">{{ currentMock.framework }}</span>
                <span class="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-mono text-[7px] rounded font-bold uppercase">{{ currentMock.styling }}</span>
              </div>
            </div>
          </div>

          <!-- Audit Quality Meter -->
          <div class="flex items-center justify-between bg-neutral-50/50 border border-neutral-100/70 rounded-xl p-3">
            <div class="flex items-center gap-3">
              <!-- Circular progress SVG -->
              <div class="relative w-9 h-9">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path class="text-neutral-200" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="text-accent-chrono transition-all duration-300" stroke-width="3" :stroke-dasharray="`${(mockTrackerProgress / 100) * currentMock.score}, 100`" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-bold text-neutral-800 transition-all duration-300">
                  {{ Math.round((mockTrackerProgress / 100) * currentMock.score) }}%
                </div>
              </div>
              <div>
                <span class="text-[9px] font-display font-bold text-neutral-800 block">Audit Health Score</span>
                <span class="text-[8px] text-neutral-500 font-mono transition-all duration-300">
                  {{ mockTrackerStatus === 'Running' ? 'Analyzing codebase...' : mockTrackerStatus === 'Synthesizing' ? 'Assembling insights...' : 'Deep inspection completed' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Capabilities Grid Section -->
    <div id="capabilities" class="mb-24 scroll-mt-12">
      <div class="reveal-item text-center max-w-xl mx-auto mb-16">
        <span class="font-display text-[9px] text-accent-chrono uppercase tracking-widest font-bold block mb-2">Capabilities</span>
        <h2 class="font-display font-extrabold text-2xl uppercase tracking-wider text-neutral-900">Reverse Engineering Kit</h2>
        <p class="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">Dissect, inspect, and analyze any modern web framework design system instantly.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Feature 1 -->
        <div class="reveal-item reveal-delay-1 bg-neutral-50/50 border border-neutral-200/60 hover:border-accent-chrono/30 hover:bg-white p-6 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div class="w-8 h-8 rounded-xl bg-accent-chrono/10 flex items-center justify-center mb-4 text-accent-chrono">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-neutral-900 uppercase tracking-wider mb-2">Token Extractor</h3>
          <p class="text-xs text-neutral-500 leading-relaxed font-sans">
            Dissects computed styles to discover CSS custom properties, variables, and font-family stacks. Generates interactive color swatches automatically.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="reveal-item reveal-delay-2 bg-neutral-50/50 border border-neutral-200/60 hover:border-accent-chrono/30 hover:bg-white p-6 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div class="w-8 h-8 rounded-xl bg-accent-chrono/10 flex items-center justify-center mb-4 text-accent-chrono">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-neutral-900 uppercase tracking-wider mb-2">Tailwind reverse-engineering</h3>
          <p class="text-xs text-neutral-500 leading-relaxed font-sans">
            Scans document node classes to reverse-engineer custom theme configuration settings, arbitrary values, and framework versions.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="reveal-item reveal-delay-3 bg-neutral-50/50 border border-neutral-200/60 hover:border-accent-chrono/30 hover:bg-white p-6 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div class="w-8 h-8 rounded-xl bg-accent-chrono/10 flex items-center justify-center mb-4 text-accent-chrono">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-neutral-900 uppercase tracking-wider mb-2">Stack Auditor</h3>
          <p class="text-xs text-neutral-500 leading-relaxed font-sans">
            Identifies JS runtime globals, library tags, and script URLs to audit frameworks (Vue, React, Svelte, Alpine) and bundler configs (Vite, Webpack).
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="reveal-item reveal-delay-4 bg-neutral-50/50 border border-neutral-200/60 hover:border-accent-chrono/30 hover:bg-white p-6 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div class="w-8 h-8 rounded-xl bg-accent-chrono/10 flex items-center justify-center mb-4 text-accent-chrono">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-xs text-neutral-900 uppercase tracking-wider mb-2">AI Architectural Reports</h3>
          <p class="text-xs text-neutral-500 leading-relaxed font-sans">
            Feeds structural extraction logs to Gemini 2.5 API to write detailed architectural markdown reports outlining brand DNA, typography, color scheme, and blueprint.
          </p>
        </div>
      </div>
    </div>

    <!-- Workflow Section -->
    <div id="workflow" class="reveal-item mb-24 bg-neutral-50/80 border border-neutral-200/60 rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-sm scroll-mt-12">
      <!-- Faint decorative gradient dot -->
      <div class="absolute w-32 h-32 bg-accent-chrono/5 rounded-full blur-2xl top-0 right-0 pointer-events-none"></div>
      
      <div class="reveal-item reveal-delay-1 relative z-10 text-center max-w-xl mx-auto mb-12">
        <span class="font-display text-[9px] text-accent-chrono uppercase tracking-widest block mb-2 font-bold">The Pipeline</span>
        <h2 class="font-display font-extrabold text-xl uppercase tracking-wider text-neutral-900">How Deconstruction Works</h2>
      </div>

      <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Step 1 -->
        <div class="reveal-item reveal-delay-2 space-y-3 relative group">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[9px] text-accent-chrono font-bold uppercase tracking-wider bg-accent-chrono/10 px-2 py-0.5 rounded">Step 01</span>
            <span class="h-px bg-neutral-200 flex-1 hidden md:block"></span>
          </div>
          <h4 class="font-display text-xs font-semibold uppercase tracking-wider text-neutral-900">Edge Crawl</h4>
          <p class="text-[11px] text-neutral-500 font-sans leading-relaxed">
            Spins up headless Chromium instances globally via Cloudflare Puppeteer to render the website layout and capture viewport images.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="reveal-item reveal-delay-3 space-y-3 relative group">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[9px] text-accent-chrono font-bold uppercase tracking-wider bg-accent-chrono/10 px-2 py-0.5 rounded">Step 02</span>
            <span class="h-px bg-neutral-200 flex-1 hidden md:block"></span>
          </div>
          <h4 class="font-display text-xs font-semibold uppercase tracking-wider text-neutral-900">Code Dissect</h4>
          <p class="text-[11px] text-neutral-500 font-sans leading-relaxed">
            Injects DOM analyzer scripts to map calculated colors, CSS properties, fonts, scripts, and navigation routes.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="reveal-item reveal-delay-4 space-y-3 relative">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[9px] text-accent-chrono font-bold uppercase tracking-wider bg-accent-chrono/10 px-2 py-0.5 rounded">Step 03</span>
            <span class="h-px bg-transparent flex-1"></span>
          </div>
          <h4 class="font-display text-xs font-semibold uppercase tracking-wider text-neutral-900">AI Synthesis</h4>
          <p class="text-[11px] text-neutral-500 font-sans leading-relaxed">
            Synthesizes all parsed data nodes using Gemini AI into an academic markdown design report, outlining brand DNA, typography, color scheme, and blueprint.
          </p>
        </div>
      </div>
    </div>

    <!-- History Section (Shared Repository Ledger) -->
    <div id="ledger-gallery" class="reveal-item bg-neutral-50/50 border border-neutral-200/60 rounded-3xl p-6 md:p-8 shadow-sm mb-16 scroll-mt-12 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/60 pb-6">
        <div>
          <span class="font-display text-[9px] text-accent-chrono uppercase tracking-widest font-bold block mb-1">Crawl Repository</span>
          <h2 class="font-display font-extrabold text-xl uppercase tracking-wider text-neutral-900">Shared Deconstructions Ledger</h2>
        </div>
        
        <!-- Search Controls -->
        <div v-if="history.length" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search repository..."
            class="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 font-mono text-[10px] focus:outline-none focus:border-accent-chrono/50 focus:bg-white transition-colors w-full sm:w-64"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-6 h-6 border-2 border-accent-chrono border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[10px] text-neutral-500 mt-2 font-mono">Loading shared history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredHistory.length === 0" class="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-12 text-center shadow-sm">
        <div class="w-12 h-12 rounded-full bg-accent-chrono/10 flex items-center justify-center mx-auto mb-4 border border-accent-chrono/20 text-accent-chrono">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="font-display text-xs text-neutral-900 uppercase font-bold tracking-wider mb-2">No Deconstructed Sites</h3>
        <p class="text-[11px] text-neutral-500 max-w-md mx-auto leading-relaxed mb-6">
          {{ searchQuery ? 'No search results match your query. Try searching for a different domain or title.' : 'Analyze a website to deconstruct its bundles and generate design reports. Reports are stored in a shared global repository.' }}
        </p>
        <NuxtLink
          to="/deconstruct"
          class="inline-flex items-center justify-center px-6 py-2.5 bg-neutral-950 hover:bg-accent-chrono text-white font-display font-bold text-[9px] uppercase tracking-widest transition-all rounded-lg"
        >
          Start First Analysis
        </NuxtLink>
      </div>

      <!-- History Grid Scroll Container -->
      <div v-else class="max-h-[2500px] lg:max-h-[804px] overflow-y-auto pr-3 custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          <NuxtLink
            v-for="item in filteredHistory"
            :key="item.url"
            :to="`/deconstruct?url=${encodeURIComponent(item.url)}`"
            class="group bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-accent-chrono/30 transition-all duration-300 flex flex-col p-3 lg:h-[390px] text-left block"
          >
            <!-- Card Thumbnail with Aspect Ratio 1200/630 -->
            <div
              class="relative w-full aspect-[1200/630] overflow-hidden rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center"
            >
              <!-- SVG illustration if generated by Gemini / Dynamic Fallback -->
              <div
                v-if="item.svg"
                v-html="item.svg"
                class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
              ></div>
              <!-- Screenshot image fallback -->
              <img
                v-else-if="item.screenshot"
                :src="`data:image/jpeg;base64,${item.screenshot}`"
                alt="Website preview"
                class="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <!-- Premium Placeholder pattern if nothing else -->
              <div v-else class="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[linear-gradient(to_bottom_right,#f9f9f9,#f1f1f1)] text-center select-none">
                <!-- Grid background lines -->
                <div class="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <span class="text-[9px] uppercase tracking-widest font-mono text-neutral-400 font-bold border border-neutral-200 px-2 py-1 rounded bg-white relative z-10">
                  No Preview
                </span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="px-2 pt-4 pb-2 flex-1 flex flex-col">
              <!-- Category Tag -->
              <div class="flex items-center gap-2 mb-2">
                <span class="w-[2px] h-3 rounded-full bg-accent-chrono"></span>
                <span class="text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                  {{ item.category }}
                </span>
              </div>

              <!-- Title & Domain -->
              <div class="mb-2">
                <h3 class="font-display font-bold text-sm text-neutral-900 tracking-wide hover:text-accent-chrono transition-colors line-clamp-1">
                  {{ cleanBrandTitle(item.title, item.domain) }}
                </h3>
                
                <a
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                  class="inline-block font-mono text-[9px] text-neutral-400 hover:text-neutral-600 transition-colors mt-0.5 truncate max-w-full"
                >
                  {{ item.domain }}
                </a>
              </div>

              <!-- Description / Design Summary -->
              <p class="text-[11px] text-neutral-500 font-sans leading-relaxed line-clamp-3 mb-5">
                {{ item.summary || 'Reverse engineering report detailing layout architecture, colors, custom properties, and library ecosystems.' }}
              </p>

              <!-- Card Footer Stats and Actions -->
              <div class="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between text-[8px] font-mono text-neutral-400 gap-2">
                <div class="flex items-center gap-3">
                  <span title="Tokens Count">Tokens: <strong class="text-neutral-700">{{ item.result?.curated?.customProperties?.length || 0 }}</strong></span>
                  <span title="Libraries Count">Libraries: <strong class="text-neutral-700">{{ getLibraryCount(item) }}</strong></span>
                </div>
                
                <div class="flex items-center gap-2">
                  <button
                    @click.stop.prevent="downloadReport(item)"
                    class="px-2.5 py-1 bg-transparent border border-neutral-200 hover:border-accent-chrono hover:bg-accent-chrono/5 text-neutral-600 hover:text-accent-chrono font-display text-[8px] uppercase tracking-wider rounded transition-colors whitespace-nowrap"
                  >
                    Download .md
                  </button>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'light'
});

const searchQuery = ref('');
const history = ref<any[]>([]);
const loading = ref(false);
const userDeconstructedUrls = ref<string[]>([]);

// Hero Mockup Simulation State
const mockTrackerIndex = ref(0);
const mockTrackerProgress = ref(0);
const mockTrackerElapsed = ref(0);
const mockTrackerStatus = ref('Running'); // 'Running', 'Synthesizing', 'Complete'
const mockTrackerTokens = ref(0);

const mockDomains = [
  {
    domain: 'linear.app',
    maxTokens: 128,
    score: 92,
    framework: 'Vue 3',
    styling: 'Tailwind',
    color: 'from-accent-chrono to-indigo-500'
  },
  {
    domain: 'stripe.com',
    maxTokens: 215,
    score: 98,
    framework: 'React',
    styling: 'Tailwind CSS',
    color: 'from-blue-500 to-emerald-500'
  },
  {
    domain: 'lovable.dev',
    maxTokens: 78,
    score: 95,
    framework: 'React',
    styling: 'Tailwind',
    color: 'from-pink-500 to-rose-500'
  },
  {
    domain: 'airbnb.com',
    maxTokens: 189,
    score: 88,
    framework: 'React',
    styling: 'Sass / CSS',
    color: 'from-amber-500 to-orange-500'
  }
];

const currentMock = computed(() => mockDomains[mockTrackerIndex.value]);
let simulationInterval: any = null;

onMounted(() => {
  loadHistory();
  startTrackerSimulation();
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

    // Initialize Intersection Observer for scroll-reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal-item').forEach((el) => {
      observer.observe(el);
    });
  }
});

onUnmounted(() => {
  if (simulationInterval) clearInterval(simulationInterval);
});

function startTrackerSimulation() {
  const tickRate = 100; // ms
  simulationInterval = setInterval(() => {
    if (mockTrackerStatus.value === 'Running') {
      mockTrackerProgress.value += 2.5;
      mockTrackerElapsed.value += 0.1;
      
      const currentMax = currentMock.value.maxTokens;
      mockTrackerTokens.value = Math.min(
        currentMax,
        Math.floor((mockTrackerProgress.value / 100) * currentMax)
      );

      if (mockTrackerProgress.value >= 100) {
        mockTrackerProgress.value = 100;
        mockTrackerStatus.value = 'Synthesizing';
      }
    } else if (mockTrackerStatus.value === 'Synthesizing') {
      mockTrackerElapsed.value += 0.1;
      // Synthesize for a bit, then mark complete
      if (mockTrackerElapsed.value >= 5.0) {
        mockTrackerStatus.value = 'Complete';
      }
    } else if (mockTrackerStatus.value === 'Complete') {
      // Pause on complete, then move to next domain
      setTimeout(() => {
        if (mockTrackerStatus.value !== 'Complete') return; // prevent race condition
        mockTrackerIndex.value = (mockTrackerIndex.value + 1) % mockDomains.length;
        mockTrackerProgress.value = 0;
        mockTrackerElapsed.value = 0;
        mockTrackerTokens.value = 0;
        mockTrackerStatus.value = 'Running';
      }, 1500);
      mockTrackerStatus.value = 'Waiting'; // transitional state
    }
  }, tickRate);
}

function getMockTrackerPhaseText() {
  const progress = mockTrackerProgress.value;
  const status = mockTrackerStatus.value;
  if (status === 'Synthesizing' || status === 'Waiting') {
    return 'Generating Gemini AI report...';
  }
  if (status === 'Complete') {
    return 'Report added to ledger!';
  }
  if (progress < 25) {
    return 'Fetching asset bundles...';
  }
  if (progress < 55) {
    return 'Parsing script modules...';
  }
  if (progress < 85) {
    return 'Extracting CSS properties...';
  }
  return 'Auditing layout structure...';
}

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
  const list = history.value;

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

function cleanBrandTitle(title: string, domain: string): string {
  if (!title) return 'Design';
  
  let cleaned = title.trim();
  
  // Clean titles like "Stripe | Financial Infrastructure" or "Reddit - Dive into anything"
  if (cleaned.includes('|')) {
    cleaned = cleaned.split('|')[0].trim();
  } else if (cleaned.includes(' - ')) {
    cleaned = cleaned.split(' - ')[0].trim();
  } else if (cleaned.includes(' – ')) {
    cleaned = cleaned.split(' – ')[0].trim();
  } else if (cleaned.includes(':')) {
    cleaned = cleaned.split(':')[0].trim();
  }
  
  // If it matches domain or is a URL
  if (cleaned.includes('.') && cleaned.toLowerCase() === domain.toLowerCase()) {
    const parts = domain.split('.');
    cleaned = parts[0];
  }
  
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned || 'Design';
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

<style>
html {
  scroll-behavior: smooth;
}
</style>

<style scoped>
/* Custom premium scrollbar for the history container */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e5e5;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}

/* Premium Reveal Animations */
.reveal-item {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.reveal-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered transition delays */
.reveal-delay-1 { transition-delay: 100ms; }
.reveal-delay-2 { transition-delay: 200ms; }
.reveal-delay-3 { transition-delay: 300ms; }
.reveal-delay-4 { transition-delay: 400ms; }
.reveal-delay-5 { transition-delay: 500ms; }
.reveal-delay-6 { transition-delay: 600ms; }
.reveal-delay-7 { transition-delay: 700ms; }
</style>
