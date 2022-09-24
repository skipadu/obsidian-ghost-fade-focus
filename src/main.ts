import { Plugin, MarkdownView } from "obsidian";
import {
  EditorView,
  Decoration,
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
} from "@codemirror/view";
import { Extension, RangeSetBuilder } from "@codemirror/state";
import {
  GhostFocusSettingTab,
  GhostFocusSettings,
  DEFAULT_SETTINGS,
} from "./settings";

export default class GhostFocusPlugin extends Plugin {
  settings: GhostFocusSettings;
  rootElement: HTMLElement;

  async loadSettings() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  addCSSVariables() {
    this.rootElement = document.documentElement;
    this.rootElement.style.setProperty(
      "--ghost-fade-focus-opacity-1",
      `${this.settings.opacity_1}`
    );
    this.rootElement.style.setProperty(
      "--ghost-fade-focus-opacity-2",
      `${this.settings.opacity_2}`
    );
    this.rootElement.style.setProperty(
      "--ghost-fade-focus-opacity-3",
      `${this.settings.opacity_3}`
    );
    this.rootElement.style.setProperty(
      "--ghost-fade-focus-opacity-4",
      `${this.settings.opacity_4}`
    );
    this.rootElement.style.setProperty(
      "--ghost-fade-focus-opacity-5",
      `${this.settings.opacity_5}`
    );
    this.rootElement.style.setProperty(
      "--ghost-fade-focus-opacity",
      `${this.settings.opacity}`
    );
  }

  removeCSSVariables() {
    this.rootElement = document.documentElement;
    this.rootElement.style.removeProperty("--ghost-fade-focus-opacity-1");
    this.rootElement.style.removeProperty("--ghost-fade-focus-opacity-2");
    this.rootElement.style.removeProperty("--ghost-fade-focus-opacity-3");
    this.rootElement.style.removeProperty("--ghost-fade-focus-opacity-4");
    this.rootElement.style.removeProperty("--ghost-fade-focus-opacity-5");
    this.rootElement.style.removeProperty("--ghost-fade-focus-opacity");
  }

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new GhostFocusSettingTab(this.app, this));

    this.addCommand({
      id: "toggle-plugin",
      name: "Toggle plugin on/off",
      checkCallback: (checking: boolean) => {
        const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (mdView && mdView.getMode() === "source") {
          if (!checking) {
            // TODO: Maybe should remove this setting altogether
            this.settings.enabled = !this.settings.enabled;
            this.saveSettings();

            // TODO: Maybe should remove this setting altogether
            if (this.settings.enabled) {
              // this.addGhostFadeFocusClassNamesToCMs();
            }
            this.refreshStuff();
          }
          return true;
        }
        return false;
      },
    });

    const baseTheme = EditorView.baseTheme({});

    const fadedLines = (): Extension => {
      return [baseTheme, [], showFadedLines];
    };

    const showFadedLines = ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
          this.decorations = fadedLineDeco(view);
        }

        update(update: ViewUpdate) {
          if (
            update.docChanged ||
            update.viewportChanged ||
            update.selectionSet
          ) {
            this.decorations = fadedLineDeco(update.view);
          }
        }
      },
      {
        decorations: (v) => v.decorations,
      }
    );

    const fadedLine = (index: number) =>
      Decoration.line({
        attributes: {
          class: `ghost-fade-focus--${index}`,
        },
      });

    const fadedLineOther = () =>
      Decoration.line({
        attributes: {
          class: `ghost-fade-focus`,
        },
      });

    const fadedLineDeco = (view: EditorView) => {
      // if (this.settings.enabled) {
      const cursorPos = view.state.selection.main.head;
      const cursorPosLine = view.state.doc.lineAt(cursorPos).number;

      let builder = new RangeSetBuilder<Decoration>();
      for (let { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; ) {
          let line = view.state.doc.lineAt(pos);

          if (
            line.number >= cursorPosLine - 5 &&
            line.number <= cursorPosLine + 5
          ) {
            builder.add(
              line.from,
              line.from,
              fadedLine(Math.abs(line.number - cursorPosLine))
            );
          } else {
            builder.add(line.from, line.from, fadedLineOther());
          }
          pos = line.to + 1;
        }
      }
      return builder.finish();
      // }
    };
    // if (this.settings.enabled) {
    this.registerEditorExtension(fadedLines());
    this.addCSSVariables();
    // }
  }

  refreshStuff() {
    if (this.settings.enabled) {
      this.addCSSVariables();
    } else {
      this.removeCSSVariables();
      this.app.workspace.updateOptions();
    }
  }
}
