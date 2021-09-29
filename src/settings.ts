import { App, PluginSettingTab, Setting } from "obsidian";
import GhostFocusPlugin from "./main";

export class GhostFocusSettingTab extends PluginSettingTab {
  plugin: GhostFocusPlugin;

  constructor(app: App, plugin: GhostFocusPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Enable Ghost Fade Focus")
      .setDesc(
        "Toggles the fade; using command palette or shortcut toggles this same value."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();

            this.plugin.removeGhostFadeFocusClassNamesFromCMs();
            if (value) {
              this.plugin.addGhostFadeFocusClassNamesToCMs();
            }
          })
      );
  }
}
