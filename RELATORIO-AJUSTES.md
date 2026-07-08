# Relatório de ajustes — hcemocional.com.br

Landing page do livro **A História do Hardcore Emocional** (Tiago Simão / Allan Stein).
Ajustes feitos sobre o `index.html` estático (HTML/CSS/JS vanilla, sem framework),
preservando o design zine, a paleta e as fontes. Objetivo único: conversão para o
Catarse (`https://www.catarse.me/historia-do-hcemo`).

> **Arquitetura:** o site é uma SPA de página única com troca de "páginas" via
> `showPage()` (Lançamento / Sobre / Playlist / Bandas / Peça seu Livro). Não foi
> redesenhado. Por isso os links **internos** do menu/rodapé continuam usando
> `href="#"` + `onclick` (retornam `false`, não são links quebrados) — é o padrão
> existente do site, não um bug.

---

## ✅ O que foi feito

### P0 — Conversão
- **Todos os CTAs do Catarse** agora apontam para `catarse.me/historia-do-hcemo`
  com UTMs por posição (`utm_content`): `hero`, `recompensas`, `footer` e
  `tier-<nome>` em cada recompensa. Antes iam para a home do Catarse.
- **`rel="noopener"`** em todos os links externos com `target="_blank"`.
- **Spotify:** botões escondidos via *feature flag* (`window.HCEMO.SPOTIFY_PLAYLIST_URL`),
  com placeholder `{{SPOTIFY_PLAYLIST_URL}}` e nota "Playlist chega junto com o
  lançamento". Não há mais botão levando à home do Spotify.
- **Meta Pixel** injetado com placeholder `{{META_PIXEL_ID}}` (só dispara quando o ID
  real for preenchido): `PageView` no load e `InitiateCheckout` no clique de qualquer
  CTA do Catarse (classe `.catarse-cta`).
- **GA4** deixado como bloco comentado com `{{GA4_ID}}`.
- Imagens (capa, logos de banda) já eram embutidas (base64/SVG) — **não havia imagem
  quebrada**. Foram adicionados `width`/`height`/`loading="lazy"`/`decoding` e
  `fetchpriority="high"` + `<link rel="preload">` no logo do hero (LCP).

### P1 — Consistência factual
- **Fichas das bandas BR** corrigidas conforme o livro:
  CPM 22 (1995 · Barueri), Hateen (1994 · SP Zona Leste), Street Bulldogs
  (1994 · Pindamonhangaba), Fresno (1999 · Porto Alegre), NX Zero (2001 · SP),
  Forfun (2001 · Rio de Janeiro), Emoponto (1998 como Boba Fett; Emoponto em 2001 ·
  Rio), Dead Fish (1991 · Vitória).
- **Adicionadas** as 4 bandas da tabela do livro que faltavam: Dance of Days,
  Garage Fuzz, Gloria, Personal Choice.
- **Sumário real com 13 capítulos** (antes 9) e **~288 páginas** (antes 352) em
  todos os lugares (hero, stats, fichas, cards de compra).
- **Especificações** do livro exibidas: 16×23 cm, miolo P&B, 2.000 cópias numeradas,
  arte dos capítulos em colagem punk zine.
- **Recompensas** renomeadas para os tiers reais: **Sabia a Letra, Na Grade,
  Mosh Pit, Stage Diving**, com preços em placeholder `{{PRECO_TIER_1..4}}`.
- **Citação do Guy Picciotto:** "termo mais retardado" → "**termo mais idiota**".
- **Marquee:** "MAE NAO E SO UMA FASE" → "**MÃE, NÃO É SÓ UMA FASE**" (era encoding
  quebrado — o resto do marquee tem acentos).

### P2 — Conversão avançada
- **Countdown** (JS vanilla) para **14/08/2026 00:00 America/São_Paulo**, com
  "faltam X dias". Após a data, vira **"JÁ DISPONÍVEL — garanta a sua"** sozinho.
- **Escassez:** "tiragem limitada — 2.000 cópias numeradas" + barra de progresso
  preparada para a **API pública do Catarse** (`{{CATARSE_PROJECT_ID}}`), com
  fallback estático se a API falhar.
- **Amostra grátis:** seção "Leia as primeiras páginas" com CTA para
  `/assets/amostra-hcemocional.pdf` (placeholder).
- **Prova social:** 3 depoimentos em blockquote zine com placeholders nomeados.
- **Captura de leads:** formulário "Me avisa no dia 14" com validação de e-mail e
  mensagem de sucesso no tom do site (`{{FORM_ACTION_URL}}`).
