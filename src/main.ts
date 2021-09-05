import { Plugin, MarkdownView } from "obsidian";

interface State {
  currentLine?: number;
  pluginEnabled?: boolean;
}
type ValueOf<T> = T[keyof T];
type PluginStateKey = keyof State;
type PluginStateValue = ValueOf<State>;

let pluginState: State = {};
const setState = (key: PluginStateKey, value: PluginStateValue) => {
  pluginState = {
    ...pluginState,
    [key.valueOf()]: value,
  };
};

export default class GhostFocusPlugin extends Plugin {
  async onload() {
    pluginState = { currentLine: -1, pluginEnabled: true };

    this.addCommand({
      id: "toggle-plugin",
      name: "Toggle plugin on/off",
      checkCallback: (checking: boolean) => {
        const mdView = this.app.workspace.activeLeaf.view as MarkdownView;
        if (mdView && mdView.getMode() === "source") {
          if (!checking) {
            setState("pluginEnabled", !pluginState.pluginEnabled);
            this.removeGhostFadeFocusClassNamesFromCMs();
          }
          return true;
        }
        return false;
      },
    });

    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      cm.on("cursorActivity", this.onCursorActivity);
    });
  }

  onCursorActivity = (cm: CodeMirror.Editor) => {
    if (pluginState.pluginEnabled) {
      const currentCursorPos = cm.getDoc().getCursor();
      if (pluginState.currentLine !== currentCursorPos.line) {
        setState("currentLine", currentCursorPos.line);
        this.removeGhostFadeFocusClassNames(cm);
        this.addGhostFadeFocusClassNames(cm);
      }
    }
  };

  addGhostFadeFocusClassNames(cm: CodeMirror.Editor) {
    const totalLines = cm.lineCount();
    const currentCursorPosLine = cm.getDoc().getCursor().line;
    for (let i = -5; i <= 5; i++) {
      const lineNumber = currentCursorPosLine + i;
      if (lineNumber >= 0 && lineNumber < totalLines) {
        if (i === 0) {
          cm.addLineClass(lineNumber, "wrap", "CodeMirror-activeline");
        } else {
          if (pluginState.pluginEnabled) {
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

  onunload() {
    this.app.workspace.iterateCodeMirrors((cm: CodeMirror.Editor) => {
      cm.off("cursorActivity", this.onCursorActivity);
      this.removeGhostFadeFocusClassNames(cm);
    });
  }
}
