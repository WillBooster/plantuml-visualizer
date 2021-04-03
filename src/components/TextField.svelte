<script lang="ts">
  export let disabled: boolean = false;
  export let placeholder = '';
  export let value: string;
</script>

<input on:blur on:keypress bind:value {disabled} {placeholder} />

<style lang="scss">
  input {
    appearance: none;
    background-color: var(--color-surface-secondary);
    border-radius: var(--border-radius-md);
    border: none;
    color: var(--color-text-primary);
    cursor: pointer;
    flex-grow: 1;
    font: inherit;
    outline: none;
    padding: calc(0.5 * var(--space-sm) + 1px) calc(var(--space-sm) + 1px);

    &:hover {
      background-color: var(--color-surface-secondary-hover);
    }

    &:focus {
      background-color: var(--color-surface-primary);
      border: 1px solid var(--color-border-accent);
      cursor: auto;
    }

    &:disabled {
      color: var(--color-text-secondary);
      cursor: default;
    }
  }
</style>
