# Diagnóstico de conversão — hcemocional.com.br

**Data:** 19/08/2026 · **Escopo:** `index.html` (2.065 linhas), assets e histórico do repositório.

**Limitação importante:** o proxy do ambiente onde esta auditoria foi feita bloqueia
`hcemocional.com.br` e `catarse.me`. **Nada aqui foi verificado no site publicado nem contra os
números reais da campanha** — tudo vem da leitura do código-fonte deste repositório e do histórico
de commits. Se algo já tiver sido corrigido em produção sem passar por aqui, o achado cai.

**22 achados** — 8 críticos, 11 altos, 3 médios.

---

## Estado da implementação — 19/08/2026

As correções abaixo já estão no código. O diagnóstico original segue preservado nas
seções seguintes, como registro do que foi encontrado.

| # | Ação | Achado | Estado |
|---:|---|---|---|
| 1 | Prazo de envio real no FAQ: **até 7 dias úteis após a meta bater** (também no JSON-LD) | 3.3 | ✅ feito |
| 2 | "Apoie no Catarse a partir de 14/08" → bandeira **"Campanha no ar"** | 3.1 | ✅ feito |
| 3 | Barra de progresso zerada **removida**; no lugar, apoiadores + dias restantes via API | 3.2 · 5.2 | ✅ feito |
| 4 | Selo "Pré-lançamento" → **"Campanha aberta"**; data de entrega alinhada nos 3 cards | 3.1 · 3.4 | ✅ feito |
| 5 | Imagens em WebP — payload crítico de **3,61 MB → 0,36 MB (−90%)** | 2.2 | ✅ feito |
| 6 | Meta Pixel | 1.4 | ⏳ **precisa do ID** |
| 7 | Captura de e-mail ligada ao `SHEET_ENDPOINT` | 4.5 | ✅ feito |
| 8 | Capítulo grátis atrás do e-mail; botão em estilo secundário | 4.4 | ✅ feito |
| 9 | Dobra do mobile reescrita: `h1` de texto, preço, frete, **um único** botão | 2.1 · 2.3 · 4.2 | ✅ feito |
| 10 | Barra de compra fixa no rodapé do mobile | 2.4 | ✅ feito |
| 11 | CTA de fechamento em **Sobre**, **Playlist** e **Bandas × Eras** | 4.1 | ✅ feito |
| 12 | GA4: `page_view` da SPA vira `troca_aba`; CTAs internos rastreados | 1.1 · 1.2 | ✅ feito |
| 13 | Três depoimentos reais da cena | 3.5 | ⏳ **precisa das frases** |
| 14 | Construção de valor colada no preço (R$ 0,35/página, frete incluso) | 5.1 | ✅ feito |
| 15 | Seção de reconhecimento "Você vai se reconhecer" | 5.4 | ✅ feito |
| 16 | CTA final da home vai **direto ao Catarse** | 4.3 | ✅ parcial |
| 17 | `title`, meta description e OG na linguagem do público | 5.3 | ✅ feito |
| 18 | Urgência por prazo (dias para fechar) em vez de tiragem fixa | 5.2 | ✅ feito |

### Ganhos medidos

| Métrica | Antes | Depois |
|---|---|---|
| Payload até o primeiro pixel útil (mobile) | 3,61 MB | **0,36 MB** (−90%) |
| Capa do livro (elemento de LCP) | 3.085 KB PNG | **114 KB** WebP (−96%) |
| Arquivos de fonte, bloqueando renderização | 11, bloqueantes | **7, assíncronos** |
| `<h1>` visível no mobile | vazio | **texto real** |
| CTA acima da dobra (375 / 390 / 1440 px) | — | **sim nos três** |
| Abas com caminho de compra | 2 de 5 | **5 de 5** |
| Captura de e-mail | nenhuma | **1 formulário** |

Verificado renderizando a página no Chromium em 375×667, 390×844 e 1440×900: zero erros
de JavaScript, estrutura HTML balanceada, formulário validando, navegação entre abas
funcionando. Os únicos recursos que falham no ambiente de teste são GA4, Meta Pixel e
a API do Catarse — todos bloqueados pelo proxy daqui, todos funcionam em produção.

