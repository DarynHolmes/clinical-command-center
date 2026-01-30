<script setup lang="ts">
definePageMeta({
  layout: 'landing'
})

const features = [
  {
    icon: 'i-lucide-brain',
    title: 'AI-Optimized Protocol Design',
    description: 'Leverage machine learning to design protocols that maximize efficacy while minimizing patient burden.'
  },
  {
    icon: 'i-lucide-activity',
    title: 'Real-Time Biomarker Tracking',
    description: 'Monitor biomarker trends across your trial population with instant visibility into safety signals.'
  },
  {
    icon: 'i-lucide-git-compare',
    title: 'Protocol Amendment Diffing',
    description: 'Track every protocol change with visual diffs, impact analysis, and regulatory audit trails.'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Compliance & Audit Trails',
    description: 'Built-in compliance tracking ensures your trial meets FDA, EMA, and ICH-GCP requirements.'
  }
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b border-default">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-heart-pulse"
            class="size-7 text-primary"
          />
          <span class="font-semibold text-lg">Clinical Command Center</span>
        </div>
        <div class="flex items-center gap-3">
          <UColorModeSwitch size="sm" />
          <UButton
            to="/login"
            color="primary"
            variant="solid"
          >
            Sign In
          </UButton>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="flex-1 flex flex-col justify-center">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-default">
            Modern Clinical Trial
            <span class="text-primary">Intelligence</span>
          </h1>
          <p class="mt-6 text-lg text-muted leading-relaxed">
            Accelerate your clinical trials with real-time biomarker monitoring,
            intelligent protocol management, and regulatory-ready audit trails.
            Built for the next generation of clinical research.
          </p>
          <div class="mt-10">
            <UButton
              to="/login"
              color="primary"
              size="lg"
            >
              Get Started
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="bg-muted/30 border-y border-default">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-default">
            Everything you need to run better trials
          </h2>
          <p class="mt-4 text-muted max-w-2xl mx-auto">
            Purpose-built tools that help clinical teams move faster without sacrificing compliance or data quality.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            :ui="{ body: 'p-6' }"
          >
            <div class="flex gap-4">
              <div class="shrink-0">
                <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UIcon
                    :name="feature.icon"
                    class="size-5 text-primary"
                  />
                </div>
              </div>
              <div>
                <h3 class="font-semibold text-default">
                  {{ feature.title }}
                </h3>
                <p class="mt-1 text-sm text-muted">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-default">
          Ready to transform your clinical trials?
        </h2>
        <p class="mt-4 text-muted">
          Join research teams already using Clinical Command Center.
        </p>
        <div class="mt-8">
          <UButton
            to="/login"
            color="primary"
            size="lg"
          >
            Start Free Trial
          </UButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-default">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-muted">
            <UIcon
              name="i-lucide-heart-pulse"
              class="size-5"
            />
            <span class="text-sm">Clinical Command Center</span>
          </div>
          <p class="text-sm text-muted">
            Built for clinical research teams
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
