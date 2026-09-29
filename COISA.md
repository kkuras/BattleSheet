# ⚡ BattleSheet

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow.svg)]()
[![Licença](https://img.shields.io/badge/Licença-Todos%20os%20Direitos%20Reservados-red.svg)]()
[![Plataforma](https://img.shields.io/badge/Plataforma-Cobblemon%20VGC-blue.svg)]()

> Plataforma de gestão de torneios de Pokémon VGC para Cobblemon, com Team Builder livre, validação por Rulesets customizados em JSON e Open Team Sheets públicas.

---

## 📋 Sobre o Projeto

O **BattleSheet** é um web app criado para organizar e gerir campeonatos de Pokémon VGC customizados jogados no mod **Cobblemon**. 

O sistema separa a criação livre de equipas da inscrição oficial em torneios. Os jogadores têm total liberdade para montar e testar equipas no **Team Builder**, enquanto o sistema aplica validações automáticas baseadas em **Rulesets customizados** de 3 camadas em JSON no momento do registo do torneio.

---

## ✨ Funcionalidades Principais

- 🧰 **Team Builder Livre:** Suporte a criação de múltiplas equipas sem restrições prévias, com suporte a *Import/Export* no formato padrão do Pokémon Showdown.
- 📜 **Open Team Sheet Pública:** Exibição pública e limpa das equipas registradas nos torneios (mostrando apenas Pokémon, Itens e Moves, mantendo segredo sobre EVs, IVs, Natures e Abilities).
- ⚙️ **Sistema de Rulesets em 3 Camadas:** Validação dinâmica via JSON de categorias (Restricted, Sub-Legendaries, Paradox, Starters) e mecânicas/gimmicks (Mega Evoluções, Z-Moves, Primal, Terastallization).
- 🔒 **Controlo de Alterações e Versionamento:** Alterações feitas em equipas já inscritas exigem aprovação do Admin antes de entrarem na Open Team Sheet oficial.
- 🏆 **Mata-Mata e Brackets:** Gestão visual de chaveamento de torneios (Single Elimination) e registo de partidas.
- 🛡️ **Suporte a Assets Customizados:** Tratamento de itens/sprites exclusivos do Cobblemon com ícones *placeholder* automáticos para links com erro 404.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend & Banco de Dados:** Supabase (PostgreSQL & Auth)
- **Hospedagem & Deploy:** Vercel
- **Dados:** PokéAPI + Arquivos JSON locais / Banco de Dados Supabase

---

## 📄 Licença

© **BattleSheet**. Todos os direitos reservados.

Nenhuma parte deste projeto (código-fonte, design, recursos visuais ou documentação) pode ser copiada, modificada, distribuída ou utilizada sem autorização prévia por escrito do detentor dos direitos autorais.
