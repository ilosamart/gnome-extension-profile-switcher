Esta extensão do Gnome, chamada **Profile Switcher**, permite que você alterne rapidamente entre perfis de uso (como "Trabalho" e "Pessoal") no seu desktop. Ela gerencia automaticamente seus aplicativos favoritos (fixados no Dash/Dock) e o papel de parede.

### O que ela faz
*   **Troca de Perfis:** Alterna entre dois perfis pré-definidos: **Trabalho** (Trabalho) e **Pessoal** (Pessoal).
*   **Gerenciamento de Apps:** Salva e restaura a lista de aplicativos favoritos/fixados no painel lateral do Gnome.
*   **Gerenciamento de Papel de Parede:** Salva uma cópia física do wallpaper atual para cada perfil, garantindo que ele seja restaurado corretamente ao trocar de perfil.
*   **Detecção de Mudanças:** Monitora se você adicionou/removeu apps ou trocou o papel de parede, avisando se há alterações pendentes para salvar no perfil ativo.

---

### Instruções de Instalação

1.  **Localize a pasta da extensão:** A pasta deve se chamar `profile-switcher@tramasoli.com`.
2.  **Mova para o diretório de extensões do Gnome:**
    ```bash
    mkdir -p ~/.local/share/gnome-shell/extensions/
    cp -r profile-switcher@tramasoli.com ~/.local/share/gnome-shell/extensions/
    ```
3.  **Reinicie o Gnome Shell:**
    *   No X11: Pressione `Alt + F2`, digite `r` e aperte `Enter`.
    *   No Wayland: Faça Logout e Login novamente.
4.  **Habilite a extensão:**
    Use o aplicativo "Ajustes" (Gnome Tweaks) ou "Extensões" para ativar o **Profile Switcher**.

---

### Como Usar

1.  **Acessando o Menu:** Um ícone aparecerá no painel superior do Gnome.
2.  **Salvando um Perfil:**
    *   Configure seu desktop como desejar (fixe seus apps e escolha o wallpaper).
    *   Clique no ícone da extensão, vá no perfil desejado (ex: "Trabalho") e selecione **💾 Salvar**.
3.  **Carregando um Perfil:**
    *   Clique no perfil desejado e selecione **📂 Carregar**.
4.  **Status e Avisos:**
    *   Se você fizer alterações e não salvar, o menu mostrará o status `⚠️ Pendente de Salvar`.
    *   Ao tentar carregar um perfil com alterações não salvas, a extensão abrirá um diálogo perguntando se você deseja salvar as alterações atuais ou descartá-las.

### Arquivos de Configuração
As configurações e papéis de parede ficam salvos em:
*   `~/.config/gnome-profiles/config.json`
*   `~/.config/gnome-profiles/saved_wallpapers/`
