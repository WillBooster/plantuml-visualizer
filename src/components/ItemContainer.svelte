<div>
  <slot />
</div>

<style lang="scss">
  div {
    align-items: center;
    background-color: var(--color-surface-primary);
    border-bottom: 1px solid var(--color-border-secondary);
    box-sizing: border-box;
    display: flex;
    height: calc(2 * var(--space-md) + var(--font-size-body));
    justify-content: space-between;
    padding: 0 var(--space-window);
  }
</style>
