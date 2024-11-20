import { CURRENT_SCHEMA_VERSION, defaultConfig } from './constants.js';
import { Config, DeckId } from './types.js';

const localStorageGet = async (key: string, fallback: any = null): Promise<any> => {
  const data = await chrome.storage.local.get(key);
  const value = data[key];

  if (value === null) return fallback;
  try {
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

function localStorageSet(key: string, value: any) {
  console.log('SETTING THIS ', { [key]: value });
  chrome.storage.local.set({ [key]: value });
}

export function migrateSchema(config: Config) {
  if (config.schemaVersion === 0) {
    // Keybinds changed from string to object
    // We don't have all the information required to turn them into objects
    // Just delete them and let users re-enter them
    for (const key of [
      'showPopupKey',
      'blacklistKey',
      'neverForgetKey',
      'nothingKey',
      'somethingKey',
      'hardKey',
      'goodKey',
      'easyKey',
    ] as const) {
      config[key] = defaultConfig[key];
    }

    config.schemaVersion = 1;
  }
}

export const loadConfig = async (): Promise<Config> => {
  console.log('LOADING CONFIG');

  const config_test = await localStorageGet('disableFadeAnimation');

  if (config_test === null || config_test === undefined) {
    // Save default config to local storage
    console.log('Saving config for the first time');

    const default_config_entries = Object.fromEntries(Object.entries(defaultConfig));

    await chrome.storage.local.set(default_config_entries);
  }

  const config = (await chrome.storage.local.get(null)) as Config;

  //config.schemaVersion = localStorageGet('schemaVersion', 0);
  migrateSchema(config);

  // If the schema version is not the current version after applying all migrations, give up and refuse to load the config.
  // Use the default as a fallback.
  if (config.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return defaultConfig;
  }

  return config;
};

export const config = await loadConfig();

export function saveConfig(config: any) {
  for (const [key, value] of Object.entries(config)) {
    localStorageSet(key, value);
  }
}

// Make sure config is saved in local storage on first run
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    saveConfig(config);
  }
});
