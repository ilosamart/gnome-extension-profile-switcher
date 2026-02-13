import Clutter from "gi://Clutter";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import St from "gi://St";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as ModalDialog from "resource:///org/gnome/shell/ui/modalDialog.js";

export default class ProfileSwitcherExtension extends Extension {
  CONFIG_PATH = GLib.build_filenamev([
    GLib.get_user_config_dir(),
    "gnome-profiles",
  ]);
  WALLPAPERS_PATH = GLib.build_filenamev([
    this.CONFIG_PATH,
    "saved_wallpapers",
  ]);
  PROFILES_FILE = GLib.build_filenamev([this.CONFIG_PATH, "config.json"]);
  PROFILES = {
    work: {
      label: "Trabalho",
      icon: "face-angry-symbolic",
    },
    personal: {
      label: "Pessoal",
      icon: "face-cool-symbolic",
    },
  };

  enable() {
    this._config = this._loadFromDisk();
    this._isDirty = false;
    this._handlerIds = [];

    // Criar os diretórios necessários
    if (!GLib.file_test(this.WALLPAPERS_PATH, GLib.FileTest.EXISTS)) {
      GLib.mkdir_with_parents(this.WALLPAPERS_PATH, 0o755);
    }

    this._indicator = new PanelMenu.Button(0.0, "ProfileSwitcher", false);
    this._icon = new St.Icon({
      gicon: Gio.Icon.new_for_string("face-tired-symbolic"),
      style_class: "system-status-icon",
    });
    this._indicator.add_child(this._icon);

    this._buildMenu();
    Main.panel.addToStatusArea("profile-switcher", this._indicator);

    this._setupWatcher();
    this._loadProfile(this._config.currentProfile);
  }

  _setupWatcher() {
    const shellSettings = new Gio.Settings({ schema_id: "org.gnome.shell" });
    const desktopBackgroundSettings = new Gio.Settings({
      schema_id: "org.gnome.desktop.background",
    });
    const onChange = () => {
      console.log("Configurações alteradas, marcando como sujo.");
      this._setDirty(true);
    };
    // Guardamos o ID da conexão para desconectar no disable()

    this._handlerIds = [
      ...this._handlerIds,
      {
        settings: desktopBackgroundSettings,
        id: desktopBackgroundSettings.connect("changed::picture-uri", onChange),
      },
      {
        settings: desktopBackgroundSettings,
        id: desktopBackgroundSettings.connect(
          "changed::picture-uri-dark",
          onChange,
        ),
      },
      {
        settings: shellSettings,
        id: shellSettings.connect("changed::favorite-apps", onChange),
      },
    ];
  }

  _loadFromDisk() {
    let defaultData = {
      profiles: {
        work: null,
        personal: null,
      },
      currentProfile: "personal",
    };
    if (!GLib.file_test(this.PROFILES_FILE, GLib.FileTest.EXISTS)) {
      return defaultData;
    }
    try {
      const [success, contents] = GLib.file_get_contents(this.PROFILES_FILE);
      if (success) return JSON.parse(new TextDecoder().decode(contents));
    } catch (e) {
      console.error(`Erro ao ler disco: ${e.message}`);
    }
    return defaultData;
  }

  _saveWallpaperPhysical(profileName) {
    let settings = new Gio.Settings({
      schema_id: "org.gnome.desktop.background",
    });
    let currentUri =
      settings.get_string("picture-uri-dark") ||
      settings.get_string("picture-uri");

    if (!currentUri || currentUri === "") return "";

    let sourcePath = currentUri.replace("file://", "");
    let destPath = GLib.build_filenamev([
      this.WALLPAPERS_PATH,
      `${profileName}.jpg`,
    ]);

    try {
      let sourceFile = Gio.File.new_for_path(sourcePath);
      let destFile = Gio.File.new_for_path(destPath);

      sourceFile.copy(destFile, Gio.FileCopyFlags.OVERWRITE, null, null);

      console.log(`Wallpaper salvo em: ${destPath}`);
      return `file://${destPath}`;
    } catch (e) {
      console.log(`Erro ao copiar wallpaper: ${e.message}`);
      return currentUri;
    }
  }
  _applyWallpaper(savedUri) {
    if (!savedUri) return;

    let bgSettings = new Gio.Settings({
      schema_id: "org.gnome.desktop.background",
    });

    // Força o GNOME a atualizar a imagem
    bgSettings.set_string("picture-uri", savedUri);
    bgSettings.set_string("picture-uri-dark", savedUri);
  }

  _saveToDisk() {
    try {
      const contents = JSON.stringify(this._config, null, 2);
      GLib.file_set_contents(this.PROFILES_FILE, contents);
      this._isDirty = false;
    } catch (e) {
      console.error(`Erro ao salvar: ${e.message}`);
    }
  }

  _setDirty(dirty) {
    this._isDirty = dirty;
    if (this._statusItem) {
      this._statusItem.label.text = dirty
        ? `⚠️ Pendente de Salvar`
        : `✅ Perfil: ${this._config.currentProfile || "Ativo"}`;
    }
  }

