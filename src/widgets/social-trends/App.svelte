<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { initMcpApp, onToolResult, sendSizeChanged, request } from '../../lib/mcp-protocol'
  import StoryCard from './StoryCard.svelte'

  type Story = {
    title: string
    bullish_sentiment_ratio: number
    bearish_sentiment_ratio: number
    score: number
  }

  let stories = $state<Story[]>([])
  let timePeriod = $state('')
  let loading = $state(true)

  onMount(async () => {
    onToolResult(async (data) => {
      if (!data) return
      loading = false
      timePeriod = data.time_period ?? ''
      const periods = data.trending_stories ?? []
      stories = periods.length ? (periods[periods.length - 1].top_stories ?? []) : []
      await tick()
      sendSizeChanged()
    })

    await initMcpApp()
    loading = false
  })

  function onStoryClick(story: Story) {
    request('ui/message', {
      content: [{ type: 'text', text: `Tell me more about: "${story.title}"` }],
    })
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
