<script lang="ts">
  import { onMount } from 'svelte';

  import type { Config } from './config';
  import BodyContainer from './components/BodyContainer.svelte';
  import Footer from './components/Footer.svelte';
  import Header from './components/Header.svelte';
  import ItemContainer from './components/ItemContainer.svelte';
  import ItemLabel from './components/ItemLabel.svelte';
  import Switch from './components/Switch.svelte';
  import TextField from './components/TextField.svelte';
  import { Constants } from './constants';
  import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

  let config: Config = { ...Constants.defaultConfig };

  let inputUrl = '';
  let versionPumlSrc = '';
  let inputUrlErrorMessage = '';

  let deniedUrlsText = '';

  let loading = false;

  onMount(() => {
    chrome.runtime.sendMessage({ command: Constants.commands.getConfig }, (initialConfig: Config) => {
      config = initialConfig;
      inputUrl = initialConfig.pumlServerUrl;
      deniedUrlsText = initialConfig.deniedUrls.join(',\n');
      updatePumlServerUrl(initialConfig.pumlServerUrl);
    });
  });

  function handleToggleButtonClick(): void {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, updateExtensionEnabled);
  }

  function handleUpdateDeniedUrlsButtonClick(): void {
    const deniedUrls = deniedUrlsText
      .trim()
      .split(/\s*,\s*/)
      .filter((url) => !!url);
    chrome.runtime.sendMessage({ command: Constants.commands.setDeniedUrls, deniedUrls }, updateDeniedUrls);
  }

  function handleChangeServerUrlButtonClick(): void {
    const pumlServerUrl = !inputUrl.endsWith('/') ? inputUrl : inputUrl.substring(0, inputUrl.length - 1);
    if (config.pumlServerUrl == pumlServerUrl) return;
    chrome.runtime.sendMessage({ command: Constants.commands.setPumlServerUrl, pumlServerUrl }, updatePumlServerUrl);
  }

  function updateExtensionEnabled(extensionEnabled: boolean): void {
    config.extensionEnabled = extensionEnabled;
  }

  function updateDeniedUrls(deniedUrls: string[]): void {
    deniedUrlsText = deniedUrls.join(',\n');
  }

  function updatePumlServerUrl(pumlServerUrl: string): void {
    config.pumlServerUrl = pumlServerUrl;

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
          versionPumlSrc = `data:image/svg+xml,${encodeURIComponent(versionUmlText)}`;
          inputUrlErrorMessage = '';
        } else {
          versionPumlSrc = '';
          inputUrlErrorMessage = invalidPumlServerUrl(pumlServerUrl);
        }
      } catch {
        versionPumlSrc = '';
        inputUrlErrorMessage = invalidPumlServerUrl(pumlServerUrl);
      } finally {
        loading = false;
      }
    })().then();
  }

  function invalidPumlServerUrl(invalidUrl: string): string {
    return `${invalidUrl} does not refer a valid plantUML serer`;
  }

  function setAsDefault() {
    inputUrl = Constants.defaultConfig.pumlServerUrl;
    handleChangeServerUrlButtonClick();
  }
</script>

<Header />

<ItemContainer>
  <ItemLabel>Visualize PlantUML code</ItemLabel>
  <Switch id="switch" on:change={handleToggleButtonClick} value={config.extensionEnabled} />
</ItemContainer>

<ItemContainer>
  <ItemLabel>Server URL</ItemLabel>
  <TextField
    bind:value={inputUrl}
    on:blur={handleChangeServerUrlButtonClick}
    on:keypress={(event) => {
      if (event.key === 'Enter') handleChangeServerUrlButtonClick();
    }}
    disabled={loading}
    placeholder="https://*"
  />
</ItemContainer>

<BodyContainer>
  <div class="puml-server-version-image">
    {#if loading}
      <div class="loading">Loading...</div>
    {:else if inputUrlErrorMessage}
      <div class="error">{inputUrlErrorMessage}</div>
    {:else if !versionPumlSrc}
      No server
    {:else}
      <img src={versionPumlSrc} alt="PlantUML version" />
    {/if}
  </div>
</BodyContainer>

<ItemContainer>
  <ItemLabel>Denied URLs (csv format)</ItemLabel>
  <TextField
    bind:value={deniedUrlsText}
    on:blur={handleUpdateDeniedUrlsButtonClick}
    on:keypress={(event) => {
      if (event.key === 'Enter') handleUpdateDeniedUrlsButtonClick();
    }}
    disabled={loading}
  />
</ItemContainer>

<Footer disabled={loading} on:clickSetAsDefault={setAsDefault} />

<style lang="scss">
  :global(body) {
    --color-background: #f9f9fa;
    --color-text-primary: #0c0c0d;
    --color-text-secondary: #737373;
    --color-text-caution: #d70022;
    --color-surface-primary: #ffffff;
    --color-surface-secondary: #d7d7db;
    --color-surface-secondary-hover: #b1b1b3;
    --color-surface-accent: #0a84ff;
    --color-surface-accent-hover: #0060df;
    --color-border-primary: #d7d7db;
    --color-border-secondary: #ededf0;
    --color-border-accent: #0060df;
    --space-window: 20px;
    --space-md: 16px;
    --space-sm: 8px;
    --border-radius-md: 6px;
    --font-size-body: 14px;

    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-size: var(--font-size-body);
    line-height: 1.5;
    margin: 0;
    max-width: 100%;
    width: 600px;
  }

  .puml-server-version-image {
    display: flex;
    flex-direction: column;
    height: 200px; // The size of a version image is 505x187.
    justify-content: center;
    padding: var(--space-sm) 0;

    @keyframes blink {
      from {
        opacity: 1;
      }
      to {
        opacity: 0.5;
      }
    }

    .loading {
      animation: 0.5s ease-in-out infinite alternate blink;
      text-align: center;
    }

    .error {
      color: var(--color-text-caution);
    }

    img {
      background-color: var(--color-surface-primary);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--color-border-secondary);
      width: 100%;
      user-select: none;
    }
  }
</style>
