import { config, migrateSchema, saveConfig } from '../config.js';
import { POPUP_EXAMPLE_DATA } from '../constants.js';
import { Popup } from '../content/popup.js';
import { showError } from '../content/toast.js';
import { JpdbWordData } from '../content/word.js';
import { Config } from '../types.js';
import { assert, nonNull, wrap } from '../util.js';
import { defineCustomElements, SettingElement } from './elements.js';

// Custom element definitions

// Common behavior shared for all settings elements

let hasUnsavedChanges = false;

export function markUnsavedChanges() {
  document.body.classList.add('has-unsaved-changes');
  hasUnsavedChanges = true;
}

export function unmarkUnsavedChanges() {
  document.body.classList.remove('has-unsaved-changes');
  hasUnsavedChanges = false;
}

addEventListener(
  'beforeunload',
  event => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = '';
    }
  },
  { capture: true },
);

try {
  defineCustomElements();

  nonNull(document.querySelector('#export')).addEventListener('click', async () => {
    try {
      const a = document.createElement('a');
      a.download = 'jpdbreader-settings.json';
      a.href = `data:application/json,${encodeURIComponent(JSON.stringify(config, null, 4))}`;
      a.click();
    } catch (error) {
      showError(error);
    }
  });

  const inputFilePicker = nonNull(document.querySelector('#import-file-picker')) as HTMLInputElement;
  inputFilePicker.addEventListener('change', async () => {
    try {
      const files = inputFilePicker.files;
      console.log(files);

      if (files === null || files.length === 0) return;

      const fileContents: string = await wrap(new FileReader(), (reader: any, resolve: any, reject: any) => {
        reader.onload = () => {
          assert(typeof reader.result === 'string', 'File Reader returned incorrect result type');
          resolve(reader.result);
        };
        reader.onerror = () => reject({ message: 'Error occurred while reading file' });
        reader.readAsText(files[0]);
      });

      try {
        const data = JSON.parse(fileContents) as Config;
        console.log(data);
        migrateSchema(data);
        Object.assign(config, data);

        for (const elem of document.querySelectorAll('[name]')) {
          (elem as any).value = (config as any)[(elem as any).name] ?? null;
        }

        markUnsavedChanges();
      } catch (error) {
        alert(`Could not import config: ${error.message}`);
      }
    } catch (error) {
      showError(error);
    }
  });

  nonNull(document.querySelector('#import')).addEventListener('click', () => {
    inputFilePicker.click();
  });

  nonNull(document.querySelector('[name="customPopupCSS"]')).addEventListener('input', (event: Event) => {
    const newCSS = (event.target as HTMLInputElement).value;
    popup.updateStyle(newCSS);
  });

  for (const elem of document.querySelectorAll('[name]')) {
    (elem as any).value = (config as any)[(elem as any).name] ?? null;
  }

  const popup = Popup.getDemoMode(nonNull(document.querySelector('#preview')));
  popup.setData(POPUP_EXAMPLE_DATA);
  popup.fadeIn();

  const saveButton = nonNull(document.querySelector('input[type=submit]'));
  saveButton.addEventListener('click', async (event: Event) => {
    console.log('BEGINNING EVENT FOR SAVING CONFIG');
    event.preventDefault();
    try {
      for (const name of Object.keys(config)) {
        const elem = document.querySelector(`[name="${name}"]`);
        if (elem !== null) {
          const newValue = (elem as SettingElement).value;
          (config as any)[name] = newValue;
        }
      }
      console.log('AT THE SAVECONFIG CALL');
      saveConfig(config);

      unmarkUnsavedChanges();
    } catch (error) {
      showError(error);
    }
  });
} catch (error) {
  showError(error);
}