  _saveCurrentStateTo(profileName) {
    try {
      // 1. Captura os Apps Favoritos (Dash)
      let appSettings = new Gio.Settings({ schema_id: "org.gnome.shell" });
      let favoriteApps = appSettings.get_strv("favorite-apps");

      // 2. Captura e Copia o Wallpaper
      let wallpaperUri = this._saveWallpaperPhysical(profileName);

      // 3. Prepara o objeto do Perfil
      this._config.profiles[profileName] = {
        favorites: favoriteApps,
        wallpaper: wallpaperUri,
        updated: new Date().toISOString(),
      };

      // 4. Grava no disco (JSON)
      let contents = JSON.stringify(this._config, null, 2);
      let success = GLib.file_set_contents(this.PROFILES_FILE, contents);

      if (success) {
        this._setDirty(false); // Resetamos o estado de "pendente"
        Main.notify(
          "Profile Switcher",
          `Perfil "${profileName}" salvo com sucesso!`,
        );
        console.log(
          `Perfil ${profileName} atualizado com ${favoriteApps.length} apps.`,
        );
      }
    } catch (e) {
      console.error(`Erro ao salvar perfil: ${e.message}`);
      Main.notify("Profile Switcher", "Erro ao salvar o estado atual.");
    }
  }

  _loadProfile(profileName) {
    const profile = this._config.profiles[profileName];

    if (!profile) {
      Main.notify(
        "Profile Switcher",
        `Perfil "${profileName}" não encontrado.`,
      );
      return;
    }

    this._icon.gicon = Gio.Icon.new_for_string(this.PROFILES[profileName].icon);
    Object.entries(this._profileButtons).forEach(([name, button]) => {
      button.label.text = name === profileName ? `✔ ${name}` : name;
    });

    try {
      // 1. Aplicar Apps Favoritos
      if (profile.favorites && Array.isArray(profile.favorites)) {
        let appSettings = new Gio.Settings({ schema_id: "org.gnome.shell" });
        appSettings.set_strv("favorite-apps", profile.favorites);
      }

      // 2. Aplicar Wallpaper Físico
      if (profile.wallpaper) {
        this._applyWallpaper(profile.wallpaper);
      }

      this._config.currentProfile = profileName;

      Main.notify("Profile Switcher", `Perfil "${profileName}" aplicado!`);
      console.log(`Perfil ${profileName} carregado com sucesso.`);
      this._saveCurrentStateTo(profileName);
    } catch (e) {
      console.error(`Erro ao carregar perfil: ${e.message}`);
      Main.notify("Profile Switcher", "Erro ao aplicar o perfil selecionado.");
    }
  }

  _buildMenu() {
    this._indicator.menu.removeAll();
    this._profileButtons = {};

    Object.keys(this._config.profiles).forEach((name) => {
      let label = this.PROFILES[name].label || name;
      let section = new PopupMenu.PopupSubMenuMenuItem(label);
      this._profileButtons[name] = section;

      let loadItem = new PopupMenu.PopupMenuItem("📂 Carregar");
      // loadItem.connect("activate", () => this._loadProfile(name));
      loadItem.connect("activate", () => this._confirmAndLoad(name));

      let saveItem = new PopupMenu.PopupMenuItem("💾 Salvar");
      saveItem.connect("activate", () => this._saveCurrentStateTo(name));

      section.menu.addMenuItem(loadItem);
      section.menu.addMenuItem(saveItem);
      this._indicator.menu.addMenuItem(section);
    });

    this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this._statusItem = new PopupMenu.PopupMenuItem("Status: Limpo", {
      reactive: false,
    });
    this._indicator.menu.addMenuItem(this._statusItem);
  }

  disable() {
    // 1. Desconectar todos os sinais (Watcher) para evitar memory leaks
    this._handlerIds.forEach((obj) => obj.settings.disconnect(obj.id));
    this._handlerIds = [];

    // 2. Remover o ícone do painel
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }

    // 3. Limpar referências
    this._statusItem = null;
    this._config = null;
  }

  _confirmAndLoad(name) {
    console.log(`Tentando carregar perfil: ${name}. Dirty: ${this._isDirty}`);

    if (!this._isDirty) {
      this._loadProfile(name);
      return;
    }

    const dialog = new ModalDialog.ModalDialog();

    // Criando uma caixa de layout para o texto
    let content = new St.BoxLayout({
      vertical: true,
      style_class: "confirm-dialog-content",
      style: "padding: 24px; spacing: 12px;",
    });

    content.add_child(
      new St.Label({
        text: "Alterações detectadas!",
        style: "font-weight: bold; font-size: 1.2em;",
      }),
    );

    content.add_child(
      new St.Label({
        text: `Você removeu ou adicionou ícones.\nDeseja salvar antes de mudar para o perfil "${name}"?`,
      }),
    );

    dialog.contentLayout.add_child(content);

    dialog.setButtons([
      {
        label: "Cancelar",
        key: Clutter.KEY_Escape,
        action: () => dialog.close(),
      },
      {
        label: "Descartar",
        action: () => {
          this._loadProfile(name);
          dialog.close();
        },
      },
      {
        label: "Salvar e Trocar",
        default: true,
        action: () => {
          this._saveCurrentStateTo(this._config.currentProfile || "Trabalho"); // Salva no atual antes de mudar
          this._loadProfile(name);
          dialog.close();
        },
      },
    ]);

    dialog.open();
  }
}
