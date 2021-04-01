<script lang="ts">
  import Button from './Button.svelte';

  export let isDisabled: boolean | undefined = undefined;
  export let onClickSetAsDefault: () => void;
</script>

<div><Button {isDisabled} onClick={onClickSetAsDefault}>Set as default</Button></div>

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
