# MasterSound Virtual Showroom - MVP Deployment Guide

## Como hospedar este MVP no GitHub Pages

Este projeto é estático (HTML/JS/CSS), perfeito para hospedagem gratuita no GitHub Pages.

### Pré-requisitos
1. Ter o [Git instalado](https://git-scm.com/downloads).
2. Ter uma conta no [GitHub](https://github.com/).

### Passo a Passo via Terminal

1. **Inicialize o Repositório**
   Abra o terminal na pasta `showroomvirtual` (a raiz do projeto) e rode:
   ```bash
   git init
   git add .
   git commit -m "Initial MVP commit: Spatial Audio + 5.1 Subwoofer Setup"
   ```

2. **Crie o Repositório no GitHub**
   - Vá em [github.com/new](https://github.com/new).
   - Nomeie como `showroom-virtual`.
   - Clique em "Create repository".

3. **Conecte e Envie**
   Copie os comandos que o GitHub vai mostrar (na parte "...or push an existing repository from the command line") e cole no seu terminal. Geralmente são:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/showroom-virtual.git
   git branch -M main
   git push -u origin main
   ```

4. **Ative o GitHub Pages**
   - No site do GitHub, vá em **Settings** (Aba superior do repositório).
   - No menu lateral esquerdo, clique em **Pages**.
   - Em **Build and deployment > Source**, escolha `Deploy from a branch`.
   - Em **Branch**, selecione `main` e a pasta `/ (root)`. Clique em **Save**.

### Como acessar
O GitHub vai te dar um link parecido com:
`https://seu-usuario.github.io/showroom-virtual/`

**Importante:** Como seu código está dentro de uma subpasta chamada `showroom-mvp`, o link final para testar será:

👉 `https://seu-usuario.github.io/showroom-virtual/showroom-mvp/`

## Dica de Áudio (Autoplay Policy)
Navegadores modernos (Chrome/Edge) bloqueiam áudio automático. Por isso, este MVP foi desenhado com a tela "Clique para Entrar". Isso garante o gesto de interação necessário para desbloquear o `AudioContext` do navegador. Não remova essa tela de início.