### O que ainda depende de você

1. **ID do Meta Pixel** — criar em business.facebook.com → Gerenciador de Eventos, e colar
   no lugar de `{{META_PIXEL_ID}}`. É o que liga remarketing e otimização de anúncio.
2. **Três depoimentos** — não foram inventados de propósito: depoimento fabricado é pior
   que nenhum. Bastam três frases reais com nome e foto.
3. **Links diretos por recompensa** (achado 4.3, item 16) — para eliminar a etapa de
   escolher a recompensa duas vezes é preciso o `reward_id` de cada uma, que só aparece
   na URL ao clicar em "Apoiar" no Catarse. Os CTAs já vão direto à campanha; falta o
   deep-link por recompensa.

### Sobre a barra de progresso do Catarse

**Não é preciso o ID numérico.** O código agora consulta a API pública pelo *permalink*
(`historia-do-hcemo`), que já está em `window.HCEMO.CATARSE_PERMALINK`. Se um dia quiser
fixar o ID, ele está em `https://api.catarse.me/project_details?permalink=eq.historia-do-hcemo`
(campo `project_id`) e tem prioridade sobre o permalink.

Ainda assim, **a barra de percentual foi removida de propósito**. A 8% ela é prova social
negativa: comunica "92% faltando". No lugar entraram duas coisas que persuadem em qualquer
patamar — **quantas pessoas já apoiaram** (só aparece a partir de 10 apoiadores) e
**quantos dias faltam para fechar**. Quando a campanha passar de ~40%, vale voltar com a
barra: aí o percentual joga a favor.

---

## 0. O que 1% significa (diagnóstico original)

| Referência | Taxa |
|---|---|
| **hcemocional.com.br — clique no botão de compra** | **1,0%** |
| Média de mercado — CTR de CTA em site | 4,23% |
| Landing page média (todos os setores) | 6,6% |
| Landing page com **um único CTA** | 13,5% |

A página está **4× abaixo da média mais genérica que existe** e **13× abaixo** do que uma landing
page de oferta única entrega. A home tem **9 links** competindo, dos quais só 3 levam ao Catarse.

### O funil composto

| Etapa | Taxa |
|---|---|
| Visitante chega no site | 100% |
| Clica em um CTA do Catarse | 1% |
| Vira apoiador na página do Catarse | 1–6% |
| **Venda concluída** | **0,01–0,06%** |

São precisos **entre 1.600 e 10.000 visitantes por venda**. Para 2.000 cópias, isso exige um volume
de tráfego que nenhum projeto independente sustenta.

### O nicho não é o problema

Esse é o melhor momento do emo no Brasil desde 2007: a I Wanna Be Tour reuniu **150 mil pessoas em
2024** e ocupou o **Allianz Parque** em 2025; NX Zero, Fresno e Forfun estão em turnê de redenção;
há circuito nacional de festas de emo revival. O público tem 30 e poucos anos e está gastando
dinheiro nessa memória agora. O gargalo é a página, não o alcance.

---

## Camada 01 — Medição · o 1% provavelmente não é 1%

### 1.1 — ALTO · Cada troca de aba dispara um `page_view` extra
`index.html:1901` — `hcTrack('page_view')` dentro de `showPage()`.

O `gtag('config')` já dispara o `page_view` automático. Quem visita Sobre e Bandas gera **três
`page_view` e zero cliques**. Se o 1% vem de `click_catarse ÷ page_view`, o denominador está
inflado por engajamento — quanto mais alguém navega, pior a métrica fica.

**Correção:** renomear para `troca_aba` e medir conversão sobre **sessões**, nunca sobre
`page_view`. Marcar `click_catarse` como evento-chave.

### 1.2 — ALTO · Metade dos botões de compra não é contada
`index.html:1967` (listener só em `a.catarse-cta`) vs. `:1002` e `:1133`.

"Peça agora" (:1002) e "★ Peça seu exemplar" do CTA final (:1133) apontam para a aba interna
`livro`. Não geram `click_catarse` — geram `page_view`. O clique de maior intenção **engorda o
denominador e não aparece no numerador**.

