import { App, PluginSettingTab, Setting } from "obsidian";
import GhostFocusPlugin from "./main";

export interface GhostFocusSettings {
  enabled: boolean;
  opacity_1: number;
  opacity_2: number;
  opacity_3: number;
  opacity_4: number;
  opacity_5: number;
  opacity: number;
}

export const DEFAULT_SETTINGS: Partial<GhostFocusSettings> = {
  enabled: false,
  opacity_1: 0.85,
  opacity_2: 0.7,
  opacity_3: 0.55,
  opacity_4: 0.4,
  opacity_5: 0.25,
  opacity: 0.1,
};

export class GhostFocusSettingTab extends PluginSettingTab {
  plugin: GhostFocusPlugin;

  constructor(app: App, plugin: GhostFocusPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    this.containerEl.createEl("h1", { text: "Ghost Fade Focus settings" });

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

            // TODO: Should we try to disable/refresh lines to get the fade off
            // this.plugin.removeGhostFadeFocusClassNamesFromCMs();
            // if (value) {
            // this.plugin.addGhostFadeFocusClassNamesToCMs();
            // }
          })
      );

    this.containerEl.createEl("h2", { text: "Opacity" });
    this.containerEl.createEl("p", {
      text: "These will change the opacity levels used.",
    });

    let opacityLevel1: HTMLDivElement;
    new Setting(containerEl)
      .setName("Opacity - level 1")
      .setDesc("(Default 0.85)")
      .addSlider((slider) =>
        slider
          .setLimits(0.1, 0.9, 0.05)
          .setValue(this.plugin.settings.opacity_1)
          .onChange(async (value) => {
            opacityLevel1.innerText = " " + value.toString();
            this.plugin.settings.opacity_1 = value;
            this.plugin.rootElement.style.setProperty(
              "--ghost-fade-focus-opacity-1",
              `${value}`
            );
            await this.plugin.saveSettings();
          })
      )
      .settingEl.createDiv("", (el: HTMLDivElement) => {
        opacityLevel1 = el;
        el.style.minWidth = "2.0em";
        el.style.textAlign = "right";
        el.innerText = " " + this.plugin.settings.opacity_1.toString();
      });

    let opacityLevel2: HTMLDivElement;
    new Setting(containerEl)
      .setName("Opacity - level 2")
      .setDesc("(Default 0.7)")
      .addSlider((slider) =>
        slider
          .setLimits(0.1, 0.9, 0.05)
          .setValue(this.plugin.settings.opacity_2)
          .onChange(async (value) => {
            opacityLevel2.innerText = " " + value.toString();
            this.plugin.settings.opacity_2 = value;
            this.plugin.rootElement.style.setProperty(
              "--ghost-fade-focus-opacity-2",
              `${value}`
            );
            await this.plugin.saveSettings();
          })
      )
      .settingEl.createDiv("", (el: HTMLDivElement) => {
        opacityLevel2 = el;
        el.style.minWidth = "2.0em";
        el.style.textAlign = "right";
        el.innerText = " " + this.plugin.settings.opacity_2.toString();
      });

    let opacityLevel3: HTMLDivElement;
    new Setting(containerEl)
      .setName("Opacity - level 3")
      .setDesc("(Default 0.55)")
      .addSlider((slider) =>
        slider
          .setLimits(0.1, 0.9, 0.05)
          .setValue(this.plugin.settings.opacity_3)
          .onChange(async (value) => {
            opacityLevel3.innerText = " " + value.toString();
            this.plugin.settings.opacity_3 = value;
            this.plugin.rootElement.style.setProperty(
              "--ghost-fade-focus-opacity-3",
              `${value}`
            );
            await this.plugin.saveSettings();
          })
      )
      .settingEl.createDiv("", (el: HTMLDivElement) => {
        opacityLevel3 = el;
        el.style.minWidth = "2.0em";
        el.style.textAlign = "right";
        el.innerText = " " + this.plugin.settings.opacity_3.toString();
      });

    let opacityLevel4: HTMLDivElement;
    new Setting(containerEl)
      .setName("Opacity - level 4")
      .setDesc("(Default 0.4)")
      .addSlider((slider) =>
        slider
          .setLimits(0.1, 0.9, 0.05)
          .setValue(this.plugin.settings.opacity_4)
          .onChange(async (value) => {
            opacityLevel4.innerText = " " + value.toString();
            this.plugin.settings.opacity_4 = value;
            this.plugin.rootElement.style.setProperty(
              "--ghost-fade-focus-opacity-4",
              `${value}`
            );
            await this.plugin.saveSettings();
          })
      )
      .settingEl.createDiv("", (el: HTMLDivElement) => {
        opacityLevel4 = el;
        el.style.minWidth = "2.0em";
        el.style.textAlign = "right";
        el.innerText = " " + this.plugin.settings.opacity_4.toString();
      });

    let opacityLevel5: HTMLDivElement;
    new Setting(containerEl)
      .setName("Opacity - level 5")
      .setDesc("(Default 0.25)")
      .addSlider((slider) =>
        slider
          .setLimits(0.1, 0.9, 0.05)
          .setValue(this.plugin.settings.opacity_5)
          .onChange(async (value) => {
            opacityLevel5.innerText = " " + value.toString();
            this.plugin.settings.opacity_5 = value;
            this.plugin.rootElement.style.setProperty(
              "--ghost-fade-focus-opacity-5",
              `${value}`
            );
            await this.plugin.saveSettings();
          })
      )
      .settingEl.createDiv("", (el: HTMLDivElement) => {
        opacityLevel5 = el;
        el.style.minWidth = "2.0em";
        el.style.textAlign = "right";
        el.innerText = " " + this.plugin.settings.opacity_5.toString();
      });

    let opacityLevel: HTMLDivElement;
    new Setting(containerEl)
      .setName("Opacity level outside of 5 steps")
      .setDesc("(Default 0.1)")
      .addSlider((slider) =>
        slider
          .setLimits(0.1, 0.9, 0.05)
          .setValue(this.plugin.settings.opacity)
          .onChange(async (value) => {
            opacityLevel.innerText = " " + value.toString();
            this.plugin.settings.opacity = value;
            this.plugin.rootElement.style.setProperty(
              "--ghost-fade-focus-opacity",
              `${value}`
            );
            await this.plugin.saveSettings();
          })
      )
      .settingEl.createDiv("", (el: HTMLDivElement) => {
        opacityLevel = el;
        el.style.minWidth = "2.0em";
        el.style.textAlign = "right";
        el.innerText = " " + this.plugin.settings.opacity.toString();
      });
  }
}
