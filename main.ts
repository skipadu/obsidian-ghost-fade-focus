import { Plugin } from 'obsidian';

interface State {
	currentLine?: number;
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

const getDistanceToCurrentLine = (index: number): number => {
	if (index < pluginState.currentLine) {
		return pluginState.currentLine - index;
	} else if (index > pluginState.currentLine) {
		return index - pluginState.currentLine;
	}
	return 0;
}
export default class GhostFocusPlugin extends Plugin {
	async onload() {
		pluginState = { currentLine: -1 };
		console.log('Loading GhostFocusPlugin');
		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			cm.on("cursorActivity", this.onCursorActivity);
		})
	}
	onCursorActivity(doc: CodeMirror.Doc) {
		const currentCursorPos = doc.getCursor();
		if (pluginState.currentLine !== currentCursorPos.line) {
			setState('currentLine', currentCursorPos.line);
			console.log("Current cursorPosition line:", currentCursorPos.line);
			const codeMirrorCodeElements = document.getElementsByClassName("CodeMirror-code");
			const codeMirrorCodeElement = codeMirrorCodeElements !== null && codeMirrorCodeElements.length > 0 ? codeMirrorCodeElements[0] : null;
			if (codeMirrorCodeElement) {
				const ghostFocusClassName = new RegExp(/\bghost-focus-.+?\b/, 'g');
				for (let i = 0; i < codeMirrorCodeElement.children.length; i++) {
					const child = codeMirrorCodeElement.children[i];
					if (child.className.match(ghostFocusClassName)) {
						child.className = child.className.replace(ghostFocusClassName, '');
					}
					child.className = child.className.concat(`ghost-focus-${getDistanceToCurrentLine(i)}`);
				}
			}
		}
	}
}