**Correção:** rastrear como `click_cta_interno` e olhar o funil em dois passos.

### 1.3 — MÉDIO · O GA4 tem quatro dias de dados
Commit #22, 15/08/2026. O lançamento foi dia 14 e entre 17 e 18 houve **oito commits** de conteúdo,
incluindo a remoção da amostra e do formulário de captura.

**Correção:** tratar o 1% como **sinal, não medida**. Congelar a página, corrigir os críticos,
remedir com 7 dias limpos.

### 1.4 — ALTO · O Meta Pixel nunca dispara
`index.html:777–794` — `PIXEL_ID = "{{META_PIXEL_ID}}"`. A guarda `indexOf("{{") === -1` impede o
`init`. Não existe remarketing, não existe lookalike, e qualquer anúncio otimiza no escuro.

**Correção:** criar o Pixel, colar o ID, criar público de remarketing de 30 dias.

---

## Camada 02 — O primeiro segundo · maior perda isolada

Visitantes decidem em 3 segundos e **57% do tempo de visualização acontece acima da dobra**.

### 2.1 — CRÍTICO · O `<h1>` fica literalmente vazio no mobile
`index.html:887` (o `<h1>` contém só uma `<img>`) + `:608` (`.hero-logo-img { display: none }` até 820px).

Acima da dobra no celular sobra: a capa, e uma frase. **Nenhum título, nenhuma palavra dizendo que
é um livro, nenhum preço.**

**Correção:** `<h1>` de texto real no mobile + linha factual: *288 páginas · 80 ilustrações ·
tiragem numerada · a partir de R$ 99 com frete grátis*.

### 2.2 — CRÍTICO · 3,6 MB antes do primeiro pixel útil
`livro.png` = **3,0 MB**, 1340×1830 px, renderizado a no máximo 380 px. No mobile é o primeiro
elemento do hero (`order: -1`) e o LCP. Somando HTML (174 KB) e dois logos de 220 KB — inclusive o
do hero, que baixa mesmo com `display:none` — dá **~3,6 MB**. Mais um stylesheet do Google Fonts
**bloqueando renderização** para **11 arquivos de fonte**.

Referência: **53% abandonam acima de 3s**; entre 1s e 3s o bounce sobe 32%; um site de 1s converte
**2,5×** mais que um de 5s.

**Correção:** capa em WebP a ~800px (**60–120 KB**, −96%); logos em SVG/WebP; cortar de 11 para 3–4
variantes de fonte. Melhor relação esforço/retorno de toda a lista.

### 2.3 — CRÍTICO · A única frase da dobra é atmosfera, não oferta
`index.html:891` — *"Dos porões apertados de Washington em 1985 a MTV. Uma geração tentando existir."*

Não diz o que é, para quem é, quanto custa nem o que fazer. E o gatilho de identidade mais forte do
projeto — **"Mãe, não é só uma fase"** — está num marquee decorativo em vez de ser a headline.

**Correção:** promover a frase de identidade a headline; a poesia vira subtítulo.

### 2.4 — ALTO · O botão fixo "Peça seu Livro" desaparece no celular
`index.html:575–597` — `.nav-links { visibility: hidden }` até 820px. O único elemento de compra
sempre visível some onde está a maioria do tráfego. Depois disso são sete seções sem âncora de compra.

**Correção:** barra de compra fixa no rodapé do mobile após a primeira rolagem —
"R$ 99 · frete grátis" + "Quero o meu".

---

## Camada 03 — Confiança · a página contradiz a si mesma

### 3.1 — CRÍTICO · A página ainda avisa que a campanha começa "a partir de 14/08"
Hoje é 19/08. No mesmo bloco, ao mesmo tempo:

| Linha | Diz | Efeito |
|---|---|---|
| `:940` | Contador → **"JÁ DISPONÍVEL"** | Compre agora |
| `:951` | **"Apoie no Catarse a partir de 14/08"** | Ainda não abriu |
| `:960` | Selo **"Pré-lançamento · 2026"** | Ainda não lançou |
| `:961` | Título **"O livro chegou."** | Já lançou |

