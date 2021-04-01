<script lang="ts">
  export let isDisabled: boolean = false;
  export let onBlur: svelte.JSX.FocusEventHandler<HTMLInputElement> | undefined = undefined;
  export let onKeyPress: svelte.JSX.KeyboardEventHandler<HTMLInputElement> | undefined = undefined;
  export let placeHolder = '';
  export let value: string;
</script>

<input on:blur={onBlur} on:keypress={onKeyPress} bind:value disabled={isDisabled} placeholder={placeHolder} />

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