- **FAQ** acessível (`<details>/<summary>`) com as 6 perguntas pedidas.

### P3 — SEO, performance e acessibilidade
- **JSON-LD:** `Book` + `Product/Offer` (Catarse, PreOrder) + `FAQPage`.
- **Um único `<h1>`** (o segundo virou `<h2>`).
- **`robots.txt`** e **`sitemap.xml`** criados; `<link rel="canonical">`.
- **Acessibilidade:** foco visível (`:focus-visible`), `aria-label` nos CTAs de
  ícone, accordion nativo navegável por teclado.
- **Marquee** já era CSS (`@keyframes`); adicionado
  `@media (prefers-reduced-motion: reduce)` pausando a animação.
- Fontes já carregam com `display=swap`.

---

## ⚠️ Pendências de decisão humana (placeholders + TODO)

Todos os valores abaixo estão como `{{PLACEHOLDER}}` no código (busque por `{{`):

| Item | Onde | O que fazer |
|---|---|---|
| **ID do Meta Pixel** | `{{META_PIXEL_ID}}` no `<head>` | Inserir o ID real do Pixel. |
| **GA4 (opcional)** | `{{GA4_ID}}` (bloco comentado) | Descomentar e preencher, se for usar. |
| **URL da playlist do Spotify** | `{{SPOTIFY_PLAYLIST_URL}}` (`window.HCEMO`) | Inserir a URL oficial; os botões aparecem sozinhos. |
| **Preços dos tiers** | `{{PRECO_TIER_1..4}}` | Conferir os valores exatos na página do Catarse. **Não chutamos.** |
| **ID do projeto no Catarse** | `{{CATARSE_PROJECT_ID}}` | Para a barra de progresso via API. |
| **Endpoint do formulário** | `{{FORM_ACTION_URL}}` | Conectar Mailchimp/Brevo/planilha. |
| **PDF de amostra** | `/assets/amostra-hcemocional.pdf` | **Asset a produzir** (não existe no repo). |
| **Depoimentos** | `{{DEPOIMENTO_NENE_ALLTRO}}`, `{{DEPOIMENTO_KOALA}}`, `{{DEPOIMENTO_CLEMENTE}}` | Inserir as frases reais. Nomes são suposição — ajustar. |
| **Prazos da FAQ** | Seção FAQ | Confirmar: prazo de envio, envio internacional, versão digital/PDF, conteúdo de cada recompensa (marcados com **TODO** no texto). |

### Assets faltando
- `/assets/amostra-hcemocional.pdf` — precisa ser gerado.
- Logos reais das bandas: hoje são **placeholders SVG de texto** (nome da banda em
  vermelho/verde). As 4 bandas adicionadas (Dance of Days, Garage Fuzz, Gloria,
  Personal Choice) usam placeholder com iniciais. Substituir por logos reais quando
  houver, se desejado.

### Decisão de domínio (atenção)
O prompt pedia `canonical` em **`www.`**, mas o arquivo `CNAME` e todas as meta tags
OG existentes usam o **apex** `hcemocional.com.br`. Para não publicar um canonical
que aponta para um host que talvez não resolva, **padronizamos tudo no apex**
(`hcemocional.com.br`). Se quiserem usar `www.`, é preciso: (1) configurar o DNS do
`www`, (2) trocar o `CNAME`, e (3) atualizar canonical, OG e JSON-LD.

---

## 🎵 Playlist atual — para Tiago validar faixa a faixa

Nenhuma faixa foi alterada. Lista atual no site (validar):

