/**
 * API da página de rastreio — https://hcemocional.com.br/rastreio
 *
 * Fica DENTRO da planilha RASTREIO (Extensões → Apps Script). Os endereços
 * nunca passam pelo repositório nem pelo site público: a página só recebe os
 * dados da pessoa que digitou o próprio e-mail.
 *
 *   GET  ?email=...                  → nome, endereço, apoio, código de rastreio
 *                                      e status dos Correios consultado na hora
 *   POST email=...&resposta=sim|nao  → grava a resposta da tela "Esses dados
 *                                      estão corretos?" na coluna "Tudo certo?":
 *                                      SIM (verde) ou NÃO (vermelho)
 *
 * COMO PUBLICAR (uma vez só)
 *   1. Abra a planilha RASTREIO → Extensões → Apps Script.
 *   2. Apague o que estiver no editor, cole este arquivo inteiro e salve.
 *   3. Implantar → Nova implantação → engrenagem → "App da Web".
 *        Executar como: Eu
 *        Quem pode acessar: Qualquer pessoa
 *   4. Autorize o acesso e copie a "URL do app da Web" (termina em /exec).
 *   5. Essa URL vai em API_RASTREIO, no topo do script do rastreio.html.
 *
 * Se mudar este código depois: Implantar → Gerenciar implantações → lápis →
 * Versão: "Nova versão" → Implantar. Assim a URL continua a mesma.
 *
 * COMO A PLANILHA É LIDA (pelo nome da coluna; a ordem não importa)
 *   Nome pessoa · Email · Codigo de rastreio · Apoio · Endereço · Tudo certo?
 *
 *   "Codigo de rastreio"
 *       vazio                  → "está na gráfica, assim que pronto colocamos o código"
 *       São Carlos             → "será entregue em mãos por nós mesmos"
 *       código (AB123456789BR) → código + status dos Correios em tempo real
 *
 *   "Tudo certo?"
 *       AGUARDANDO (ou vazio)  → a pessoa vê a tela de confirmação dos dados
 *       SIM                    → vê o status do pedido e o rastreio
 *       NÃO                    → vê o aviso de que vamos falar com ela por e-mail.
 *                                Depois de corrigir o endereço, troque por SIM
 *                                que o rastreio passa a aparecer pra ela.
 *
 *   Linhas de "Apoio sem recompensa" (ou endereço "Sem endereço...") não têm
 *   envio: não pedem confirmação e mostram só um agradecimento.
 */

var ABA = '';                 // nome da aba com os pedidos; vazio = primeira aba
var CACHE_CORREIOS_MIN = 5;   // a mesma consulta aos Correios é reaproveitada por 5 min
var FUSO = 'America/Sao_Paulo';
var COR = { SIM: '#34a853', NAO: '#ea4335' };

function doGet(e) {
  try {
    var email = normEmail(e && e.parameter && e.parameter.email);
    if (!email) return json({ ok: true, servico: 'rastreio hcemocional' });
    return json(buscar(email, lerTabela()));
  } catch (err) {
    console.error(err);
    return json({ ok: false, erro: 'interno' });
  }
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var email = normEmail(p.email);
  var resposta = chave(p.resposta);
  if (!email || (resposta !== 'sim' && resposta !== 'nao')) {
    return json({ ok: false, erro: 'pedido_invalido' });
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var t = lerTabela();
    if (t.col.ok < 0) return json({ ok: false, erro: 'sem_coluna_tudo_certo' });
    var quando = Utilities.formatDate(new Date(), FUSO, 'dd/MM/yyyy HH:mm');
    var sim = resposta === 'sim';
    t.linhas.forEach(function (r) {
      // só grava quem ainda está aguardando: a resposta vale uma vez
      if (r.email !== email || !r.envia || r.confirmacao !== 'AGUARDANDO') return;
      t.aba.getRange(r.linha, t.col.ok + 1)
        .setValue(sim ? 'SIM' : 'NÃO')
        .setBackground(sim ? COR.SIM : COR.NAO)
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setNote('Respondido pelo site em ' + quando);
      r.confirmacao = sim ? 'SIM' : 'NAO';
    });
    SpreadsheetApp.flush();
    return json(buscar(email, t));
  } catch (err) {
    console.error(err);
    return json({ ok: false, erro: 'interno' });
  } finally {
    lock.releaseLock();
  }
}

