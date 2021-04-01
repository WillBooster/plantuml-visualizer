<script lang="ts">
  import { onMount } from 'svelte';

  import { Constants } from './constants';
  import type { Config } from './constants';
  import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

  let config: Config = { ...Constants.defaultConfig };

  let inputUrl = '';
  let versionPumlSrc = '';
  let inputUrlErrorMessage = '';

  let deniedUrlRegexesText = '';

  let loading = false;

  onMount(() => {
    chrome.runtime.sendMessage({ command: Constants.commands.getConfig }, (initialConfig: Config) => {
      config = initialConfig;
      inputUrl = initialConfig.pumlServerUrl;
      deniedUrlRegexesText = initialConfig.deniedUrlRegexes.join(',\n');
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

  function handleUpdateDeniedUrlRegexesButtonClick(): void {
    const deniedUrlRegexes = deniedUrlRegexesText
      .trim()
      .split(/\s*,\s*/)
      .filter((regex) => !!regex);
    chrome.runtime.sendMessage(
      { command: Constants.commands.setDeniedUrlRegexes, deniedUrlRegexes },
      updateDeniedUrlRegexes
    );
  }

  function updateExtensionEnabled(extensionEnabled: boolean): void {
    config.extensionEnabled = extensionEnabled;
  }

  function updatePumlServerUrl(pumlServerUrl: string): void {
    if (!/^https:\/\/.*$/.test(pumlServerUrl)) {
      inputUrlErrorMessage = `${pumlServerUrl} does not match https://*`;
      return;
    }
    loading = true;
    (async () => {
      try {
        const res = await fetch(PlantUmlEncoder.getImageUrl(Constants.versionUmlText, pumlServerUrl));
        if (res.ok) {
          const versionUmlText = await res.text();
          config.pumlServerUrl = pumlServerUrl;
          inputUrl = pumlServerUrl;
          versionPumlSrc = `data:image/svg+xml,${encodeURIComponent(versionUmlText)}`;
          inputUrlErrorMessage = '';
        } else {
          inputUrlErrorMessage = invalidPumlServerUrl(pumlServerUrl);
        }
      } catch {
        inputUrlErrorMessage = invalidPumlServerUrl(pumlServerUrl);
      } finally {
        loading = false;
      }
    })().then();
  }

  function invalidPumlServerUrl(invalidUrl: string): string {
    return `${invalidUrl} does not refer a valid plantUML serer`;
  }

  function updateDeniedUrlRegexes(deniedUrlRegexes: string[]): void {
    deniedUrlRegexesText = deniedUrlRegexes.join(',\n');
  }
</script>

<div id="popup">
  {#if loading}
    <p>loading...</p>
  {:else}
    <button class="puml-vis-toggle" on:click={handleToggleButtonClick}
      >{config.extensionEnabled ? 'Disable' : 'Enable'} PlantUML visualization</button
    >

    <p class="puml-vis-server-url">server: {config.pumlServerUrl}</p>
    <input class="puml-vis-server-url" bind:value={inputUrl} />
    <p class="puml-vis-error">{inputUrlErrorMessage}</p>
    <button class="puml-vis-server-url" on:click={handleChangeServerUrlButtonClick}
      >Change server URL (https is required)</button
    >
    <img class="puml-vis-version" src={versionPumlSrc} alt="PlantUML version" />

    <p class="puml-vis-denined-list">denied URLs (csv format)</p>
    <textarea class="puml-vis-denined-list" bind:value={deniedUrlRegexesText} />
    <button class="puml-vis-denined-list" on:click={handleUpdateDeniedUrlRegexesButtonClick}
      >Update denied URLs (regex is avairable)</button
    >
  {/if}
</div>

<style lang="scss">
  #popup {
    width: 500px;
  }

  button.puml-vis-toggle,
  img.puml-vis-version {
    margin-bottom: 10px;
  }

  p.puml-vis-server-url,
  input.puml-vis-server-url,
  img.puml-vis-version,
  textarea.puml-vis-denined-list,
  p.puml-vis-error {
    width: 100%;
    box-sizing: border-box;
  }

  textarea.puml-vis-denined-list {
    resize: none;
  }

  p.puml-vis-error {
    color: #ff604f;
  }
</style>
