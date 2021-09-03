import { Plugin, Editor, MarkdownView } from "obsidian";

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
      editorCallback: (editor: Editor, _view: MarkdownView) => {
        setState("pluginEnabled", !pluginState.pluginEnabled);
        this.removeGhostFadeFocusClassNamesOutsider(editor.lineCount());
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
        const totalLines = cm.lineCount();
        this.removeGhostFadeFocusClassNames(
          cm,
          totalLines,
          currentCursorPos.line
        );
        this.addGhostFadeFocusClassNames(cm, totalLines, currentCursorPos.line);
      }
    }
  };

  addGhostFadeFocusClassNames(
    cm: CodeMirror.Editor,
    totalLines: number,
    currentCursorPosLine: number
  ) {
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

  removeGhostFadeFocusClassNamesOutsider(totalLines: number) {
    this.app.workspace.iterateCodeMirrors((cm: CodeMirror.Editor) => {
      const doc = cm.getDoc();
      const currentCursorPos = doc.getCursor();
      this.removeGhostFadeFocusClassNames(
        cm,
        totalLines,
        currentCursorPos.line
      );
    });
  }

  removeGhostFadeFocusClassNames(
    cm: CodeMirror.Editor,
    totalLines: number,
    currentCursorPosLine: number
  ) {
    for (let i = 0; i < totalLines; i++) {
      cm.removeLineClass(i, "wrap");
      if (i === currentCursorPosLine) {
        cm.addLineClass(i, "wrap", "CodeMirror-activeline");
      }
    }
  }

  onunload() {
    this.app.workspace.iterateCodeMirrors((cm: CodeMirror.Editor) => {
      cm.off("cursorActivity", this.onCursorActivity);
      this.removeGhostFadeFocusClassNames(
        cm,
        cm.lineCount(),
        cm.getDoc().getCursor().line
      );
    });
  }
}
