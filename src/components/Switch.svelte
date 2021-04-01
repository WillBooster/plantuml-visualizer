<script lang="ts">
  export let isDisabled: boolean = false;
  export let id: string;
  export let onChange: (value: boolean) => void = () => undefined;
  export let value: boolean = false;
</script>

<span>
  <input
    {id}
    disabled={isDisabled}
    type="checkbox"
    bind:checked={value}
    on:change={(event) => {
      onChange(event.currentTarget.checked);
    }}
  />
  <label for={id} />
</span>

<style lang="scss">
  span {
    label {
      background-color: var(--color-surface-secondary);
      border-radius: 0.75em;
      box-sizing: border-box;
      cursor: pointer;
      display: inline-block;
      height: 1.5em;
      position: relative;
      transition: 0.1s background-color;
      vertical-align: top;
      width: 3em;

      &:hover {
        background-color: var(--color-surface-secondary-hover);
      }

      &::after {
        content: '';
        position: absolute;
        width: calc(1.5em - 4px);
        height: calc(1.5em - 4px);
        border-radius: 100%;
        left: 2px;
        top: 2px;
        z-index: 2;
        background-color: var(--color-surface-primary);
        transition: 0.1s left;
      }
    }

    input {
      display: none;

      &:checked {
        + label {
          background-color: var(--color-surface-accent);

          &:hover {
            background: var(--color-surface-accent-hover);
          }

          &::after {
            left: calc(1.5em + 2px);
          }
        }
      }
    }
  }
</style>
