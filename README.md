Extensão do Gnome que te permite alternar rapidamente entre perfis de uso de "Trabalho" e "Pessoal" no seu desktop. Ela gerencia automaticamente teus aplicativos favoritos (fixados no Dash/Dock) e o papel de parede.

### Funcionalidades
*   **Troca de Perfis:** Alterna entre dois perfis pré-definidos: **Trabalho** (Trabalho) e **Pessoal** (Pessoal).
*   **Gerenciamento de Apps:** Salva e restaura a lista de aplicativos favoritos/fixados no painel lateral do Gnome.
*   **Gerenciamento de Papel de Parede:** Salva uma cópia física do wallpaper atual para cada perfil, garantindo que ele seja restaurado corretamente ao trocar de perfil.
*   **Detecção de Mudanças:** Monitora se tu adicionaste/removeste apps ou trocaste o papel de parede, avisando se há alterações pendentes para salvar no perfil ativo.

---

### Instalação

1.  **Localiza a pasta da extensão:** A pasta deve se chamar `profile-switcher@tramasoli.com`.
2.  **Move para o diretório de extensões do Gnome:**
    ```bash
    mkdir -p ~/.local/share/gnome-shell/extensions/
    cp -r profile-switcher@tramasoli.com ~/.local/share/gnome-shell/extensions/
    ```
3.  **Reinicia o Gnome Shell:**
    *   No X11: Pressione `Alt + F2`, digite `r` e aperte `Enter`.
    *   No Wayland: Faça Logout e Login novamente.
4.  **Habilita a extensão:**
    Use o aplicativo "Ajustes" (Gnome Tweaks) ou "Extensões" para ativar o **Profile Switcher**.

---

### Uso


https://github.com/user-attachments/assets/57bf2817-a119-458d-807d-5a6e241ffda6


1.  **Acessando o Menu:** Um ícone aparecerá no painel superior do Gnome.
2.  **Salvando um Perfil:**
    *   Configura teu desktop como desejar (fixe seus apps e escolha o wallpaper).
    *   Clica no ícone da extensão, vai no perfil desejado (ex: "Trabalho") e seleciona **💾 Salvar**.
3.  **Carregando um Perfil:**
    *   Clica no perfil desejado e seleciona **📂 Carregar**.
4.  **Status e Avisos:**
    *   Se tu fizeres alterações e não salvares, o menu mostrará o status `⚠️ Pendente de Salvar`.
    *   Ao tentar carregar um perfil com alterações não salvas, a extensão abrirá um diálogo perguntando se tu desejas salvar as alterações atuais ou descartá-las.
  
#### Pequena demonstração



### Arquivos de Configuração
As configurações e papéis de parede ficam salvos em:
*   `~/.config/gnome-profiles/config.json`
*   `~/.config/gnome-profiles/saved_wallpapers/`