function lerTabela() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ABA ? ss.getSheetByName(ABA) : ss.getSheets()[0];
  var v = aba.getDataRange().getDisplayValues();
  var cab = (v[0] || []).map(chave);
  var col = function () {
    for (var i = 0; i < cab.length; i++) {
      for (var j = 0; j < arguments.length; j++) if (cab[i].indexOf(arguments[j]) >= 0) return i;
    }
    return -1;
  };
  var c = {
    nome: col('nome'), email: col('email'), codigo: col('codigo', 'rastreio'),
    apoio: col('apoio', 'recompensa'), endereco: col('endereco'), ok: col('tudocerto', 'confirm')
  };
  if (c.email < 0) throw new Error('Planilha sem coluna de e-mail');

  var linhas = [];
  for (var i = 1; i < v.length; i++) {
    var l = v[i];
    var pega = function (k) { return c[k] >= 0 ? String(l[c[k]] || '').trim() : ''; };
    var email = normEmail(pega('email'));
    if (email.indexOf('@') < 0) continue;
    var apoio = pega('apoio'), endereco = pega('endereco');
    linhas.push({
      linha: i + 1, email: email, nome: pega('nome'), apoio: apoio, endereco: endereco,
      codigo: pega('codigo'), envia: temEnvio(apoio, endereco), confirmacao: estado(pega('ok'))
    });
  }
  return { aba: aba, col: c, linhas: linhas };
}

function buscar(email, t) {
  var minhas = t.linhas.filter(function (r) { return r.email === email; });
  if (!minhas.length) return { ok: false, erro: 'nao_encontrado' };

  var comEnvio = minhas.filter(function (r) { return r.envia; });
  var tem = function (s) { return comEnvio.some(function (r) { return r.confirmacao === s; }); };
  var confirmacao = !comEnvio.length ? 'SEM_ENVIO' : tem('NAO') ? 'NAO' : tem('AGUARDANDO') ? 'AGUARDANDO' : 'SIM';

  var pedidos = minhas.map(function (r) {
    var p = {
      nome: r.nome, apoio: r.apoio, endereco: r.envia ? r.endereco : '', envia: r.envia,
      confirmacao: r.confirmacao, entrega: 'grafica', codigo: null,
      eventos: [], mensagem: null, consultado: null
    };
    var k = chave(r.codigo);
    if (!r.envia) p.entrega = 'sem_envio';
    else if (k.indexOf('saocarlos') >= 0 || k.indexOf('maos') >= 0) p.entrega = 'maos';
    else if (k) {
      p.entrega = 'correios';
      p.codigo = r.codigo.toUpperCase().replace(/\s+/g, '');
      // os Correios só são consultados pra quem já confirmou (é só aí que a página mostra)
      if (confirmacao === 'SIM') {
        var sro = rastrear(p.codigo);
        p.eventos = sro.eventos; p.mensagem = sro.mensagem; p.consultado = sro.consultado;
      }
    }
    return p;
  });
  return { ok: true, email: email, confirmacao: confirmacao, pedidos: pedidos };
}

/** Status do objeto nos Correios. eventos === null quer dizer "não deu pra consultar agora". */
function rastrear(codigo) {
  if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(codigo)) return { eventos: [], mensagem: null, consultado: null };
  var cache = CacheService.getScriptCache();
  var k = 'sro_' + codigo;
  var salvo = cache.get(k);
  if (salvo) return JSON.parse(salvo);
  try {
    var r = UrlFetchApp.fetch('https://proxyapp.correios.com.br/v1/sro-rastro/' + codigo,
      { muteHttpExceptions: true, headers: { Accept: 'application/json' } });
    if (r.getResponseCode() !== 200) throw new Error('HTTP ' + r.getResponseCode());
    var obj = (JSON.parse(r.getContentText()).objetos || [])[0] || {};
    var lugar = function (u) {
      var e = (u && u.endereco) || {};
      return [e.cidade, e.uf].filter(Boolean).join(' / ') || null;
    };
    var res = {
      eventos: (obj.eventos || []).map(function (ev) {
        return {
          data: ev.dtHrCriado || null,
          descricao: ev.descricao || '',
          detalhe: ev.detalhe || null,
          local: lugar(ev.unidade) || (ev.unidade && ev.unidade.nome) || null,
          destino: lugar(ev.unidadeDestino)
        };
      }),
      mensagem: obj.mensagem || null,
      consultado: new Date().toISOString()
    };
    cache.put(k, JSON.stringify(res), CACHE_CORREIOS_MIN * 60);
    return res;
  } catch (err) {
    console.warn('Correios ' + codigo + ': ' + err);
    return { eventos: null, mensagem: null, consultado: null };
  }
}

function temEnvio(apoio, endereco) {
  return chave(apoio).indexOf('semrecompensa') < 0 && chave(endereco).indexOf('semendereco') !== 0;
}

function estado(valor) {
  var k = chave(valor);
  if (/^(sim|ok|confirmad|corrigid)/.test(k)) return 'SIM';
  if (/^nao/.test(k)) return 'NAO';
  return 'AGUARDANDO';
}

function normEmail(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, '');
}

function chave(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
