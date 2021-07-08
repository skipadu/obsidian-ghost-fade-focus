import { Plugin } from 'obsidian';

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
		[key.valueOf()]: value
	}
}

export default class GhostFocusPlugin extends Plugin {
	async onload() {
		pluginState = { currentLine: -1, pluginEnabled: true };
		console.log('Loading GhostFocusPlugin');
		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			cm.on("cursorActivity", this.onCursorActivity);
		})
	}

	onCursorActivity(cm: CodeMirror.Editor) {
		const addGhostFadeFocusClassNames = (cm: CodeMirror.Editor, totalLines: number, currentCursorPosLine: number) => {
			for (let i = -5; i <= 5; i++) {
				const lineNumber = currentCursorPosLine + i;
				if (lineNumber >= 0 && lineNumber < totalLines) {
					if (i === 0) {
						cm.addLineClass(lineNumber, "wrap", 'CodeMirror-activeline');
					} else {
						if (pluginState.pluginEnabled) {
							cm.addLineClass(lineNumber, "wrap", `ghost-fade-focus--${Math.abs(i)}`);
						}
					}
				}
			}
			for (let i = 0; i < totalLines; i++) {
				if (i !== currentCursorPosLine) {
					cm.addLineClass(i, "wrap", 'ghost-fade-focus');
				}
			}
		};


		const removeGhostFadeFocusClassNames = (cm: CodeMirror.Editor, totalLines: number, currentCursorPosLine: number) => {
			for (let i = 0; i < totalLines; i++) {
				cm.removeLineClass(i, "wrap");
				if (i === currentCursorPosLine) {
					cm.addLineClass(i, "wrap", 'CodeMirror-activeline');
				}
			}
		};

		// TODO: able to toggle the state of the plugin...
		if (pluginState.pluginEnabled) {
			const currentCursorPos = cm.getDoc().getCursor();
			if (pluginState.currentLine !== currentCursorPos.line) {
				setState('currentLine', currentCursorPos.line);
				const totalLines = cm.lineCount();
				removeGhostFadeFocusClassNames(cm, totalLines, currentCursorPos.line);
				addGhostFadeFocusClassNames(cm, totalLines, currentCursorPos.line);
			}
		}
	}

	addGhostFadeFocusClassNames(cm: CodeMirror.Editor, totalLines: number, currentCursorPosLine: number) {
		for (let i = -5; i <= 5; i++) {
			const lineNumber = currentCursorPosLine + i;
			if (lineNumber >= 0 && lineNumber < totalLines) {
				if (i === 0) {
					cm.addLineClass(lineNumber, "wrap", 'CodeMirror-activeline');
				} else {
					if (pluginState.pluginEnabled) {
						cm.addLineClass(lineNumber, "wrap", `ghost-fade-focus--${Math.abs(i)}`);
					}
				}
			}
		}
		for (let i = 0; i < totalLines; i++) {
			if (i !== currentCursorPosLine) {
				cm.addLineClass(i, "wrap", 'ghost-fade-focus');
			}
		}
	};

	removeGhostFadeFocusClassNames(cm: CodeMirror.Editor, totalLines: number, currentCursorPosLine: number) {
		for (let i = 0; i < totalLines; i++) {
			cm.removeLineClass(i, "wrap");
			if (i === currentCursorPosLine) {
				cm.addLineClass(i, "wrap", 'CodeMirror-activeline');
			}
		}
	};


	// TODO: onunload() and cm.off("update") etc
	// onUpdate(doc: CodeMirror.Doc) {
	// 	const currentCursorPos = doc.getCursor();
	// 	if (pluginState.currentLine !== currentCursorPos.line) {
	// 		setState('currentLine', currentCursorPos.line);
	// 		console.log("Current cursorPosition line:", currentCursorPos.line);
	// 		const codeMirrorCodeElements = document.getElementsByClassName("CodeMirror-code");
	// 		const codeMirrorCodeElement = codeMirrorCodeElements !== null && codeMirrorCodeElements.length > 0 ? codeMirrorCodeElements[0] : null;
	// 		if (codeMirrorCodeElement) {
	// 			const ghostFocusClassName = new RegExp(/\bghost-focus-.+?\b/, 'g');
	// 			for (let i = 0; i < codeMirrorCodeElement.children.length; i++) {
	// 				const child = codeMirrorCodeElement.children[i];
	// 				if (child.className.match(ghostFocusClassName)) {
	// 					child.className = child.className.replace(ghostFocusClassName, '');
	// 				}
	// 				const distance = getDistanceToCurrentLine(i);
	// 				if (distance > 0 && distance <= 5) {
	// 					child.classList.add(`ghost-focus-${distance}`);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
}
