declare module '*.svelte' {
  class SvelteComponent {
      constructor(props: any);
  }
  const component: SvelteComponent;
  export default { component }
}
