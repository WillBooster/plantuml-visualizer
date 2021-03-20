<script lang="ts">
  import { onMount } from 'svelte';

  import { Constants } from './constants';
  import type { Config } from './constants';
  import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

  let config: Config = { ...Constants.defaultConfig };
  let inputUrl = '';
  let versionPumlSrc = '';
  let errorMessage = '';
  let loading = false;

  onMount(() => {
    chrome.runtime.sendMessage({ command: Constants.commands.getConfig }, (initialConfig: Config) => {
      config = { ...initialConfig };
      inputUrl = initialConfig.pumlServerUrl;
      updatePumlServerUrl(initialConfig.pumlServerUrl);
    });
  });

  function handleToggleButtonClick(): void {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, updateExtensionEnabled);
  }

  function handleChangeServerUrlButtonClick(): void {
    const normalizedUrl = !inputUrl.endsWith('/') ? inputUrl : inputUrl.substring(0, inputUrl.length - 1);
    chrome.runtime.sendMessage(
      { command: Constants.commands.setPumlServerUrl, pumlServerUrl: normalizedUrl },
      updatePumlServerUrl
    );
  }

  function updateExtensionEnabled(extensionEnabled: boolean): void {
    config = { ...config, extensionEnabled };
  }

  function updatePumlServerUrl(pumlServerUrl: string): void {
    if (!/^https:\/\/.*$/.test(pumlServerUrl)) {
      errorMessage = `${pumlServerUrl} does not match https://*`;
      return;
    }
    loading = true;
    (async () => {
      try {
        const res = await fetch(PlantUmlEncoder.getImageUrl(Constants.versionUmlText, pumlServerUrl));
        if (res.ok) {
          const versionUmlText = await res.text();
          config = { ...config, pumlServerUrl };
          inputUrl = pumlServerUrl;
          versionPumlSrc = `data:image/svg+xml,${encodeURIComponent(versionUmlText)}`;
          errorMessage = '';
        } else {
          errorMessage = invalidPumlServerUrl(pumlServerUrl);
        }
      } catch {
        errorMessage = invalidPumlServerUrl(pumlServerUrl);
      } finally {
        loading = false;
      }
    })().then();
  }

  function invalidPumlServerUrl(invalidUrl: string): string {
    return `${invalidUrl} does not refer a valid plantUML serer`;
  }
</script>

<div id="popup">
  {#if !loading}
    <button class="puml-vis-toggle" on:click={handleToggleButtonClick}
      >{config.extensionEnabled ? 'Disable' : 'Enable'} PlantUML visualization</button
    >
    <p class="puml-vis-server-url">server: {config.pumlServerUrl}</p>
    <input class="puml-vis-server-url" bind:value={inputUrl} />
    <p class="puml-vis-error">{errorMessage}</p>
    <button class="puml-vis-server-url" on:click={handleChangeServerUrlButtonClick}
      >Change server URL (https is required)</button
    >
    <img class="puml-vis-version" src={versionPumlSrc} alt="PlantUML version" />
  {:else}
    <p>loading...</p>
  {/if}
</div>

<style>
  #popup {
    width: 500px;
  }

  button.puml-vis-toggle {
    margin-bottom: 10px;
  }

  p.puml-vis-server-url,
  input.puml-vis-server-url,
  p.puml-vis-error,
  img.puml-vis-version {
    width: 100%;
    box-sizing: border-box;
  }

  p.puml-vis-error {
    color: #ff604f;
  }
</style>
