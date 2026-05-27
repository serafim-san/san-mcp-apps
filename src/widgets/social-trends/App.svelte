<script lang="ts">
  import { onMount } from 'svelte'
  import {
    App,
    applyDocumentTheme,
    applyHostFonts,
    applyHostStyleVariables,
    type McpUiHostContext,
  } from '@modelcontextprotocol/ext-apps'
  import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
  import StoryCard from './StoryCard.svelte'
  import type { Story, TrendingStoriesData } from './contract'

  let app = $state<App | null>(null)
  let hostContext = $state<McpUiHostContext | undefined>()

  let stories = $state<Story[]>([])
  let timePeriod = $state('')
  let loading = $state(true)

  $effect(() => {
    if (hostContext?.theme) applyDocumentTheme(hostContext.theme)
    if (hostContext?.styles?.variables) applyHostStyleVariables(hostContext.styles.variables)
    if (hostContext?.styles?.css?.fonts) applyHostFonts(hostContext.styles.css.fonts)
  })

  function ingest(result: CallToolResult) {
    const data = result.structuredContent as TrendingStoriesData | undefined
    if (!data) return
    timePeriod = data.time_period ?? ''
    const periods = Array.isArray(data.trending_stories) ? data.trending_stories : []
    stories = periods.length ? (periods.at(-1)?.top_stories ?? []) : []
    loading = false
  }

  onMount(async () => {
    const instance = new App(
      { name: 'santiment-social-trends', version: '1.0.0' },
      { availableDisplayModes: ['inline'] },
    )

    instance.ontoolresult = ingest
    instance.onerror = console.error
    instance.onhostcontextchanged = (params) => {
      hostContext = { ...hostContext, ...params }
    }

    await instance.connect()
    app = instance
    hostContext = instance.getHostContext()
    loading = false
  })

  async function onStoryClick(story: Story) {
    if (!app) return
    try {
      await app.sendMessage({
        role: 'user',
        content: [{ type: 'text', text: `Tell me more about: "${story.title}"` }],
      })
    } catch (e) {
      console.error('sendMessage failed', e)
    }
  }
</script>

<div class="night-mode bg-white p-4">
  <header class="flex items-center gap-2 mb-4">
    <h2 class="text-base font-semibold text-rhino">📈 Social Trends</h2>
    {#if timePeriod}
      <span class="text-xs font-medium bg-green px-2 py-0.5 rounded text-white-day">{timePeriod}</span>
    {/if}
  </header>

  {#if loading}
    <p class="text-center py-10 text-sm text-waterloo">Loading…</p>
  {:else if stories.length === 0}
    <p class="text-center py-8 text-sm text-waterloo">No trending stories found.</p>
  {:else}
    <ul class="flex flex-col gap-2.5 list-none">
      {#each stories as story}
        <li>
          <StoryCard {story} onclick={() => onStoryClick(story)} />
        </li>
      {/each}
    </ul>
  {/if}
</div>
