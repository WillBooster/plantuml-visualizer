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
  import Button from './components/Button.svelte';
  import { Constants } from './constants';
  import { PlantUmlEncoder } from './encoder/plantUmlEncoder';

  let config: Config = { ...Constants.defaultConfig };

  let inputServerUrl = '';
  let versionPumlSrc = '';
  let inputServerUrlErrorMessage = '';

  let allowedUrlsText = '';
  let deniedUrlsText = '';

  let loading = false;

  onMount(() => {
    chrome.runtime.sendMessage({ command: Constants.commands.getConfig }, (initialConfig: Config) => {
      config = initialConfig;
      inputServerUrl = initialConfig.pumlServerUrl;
      allowedUrlsText = initialConfig.allowedUrls.join(',\n');
      deniedUrlsText = initialConfig.deniedUrls.join(',\n');
      updatePumlServerUrl(initialConfig.pumlServerUrl);
    });
  });

  function handleToggleExtensionEnabled(): void {
    chrome.runtime.sendMessage({ command: Constants.commands.toggleExtensionEnabled }, updateExtensionEnabled);
  }

  function handleChangeServerUrl(): void {
    const pumlServerUrl = !inputServerUrl.endsWith('/')
      ? inputServerUrl
      : inputServerUrl.substring(0, inputServerUrl.length - 1);
    if (config.pumlServerUrl == pumlServerUrl) return;
    chrome.runtime.sendMessage({ command: Constants.commands.setPumlServerUrl, pumlServerUrl }, updatePumlServerUrl);
  }

  function handleUpdateAllowedUrlsButtonClick(): void {
    const allowedUrls = allowedUrlsText
      .trim()
      .split(/\s*,\s*/)
      .filter((url) => !!url);
    chrome.runtime.sendMessage({ command: Constants.commands.setAllowedUrls, allowedUrls }, updateAllowedUrls);
  }

  function handleUpdateDeniedUrlsButtonClick(): void {
    const deniedUrls = deniedUrlsText
      .trim()
      .split(/\s*,\s*/)
      .filter((url) => !!url);
    chrome.runtime.sendMessage({ command: Constants.commands.setDeniedUrls, deniedUrls }, updateDeniedUrls);
  }

  function updateExtensionEnabled(extensionEnabled: boolean): void {
    config.extensionEnabled = extensionEnabled;
  }

  function updatePumlServerUrl(pumlServerUrl: string): void {
    config.pumlServerUrl = pumlServerUrl;

    if (!/^https?:\/\/.*$/.test(pumlServerUrl)) {
      inputServerUrlErrorMessage = `${pumlServerUrl} does not match https://* or http://* `;
      return;
    }

    loading = true;
    (async () => {
      try {
        const res = await fetch(PlantUmlEncoder.getImageUrl(Constants.versionUmlText, pumlServerUrl));
        if (!res.ok) throw Error();
        const versionUmlText = await res.text();
        versionPumlSrc = `data:image/svg+xml,${encodeURIComponent(versionUmlText)}`;
        inputServerUrlErrorMessage = '';
      } catch {
        versionPumlSrc = '';
        inputServerUrlErrorMessage = `${pumlServerUrl} does not refer a valid plantUML serer`;
      } finally {
        loading = false;
      }
    })().then();
  }

  function updateAllowedUrls(allowedUrls: string[]): void {
    config.allowedUrls = allowedUrls;
    allowedUrlsText = allowedUrls.join(',\n');
  }

  function updateDeniedUrls(deniedUrls: string[]): void {
    config.deniedUrls = deniedUrls;
    deniedUrlsText = deniedUrls.join(',\n');
  }

  function backToDefault() {
    chrome.runtime.sendMessage(
      { command: Constants.commands.setConfig, config: Constants.defaultConfig },
      (newConfig: Config) => {
        config = newConfig;
        inputServerUrl = newConfig.pumlServerUrl;
        allowedUrlsText = newConfig.allowedUrls.join(',\n');
        deniedUrlsText = newConfig.deniedUrls.join(',\n');
        updatePumlServerUrl(newConfig.pumlServerUrl);
      }
    );
  }
</script>

<Header />

<ItemContainer>
  <ItemLabel>Visualize PlantUML code</ItemLabel>
  <Switch id="switch" on:change={handleToggleExtensionEnabled} value={config.extensionEnabled} />
</ItemContainer>

<ItemContainer>
  <ItemLabel>Server URL</ItemLabel>
  <TextField
    bind:value={inputServerUrl}
    on:blur={handleChangeServerUrl}
    on:keypress={(event) => {
      if (event.key === 'Enter') handleChangeServerUrl();
    }}
    disabled={loading}
    placeholder="https://* or http://*"
  />
</ItemContainer>

<BodyContainer>
  <div class="puml-server-version-image">
    {#if loading}
      <div class="loading">Loading...</div>
    {:else if inputServerUrlErrorMessage}
      <div class="error">{inputServerUrlErrorMessage}</div>
    {:else if !versionPumlSrc}
      No server
    {:else}
      <img src={versionPumlSrc} alt="PlantUML version" />
    {/if}
  </div>
</BodyContainer>

<ItemContainer>
  <ItemLabel>Allowed URLs</ItemLabel>
  <TextField bind:value={allowedUrlsText} multiline={true} disabled={loading} placeholder="foo.com" />
  <Button on:click={handleUpdateAllowedUrlsButtonClick}>apply</Button>
</ItemContainer>

<ItemContainer>
  <ItemLabel>Denied URLs</ItemLabel>
  <TextField bind:value={deniedUrlsText} multiline={true} disabled={loading} placeholder="foo.com" />
  <Button on:click={handleUpdateDeniedUrlsButtonClick}>apply</Button>
</ItemContainer>

<Footer disabled={loading} on:clickBackToDefault={backToDefault} />

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