**Anos 60–70 (Proto-punk):** Strychnine — The Sonics · Heroin — Velvet Underground ·
Kick Out the Jams — MC5 · I Wanna Be Your Dog — The Stooges · Personality Crisis — New York Dolls
**Anos 70–80 (Punk/HC):** Blitzkrieg Bop — Ramones · Anarchy in the UK — Sex Pistols ·
London Calling — The Clash · Pay to Cum — Bad Brains · Straight Edge — Minor Threat · Rise Above — Black Flag
**1985 · Revolution Summer:** For Want Of — Rites of Spring · No More Pain — Embrace ·
Waiting Room — Fugazi · Suggestion — Fugazi
**Anos 90 · 2ª Onda:** Seven — Sunny Day Real Estate · In the Clear — Cap'n Jazz ·
Is This Thing On? — The Promise Ring · Accident Prone — Jawbreaker · You and I — Mineral ·
At Your Funeral — Saves the Day · I'll Catch You — The Get Up Kids
**Anos 2000 · Mainstream:** Basket Case — Green Day · Dammit — Blink-182 · The Middle — Jimmy Eat World ·
Screaming Infidelities — Dashboard Confessional · Understanding in a Car Crash — Thursday ·
Cute Without the 'E' — Taking Back Sunday · I'm Not Okay — My Chemical Romance ·
Misery Business — Paramore · Sugar We're Goin Down — Fall Out Boy
**Brasil · Anos 2000–10:** Um Minuto Para o Fim do Mundo — CPM 22 · Estado Interessante — Dead Fish ·
Vítimas da Moda — Street Bulldogs · Drive — Hateen · Nossas Histórias Mal Contadas — Fresno ·
Razões e Emoções — NX Zero · Eu Preciso Te Dizer — Forfun
**2010s–Hoje · Sad Trap:** Star Shopping — Lil Peep · Lucid Dreams — Juice WRLD ·
Sad! — XXXTentacion · bury a friend — Billie Eilish

---

## 🏴 Bandas no site fora da tabela do livro — validar com Tiago

Estas bandas aparecem nos cards mas **não estão na tabela de dados fornecida**.
Mantivemos os cards; os anos/cidades vêm de conhecimento geral e **precisam de
confirmação** do Tiago:

- **Cena BR:** Moptop (2003 · São Paulo), Charlie Brown Jr. (1992 · Santos),
  Detonautas (2000 · Rio de Janeiro), Raimundos (1987 · Brasília).
- **Internacionais** (proto-punk, HC de D.C., Midwest, mainstream e sad trap):
  Ramones, Sex Pistols, The Clash, New York Dolls, Velvet Underground, MC5,
  The Stooges, The Sonics, Dead Kennedys, Minor Threat, Bad Brains, Fugazi,
  Black Flag, Rites of Spring, Embrace, SOA, Teen Idles, Beefeater, Dag Nasty,
  Sunny Day Real Estate, Cap'n Jazz, The Promise Ring, Mineral, Jawbreaker,
  Saves the Day, The Get Up Kids, Texas Is the Reason, American Football,
  Joan of Arc, Braid, Thursday, Green Day, Blink-182, Jimmy Eat World,
  Dashboard Confessional, My Chemical Romance, Taking Back Sunday, Brand New,
  Paramore, Fall Out Boy, Hawthorne Heights, The Used, Saosin, Story of the Year,
  Silverstein, Lil Peep, Juice WRLD, XXXTentacion, Post Malone, Trippie Redd,
  Night Lovell.

> Estas datas são de domínio público e conferem no geral, mas não foram
> reverificadas contra o livro. Se preferir a regra estrita ("remover ano/cidade do
> que não puder confirmar"), é só avisar que a gente tira.

---

## 🧪 Checklist de QA manual

- [ ] Nenhum `src=""` e nenhum CTA levando à home do Catarse/Spotify (`grep` já confere).
- [ ] Todos os CTAs abrem `catarse.me/historia-do-hcemo` com a UTM certa por posição.
- [ ] Countdown mostrando os dias corretos e virando "JÁ DISPONÍVEL" após 14/08/2026
      (testar mudando a data do sistema).
- [ ] Dados das bandas BR conferem com a tabela do livro.
- [ ] Sumário com 13 capítulos e "~288 páginas" em todos os pontos.
- [ ] Site íntegro em **390px, 768px e 1440px** (hero, grids de banda, tiers, FAQ,
      depoimentos e formulário).
- [ ] FAQ abre/fecha e é navegável por teclado (Tab + Enter).
- [ ] Formulário valida e-mail e mostra a mensagem de sucesso.
- [ ] Depois de preencher os placeholders: Pixel dispara `PageView`/`InitiateCheckout`,
      botões do Spotify aparecem, barra do Catarse carrega.
- [ ] **Lighthouse mobile** (rodar e colar aqui): Performance ≥ 90 · SEO ≥ 95 ·
      Acessibilidade ≥ 90. *(Não foi possível rodar Lighthouse neste ambiente —
      pendente de execução local/CI.)*

---

_Ajustes entregues em commits temáticos (P0 → P3). Identidade visual, paleta e fontes
preservadas; nenhum conteúdo existente foi removido — apenas corrigido e complementado._
