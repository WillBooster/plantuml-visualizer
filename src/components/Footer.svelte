<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from './Button.svelte';

  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{ clickBackToDefault: undefined }>();
</script>

<div><Button {disabled} on:click={() => dispatch('clickBackToDefault')}>Back to default</Button></div>

<style lang="scss">
  div {
    align-items: center;
    background-color: var(--color-surface-primary);
    border-top: 1px solid var(--color-border-secondary);
    display: flex;
    justify-content: flex-end;
    padding: var(--space-md) var(--space-window) var(--space-window);
    user-select: none;

    & > *:not(:first-child) {
      margin-left: var(--space-md);
    }
  }
</style>
