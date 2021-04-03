<script lang="ts">
  export let disabled: boolean = false;
</script>

<button {disabled} on:click><slot /></button>

<style lang="scss">
  button {
    background: var(--color-surface-secondary);
    appearance: none;
    border: none;
    border-radius: var(--border-radius-md);
    color: var(--color-text-primary);
    cursor: pointer;
    font: inherit;
    outline: none;
    padding: calc(0.5 * var(--space-sm)) var(--space-sm);

    &:hover {
      background: var(--color-surface-secondary-hover);
    }

    &:disabled {
      color: var(--color-text-secondary);
      cursor: default;
    }
  }
</style>
