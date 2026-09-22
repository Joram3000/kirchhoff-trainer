<script lang="ts">
  interface Feedback {
    status: 'good' | 'bad';
    message: string;
  }

  interface Props {
    feedback: Feedback | null;
  }

  let { feedback }: Props = $props();
</script>

{#if feedback}
  <div class="feedback" class:good={feedback.status === 'good'} class:bad={feedback.status === 'bad'}>
    {#if feedback.status === 'good'}
      <svg width="18" height="18" viewBox="0 0 20 20">
        <path
          d="M4 10.5 L8 14.5 L16 5.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    {:else}
      <svg width="18" height="18" viewBox="0 0 20 20">
        <path d="M5 5 L15 15 M15 5 L5 15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      </svg>
    {/if}
    <span>{feedback.message}</span>
  </div>
{/if}
