import { Plugin, MarkdownView } from "obsidian";
import { PluginStateKey, PluginStateValue, State } from "./state";
import { GhostFocusSettingTab } from "./settings";

let pluginState: State = {};
const setState = (key: PluginStateKey, value: PluginStateValue) => {
  pluginState = {
    ...pluginState,
    [key.valueOf()]: value,
  };
};

interface GhostFocusSettings {
  enabled: boolean;
  opacity_1: number;
  opacity_2: number;
  opacity_3: number;
  opacity_4: number;
  opacity_5: number;
  opacity: number;
}

const DEFAULT_SETTINGS: Partial<GhostFocusSettings> = {
  enabled: false,
  opacity_1: 0.85,
  opacity_2: 0.7,
  opacity_3: 0.55,
  opacity_4: 0.4,
  opacity_5: 0.25,
  opacity: 0.1,
};

export default class GhostFocusPlugin extends Plugin {
  settings: GhostFocusSettings;
  rootElement: HTMLElement;

  async loadSettings() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onFileChange() {
    if (this.settings.enabled) {
      this.addGhostFadeFocusClassNamesToCMs();
    }
  }

  addCSSVariables() {
    this.rootElement = document.documentElement;
    this.rootElement.style.setProperty('--ghost-fade-focus-opacity-1', `${this.settings.opacity_1}`);
    this.rootElement.style.setProperty('--ghost-fade-focus-opacity-2', `${this.settings.opacity_2}`);
    this.rootElement.style.setProperty('--ghost-fade-focus-opacity-3', `${this.settings.opacity_3}`);
    this.rootElement.style.setProperty('--ghost-fade-focus-opacity-4', `${this.settings.opacity_4}`);
    this.rootElement.style.setProperty('--ghost-fade-focus-opacity-5', `${this.settings.opacity_5}`);
    this.rootElement.style.setProperty('--ghost-fade-focus-opacity', `${this.settings.opacity}`);
  }

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new GhostFocusSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("file-open", this.onFileChange.bind(this))
    );

    pluginState = { currentLine: -1 };

    this.addCommand({
      id: "toggle-plugin",
      name: "Toggle plugin on/off",
      checkCallback: (checking: boolean) => {
        const mdView = this.app.workspace.activeLeaf.view as MarkdownView;
        if (mdView && mdView.getMode() === "source") {
          if (!checking) {
            this.settings.enabled = !this.settings.enabled;
            this.saveSettings();
            this.removeGhostFadeFocusClassNamesFromCMs();

            if (this.settings.enabled) {
              this.addGhostFadeFocusClassNamesToCMs();
            }
          }
          return true;
        }
        return false;
      },
    });

    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      cm.on("cursorActivity", this.onCursorActivity);
    });

    this.addCSSVariables();
  }

  onCursorActivity = (cm: CodeMirror.Editor) => {
    if (this.settings.enabled) {
      const currentCursorPos = cm.getDoc().getCursor();
      if (pluginState.currentLine !== currentCursorPos.line) {
        setState("currentLine", currentCursorPos.line);
        this.removeGhostFadeFocusClassNames(cm);
        this.addGhostFadeFocusClassNames(cm);
      }
    }
  };

  addGhostFadeFocusClassNamesToCMs() {
    this.app.workspace.iterateCodeMirrors((cm: CodeMirror.Editor) => {
      this.addGhostFadeFocusClassNames(cm);
    });
  }

  addGhostFadeFocusClassNames(cm: CodeMirror.Editor) {
    const totalLines = cm.lineCount();
    const currentCursorPosLine = cm.getDoc().getCursor().line;
    for (let i = -5; i <= 5; i++) {
      const lineNumber = currentCursorPosLine + i;
      if (lineNumber >= 0 && lineNumber < totalLines) {
        if (i === 0) {
          cm.addLineClass(lineNumber, "wrap", "CodeMirror-activeline");
        } else {
          if (this.settings.enabled) {
            cm.addLineClass(
              lineNumber,
              "wrap",
              `ghost-fade-focus--${Math.abs(i)}`
            );
          }
        }
      }
    }
    for (let i = 0; i < totalLines; i++) {
      if (i !== currentCursorPosLine) {
        cm.addLineClass(i, "wrap", "ghost-fade-focus");
      }
    }
  }

  removeGhostFadeFocusClassNamesFromCMs() {
    this.app.workspace.iterateCodeMirrors((cm: CodeMirror.Editor) => {
      this.removeGhostFadeFocusClassNames(cm);
    });
  }

  removeGhostFadeFocusClassNames(cm: CodeMirror.Editor) {
    for (let i = 0; i < cm.lineCount(); i++) {
      cm.removeLineClass(i, "wrap");
      if (i === cm.getDoc().getCursor().line) {
        cm.addLineClass(i, "wrap", "CodeMirror-activeline");
      }
    }
  }

  removeCSSVariables() {
    this.rootElement = document.documentElement;
    this.rootElement.style.removeProperty('--ghost-fade-focus-opacity-1');
    this.rootElement.style.removeProperty('--ghost-fade-focus-opacity-2');
    this.rootElement.style.removeProperty('--ghost-fade-focus-opacity-3');
    this.rootElement.style.removeProperty('--ghost-fade-focus-opacity-4');
    this.rootElement.style.removeProperty('--ghost-fade-focus-opacity-5');
    this.rootElement.style.removeProperty('--ghost-fade-focus-opacity');
  }

  onunload() {
    this.app.workspace.iterateCodeMirrors((cm: CodeMirror.Editor) => {
      cm.off("cursorActivity", this.onCursorActivity);
      this.removeGhostFadeFocusClassNames(cm);
    });
    this.removeCSSVariables();
  }
}