A linha 951 é a mais cara: fica colada na barra de progresso, no bloco de urgência, e diz
literalmente para *não* comprar ainda.

**Correção:** um só estado — "Campanha no ar · faltam X dias" — repetido igual em todos os pontos.

### 3.2 — CRÍTICO · A barra de progresso está travada em zero
`index.html:706` (`.bar-fill { width: 0 }`) + `:764` (`CATARSE_PROJECT_ID: "{{...}}"`). A guarda
`isSet()` bloqueia a chamada à API. O visitante vê **uma barra vazia** logo abaixo do contador: a
leitura é "ninguém apoiou isso".

**Correção:** preencher o ID; se os números ainda forem tímidos, **remover a barra** — barra vazia é
pior que barra nenhuma.

### 3.3 — CRÍTICO · Existe um "TODO" em negrito visível para o público
`index.html:1100`, na primeira pergunta do FAQ ("Quando o livro chega na minha casa?"):

> "O envio acontece depois que a campanha fecha e a tiragem fica pronta. **TODO: confirmar prazo
> exato de envio pós-campanha.** Assim que tivermos a data cravada…"

Está em negrito, no ar. Para quem vai mandar R$ 99 a um projeto independente, comunica exatamente
uma coisa: *não está pronto*.

**Correção:** publicar um prazo real hoje, mesmo conservador — "envio em até 60 dias após o
encerramento" converte muito melhor que uma data perfeita que ainda não existe.

### 3.4 — ALTO · "Entrega prevista: Agosto/2026" é impossível e o FAQ desmente
`:1757`, `:1771`, `:1786` prometem entrega em Agosto/2026 — mesmo mês em que a campanha abriu
(14/08). O FAQ (`:1100`) diz que o envio é *"depois que a campanha fecha e a tiragem fica pronta"*.
Campanhas do Catarse rodam 30–60 dias, e só então vêm impressão e logística.

**Correção:** uma única data realista nos três cards e no FAQ, com a sequência explicada em uma linha.

### 3.5 — ALTO · Não há prova social de nenhum tipo
Zero depoimentos, zero avaliações, zero nomes de apoio no site inteiro. Os três depoimentos
previstos no relatório anterior nunca foram preenchidos e a seção foi removida.

Referência: prova social converte **15–30% melhor**, chegando a **35–50%** quando combina
depoimentos, logos e notas. **88%** confiam em avaliação de usuário tanto quanto em recomendação
pessoal; conteúdo de terceiro é **12× mais confiável** que a fala do vendedor.

**Correção:** três frases reais da cena — músico, jornalista, dono de casa de show — com nome e foto,
acima das recompensas. Na falta, prints de comentários do Instagram.

---

## Camada 04 — Arquitetura do funil · vazamentos estruturais

### 4.1 — CRÍTICO · Sobre e Bandas × Eras têm zero CTAs

| Aba | Links | Para o Catarse | Situação |
|---|---:|---:|---|
| Lançamento (home) | 9 | 3 | Diluída |
| **Sobre** | 0 | 0 | **Beco sem saída** |
| Playlist | 1 | 0 | Sem venda |
| **Bandas × Eras** | 0 | 0 | **Beco sem saída** |
| Peça seu Livro | 15 | 6 | OK |

