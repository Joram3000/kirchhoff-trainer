<script lang="ts">
  import type { Accent } from '../../types';

  interface Props {
    accent: Accent;
  }

  let { accent }: Props = $props();

  const LABELS: Record<Accent, string> = { kcl: 'KCL', kvl: 'KVL', mixed: 'KCL + KVL' };
</script>

<span class="law-chip law-{accent}">{LABELS[accent]}</span>