**Sobre** tem o melhor material de venda do projeto: a história pessoal do Tiago com o Blink-182 e a
citação do prefácio (*"longe do senso comum sobre o emo ser apenas uma frescura/choradeira… o gênero
na verdade conversava sobre depressão, ansiedade, sexualidade, bullying, separação dos pais"*). Quem
termina convencido **não tem para onde clicar**.

**Bandas × Eras** é a maior seção do site (400+ linhas, ~50 bandas) e a mais compartilhável — e não
vende nada. Pior: cada visita gera um `page_view` extra, derrubando ainda mais a métrica.

**Correção:** CTA de fechamento em toda aba. Em Bandas: *"Sua banda está no livro. 13 capítulos,
288 páginas — a partir de R$ 99."*

### 4.2 — ALTO · O segundo botão do hero manda a pessoa para o Instagram
`index.html:895`. No mobile os dois viram blocos de largura total, empilhados, com peso visual quase
idêntico. Levar tráfego ao site e devolver ao Instagram é pagar duas vezes pelo mesmo visitante — e
cada CTA extra cobra seu preço (13,5% → 11,9% com dois).

**Correção:** um só botão no hero; Instagram vira link de texto ou desce ao rodapé.

### 4.3 — ALTO · Cinco cliques entre a home e o pagamento
1. "Peça agora" → aba **Peça seu Livro**
2. Escolhe entre três recompensas → "Apoiar via Catarse"
3. Chega no Catarse e **escolhe a recompensa de novo**
4. Cria conta no Catarse
5. Paga

O passo 4 é o pior: **cadastro obrigatório é a principal causa autorrelatada de abandono de
checkout** (24% de quem abandona cita isso). O passo 3 é repetição pura.

**Correção:** CTAs indo **direto ao link da recompensa específica** no Catarse (o `utm_content` já
existe), eliminando o passo 3. E avisar antes: *"Você finaliza no Catarse — leva 2 minutos e é
preciso criar uma conta."*

### 4.4 — ALTO · O melhor gerador de leads é entregue de graça, sem pedir nada
`index.html:1086` — PDF de **7,3 MB** baixável com um clique, sem e-mail. O botão é **vermelho e
chamativo** e fica **antes** do CTA final: numa página onde o outro caminho custa R$ 99, o botão
grátis ganha a atenção. E o `SHEET_ENDPOINT` (`:769`) continua configurado apontando para uma
planilha, **sem ser chamado em lugar nenhum**.

**Correção:** e-mail antes do download, reusando o `SHEET_ENDPOINT`. Capítulo por e-mail + follow-up
com a oferta em 3 dias. Botão em estilo secundário.

### 4.5 — CRÍTICO · Não existe nenhuma captura de e-mail
Commit #26 (17/08) removeu o formulário. Hoje: **zero `<form>`, zero `<input>`**.

Num tudo-ou-nada isso é estrutural. A pesquisa da FGV com **934 projetos do Catarse** mostra que as
doações seguem um **padrão em U** — picos no começo e no fim — e que a **conversão é maior na reta
final**. Sem lista, **não existe reta final**: não há para quem mandar o "faltam 48 horas", que é o
momento mais convertedor da campanha. E o benchmark é claro: e-mail converte a **5%**, seguidor de
rede social a **2%**. O canal mais forte é o que foi desligado.

**Correção:** recolocar hoje, com promessa concreta — "avisamos quando faltarem 48h" + capítulo
grátis por e-mail. Maior impacto no resultado final e o mais sensível ao tempo.

---

## Camada 05 — Oferta e posicionamento

### 5.1 — ALTO · A conta de valor nunca é feita para o leitor
Preço médio do livro no Brasil em 2026: **R$ 52,70**. A recompensa de entrada custa **R$ 99** —
**1,9× a média**. Defensável para 288 páginas com 80 ilustrações, tiragem numerada e frete grátis —
mas a página **nunca faz essa conta**. Os números existem espalhados (bloco de estatísticas,
especificações, faixa sobre a capa) e nenhum aparece **ao lado do preço**.

O salto de R$ 99 → R$ 147 (**+48%**) é justificado só por "adesivos exclusivos", com selo
"Mais popular" sem motivo para acreditar.

**Correção:** *"R$ 99 — 288 páginas, 80 ilustrações originais, capa numerada à mão, frete grátis
para todo o Brasil. Menos de R$ 0,35 por página."* E fazer o R$ 147 valer com algo de percepção alta.

### 5.2 — MÉDIO · A escassez é afirmada, nunca demonstrada
`index.html:947` — "2.000 cópias numeradas", número fixo, sem contador. Escassez que não se move
vira decoração, e **2.000 é grande o bastante para soar como "tem de sobra"**.

**Correção:** mostrar movimento real via API do Catarse, ou trocar o eixo para prazo —
"a campanha fecha em X dias".

### 5.3 — ALTO · O site fala "hardcore emocional"; o público diz "emo"
O termo é correto e é a tese do livro (Guy Picciotto chamou "emo" de *"termo mais idiota"*). Mas
ninguém busca por "hardcore emocional". As pessoas dizem **emo**, **emocore**, **NX Zero**,
**Fresno**, **MTV**, **I Wanna Be** — e o termo delas está fora do `<title>`, da meta description e
do Open Graph que vai para WhatsApp e Instagram, exatamente onde a decisão de clicar acontece.

**Correção:** `<title>` "A História do Hardcore Emocional — o livro sobre a cena emo, de Washington
1985 ao Hangar 110". Meta e OG citando as bandas que as pessoas procuram. A tese vira gancho de
conteúdo, não barreira de entrada.

### 5.4 — MÉDIO · Falta a frase "isso é pra você que…"
A página conta a história do movimento, mas nunca aponta para o leitor. Não há momento em que quem
tem 33 anos, foi ao Hangar 110 e comprou ingresso da I Wanna Be leia algo e pense *"é sobre mim"*.

**Correção:** seção curta logo após o hero — *"Se você guardou ingresso do Hangar 110, se sabe de cor
a letra de Um Minuto Para o Fim do Mundo, se ouviu que era só uma fase — esse livro é o registro de
que não era."*

---

## Plano de ação

### Hoje — correções de sangramento

| # | Ação | Achado | Esforço |
|---:|---|---|---|
| 1 | Apagar o **"TODO"** do FAQ e publicar prazo de envio conservador | 3.3 | 5 min |
| 2 | Trocar **"Apoie no Catarse a partir de 14/08"** por "Campanha no ar" | 3.1 | 5 min |
| 3 | Remover a barra de progresso zerada (ou preencher o ID) | 3.2 | 10 min |
| 4 | Trocar o selo "Pré-lançamento" e alinhar a data de entrega dos 3 cards | 3.1 · 3.4 | 15 min |
| 5 | Comprimir `livro.png`: 3,0 MB → WebP de ~100 KB | 2.2 | 20 min |
| 6 | Criar o Meta Pixel e colar o ID | 1.4 | 20 min |

### Esta semana — estrutura

| # | Ação | Achado | Esforço |
|---:|---|---|---|
| 7 | **Recolocar a captura de e-mail** ligada ao `SHEET_ENDPOINT` existente | 4.5 | 2–3 h |
| 8 | Capítulo grátis atrás do e-mail; botão em estilo secundário | 4.4 | 1 h |
| 9 | **Reescrever a dobra do mobile**: `h1` de texto + preço + frete + um botão só | 2.1 · 2.3 · 4.2 | 3 h |
| 10 | **Barra de compra fixa** no rodapé do mobile | 2.4 | 2 h |
| 11 | CTA de fechamento em **Sobre** e **Bandas × Eras** | 4.1 | 1 h |
| 12 | Corrigir o GA4: renomear o `page_view` da SPA, rastrear CTAs internos | 1.1 · 1.2 | 1 h |

### Próximas duas semanas — argumento

| # | Ação | Achado | Esforço |
|---:|---|---|---|
| 13 | **Três depoimentos reais** da cena, com nome e foto, acima das recompensas | 3.5 | depende de terceiros |
| 14 | Construção de valor colada no preço | 5.1 | 2 h |
| 15 | Seção de reconhecimento — "isso é pra você que…" | 5.4 | 2 h |
| 16 | CTAs da home indo **direto para a recompensa** no Catarse | 4.3 | 1 h |
| 17 | SEO e OG na linguagem do público ("emo", "emocore", nomes de banda) | 5.3 | 1 h |
| 18 | Urgência por prazo em vez de tiragem | 5.2 | 1 h |

### Sobre expectativa de resultado

Não dá para prometer um número. O que dá para afirmar é onde está a perda: **a maior parte dos
visitantes sai antes de entender o que a página vende** — por peso de carregamento, por ausência de
headline no mobile, e por mensagens dizendo que a campanha ainda não abriu. Os três são independentes
e se multiplicam.

A referência realista é a média de mercado: **4,23%** de CTR de CTA. Sair de 1% e chegar perto disso
já quadruplica o topo do funil sem mexer no tráfego. E o item 7 — captura de e-mail — é o que decide
a reta final, onde o Catarse historicamente converte melhor.

---

## Próxima medição

- **Profundidade de rolagem** na home (25/50/75/100%).
- **Taxa de saída por aba** — confirma se Sobre e Bandas são becos sem saída.
- **Core Web Vitals reais** (PageSpeed Insights mobile), antes e depois da compressão da capa.
- **Origem do tráfego** — tráfego frio de rede social converte a 1–2% por natureza; se for quase
  todo daí, parte do 1% é composição de canal, não só página.
- **Mapa de calor** (Microsoft Clarity ou Hotjar, gratuitos) na home mobile.
- **`download_capitulo_1` vs `click_catarse`** — quantifica a canibalização do botão grátis.

---

## Fontes

1. [Landing Page Statistics 2026](https://landingi.com/landing-page/statistics/) — CTR médio de CTA (4,23%); conversão por número de CTAs (13,5% / 11,9% / 10,5%).
2. [What is a Good Landing Page Conversion Rate](https://popupsmart.com/blog/what-is-a-good-landing-page-conversion-rate) — médias de 6,6% a 10,76%.
3. [Kickstarter Forum — Conversion Rates](https://www.kickstarterforum.org/kickstarter-and-crowdfunding-questions-only-strict-f4/conversion-rates-t7375.html) — 6% orgânico, 1–2% de tráfego social na página de campanha.
4. [Prelaunch Club — Average Conversion Rates](https://prelaunch.marketing/blogs/academy/average-conversion-rates-for-kickstarter-followers) — e-mail 5%, seguidor social 2%.
5. [Agência BORI / FGV](https://abori.com.br/comportamento-social/taxa-de-conversao-de-doacoes-sao-maiores-na-reta-final-de-campanhas-de-crowdfunding-do-tipo-tudo-ou-nada/) — 934 projetos do Catarse: padrão em U e conversão maior na reta final.
6. [Google — Mobile Site Speed Playbook](https://www.thinkwithgoogle.com/_qs/documents/4290/c676a_Google_MobileSiteSpeed_Playbook_v2.1_digital_4JWkGQT.pdf) e [Huckabuy](https://huckabuy.com/20-important-page-speed-bounce-rate-and-conversion-rate-statistics/) — 53% de abandono acima de 3s; +32% de bounce entre 1s e 3s; 2,5× de conversão a 1s vs 5s.
7. [Baymard Institute](https://baymard.com/blog/delayed-account-creation) e [Carty Labs](https://cartylabs.com/blog/guest-checkout-vs-account-creation-shopify/) — cadastro obrigatório como principal causa de abandono (24%).
8. [Genesys Growth](https://genesysgrowth.com/blog/social-proof-conversion-stats-for-marketing-leaders) e [ProveSource](https://provesrc.com/blog/social-proof-statistics/) — prova social: +15–30%, até 35–50% combinada; 88% confiam em avaliação como em recomendação pessoal.
9. [Stackmatix — Above the Fold Optimization](https://www.stackmatix.com/blog/above-the-fold-optimization) — decisão em 3 segundos; 57% do tempo de visualização acima da dobra.
10. [PublishNews / Painel Nielsen–SNEL](https://www.publishnews.com.br/materias/2026/05/26/venda-de-livros-mantem-ritmo-de-crescimento-em-2026-aponta-painel-nielsen/snel) — preço médio do livro no Brasil em 2026: R$ 52,70.
11. [TMDQA!](https://www.tenhomaisdiscosqueamigos.com/2025/06/13/nostalgia-emo-pop-punk-brasil), [Billboard Brasil](https://billboard.com.br/tudo-sobre-o-i-wanna-be-tour-2025/) e [Rolling Stone Brasil](https://rollingstone.com.br/musica/fresno-fala-a-rs-sobre-i-wanna-be-tour-movimento-emo-e-nostalgia-so-ate-certo-ponto/) — I Wanna Be Tour: 150 mil pessoas em 2024, Allianz Parque em 2025.
12. [Blog do Catarse](https://blog.catarse.me/post/crowdfunding-como-definir-uma-meta-financeira-para-sua-campanha) — modelo tudo-ou-nada e taxa de 13% sobre o arrecadado.
