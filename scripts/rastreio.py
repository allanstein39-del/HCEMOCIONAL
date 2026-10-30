#!/usr/bin/env python3
"""Gera rastreio.json a partir da planilha de rastreio + API dos Correios.

Roda no GitHub Actions (.github/workflows/rastreio.yml). Só usa a stdlib.

O site e o repositório são públicos, então e-mails NUNCA vão pro JSON:
cada pedido é indexado pelo SHA-256 do e-mail normalizado (minúsculo,
sem espaços). A página /rastreio calcula o mesmo hash no navegador.

Variáveis de ambiente (secrets do repositório):
  RASTREIO_SHEET_ID        ID da planilha (compartilhada como "qualquer pessoa com o link")
  CORREIOS_USUARIO         usuário do Meu Correios (opcional)
  CORREIOS_CODIGO_ACESSO   código de acesso às APIs (opcional)
  CORREIOS_CARTAO          número do cartão de postagem (opcional)
Sem as credenciais dos Correios, tenta o endpoint público do app.
"""
import base64, csv, hashlib, io, json, os, sys, time, unicodedata
import urllib.request, urllib.error
from datetime import datetime, timezone

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'rastreio.json')
UA = 'Mozilla/5.0 (hcemocional.com.br rastreio)'


def agora():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def http(url, method='GET', headers=None, data=None, timeout=30):
    req = urllib.request.Request(url, method=method, data=data,
                                 headers={'User-Agent': UA, 'Accept': 'application/json', **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def chave(texto):
    t = unicodedata.normalize('NFKD', texto or '').encode('ascii', 'ignore').decode().lower()
    return ''.join(c for c in t if c.isalnum())


def ler_planilha(sheet_id):
    url = 'https://docs.google.com/spreadsheets/d/%s/export?format=csv' % sheet_id
    texto = http(url, headers={'Accept': 'text/csv'}).decode('utf-8-sig')
    linhas = list(csv.reader(io.StringIO(texto)))
    if not linhas:
        return []
    cab = [chave(c) for c in linhas[0]]

    def col(*nomes):
        for i, c in enumerate(cab):
            if any(n in c for n in nomes):
                return i
        return None

    i_nome, i_email, i_cod = col('nome'), col('email'), col('codigo', 'rastreio')
    if i_email is None:
        sys.exit('Planilha sem coluna de e-mail. Cabeçalho: %r' % linhas[0])
    pedidos = []
    for l in linhas[1:]:
        pega = lambda i: (l[i].strip() if i is not None and i < len(l) else '')
        email = pega(i_email).lower().replace(' ', '')
        if '@' not in email:
            continue
        pedidos.append({'nome': pega(i_nome), 'email': email,
                        'codigo': pega(i_cod).upper().replace(' ', '') or None})
    return pedidos


class Correios:
    def __init__(self):
        self.token = None
        u, k, c = (os.environ.get(v, '').strip() for v in
                   ('CORREIOS_USUARIO', 'CORREIOS_CODIGO_ACESSO', 'CORREIOS_CARTAO'))
        if u and k and c:
            basic = base64.b64encode(('%s:%s' % (u, k)).encode()).decode()
            try:
                r = http('https://api.correios.com.br/token/v1/autentica/cartaopostagem', 'POST',
                         {'Authorization': 'Basic ' + basic, 'Content-Type': 'application/json'},
                         json.dumps({'numero': c}).encode())
                self.token = json.loads(r)['token']
                print('Correios: autenticado na API oficial')
            except Exception as e:
                print('Correios: falha ao autenticar (%s); usando endpoint público' % e)

    def consultar(self, codigo):
        if self.token:
            url = 'https://api.correios.com.br/srorastro/v1/objetos/%s?resultado=T' % codigo
            dados = json.loads(http(url, headers={'Authorization': 'Bearer ' + self.token}))
        else:
            dados = json.loads(http('https://proxyapp.correios.com.br/v1/sro-rastro/%s' % codigo))
        obj = (dados.get('objetos') or [{}])[0]
        eventos = []
        for ev in obj.get('eventos') or []:
            end = ((ev.get('unidade') or {}).get('endereco') or {})
            dest = ((ev.get('unidadeDestino') or {}).get('endereco') or {})
            fmt = lambda e: ' / '.join(x for x in (e.get('cidade'), e.get('uf')) if x)
            eventos.append({
                'data': ev.get('dtHrCriado'),
                'descricao': ev.get('descricao'),
                'detalhe': ev.get('detalhe'),
                'local': fmt(end) or (ev.get('unidade') or {}).get('nome'),
                'destino': fmt(dest) or None,
            })
        return {'eventos': eventos, 'mensagem': obj.get('mensagem')}


def main():
    sheet_id = os.environ.get('RASTREIO_SHEET_ID', '').strip()
    if not sheet_id:
        sys.exit('Defina o secret RASTREIO_SHEET_ID')
    try:
        anterior = json.load(open(SAIDA, encoding='utf-8')).get('pedidos', {})
    except Exception:
        anterior = {}

    correios = Correios()
    cache, saida = {}, {}
    for p in ler_planilha(sheet_id):
        h = hashlib.sha256(p['email'].encode()).hexdigest()
        item = {'nome': (p['nome'].split() or [''])[0], 'codigo': p['codigo'],
                'eventos': [], 'mensagem': None, 'consultado': None}
        if p['codigo']:
            if p['codigo'] not in cache:
                try:
                    cache[p['codigo']] = dict(correios.consultar(p['codigo']), consultado=agora())
                    time.sleep(1)
                except Exception as e:
                    print('Falha ao consultar %s: %s' % (p['codigo'], e))
                    # mantém o último status conhecido em vez de apagar
                    velho = next((x for x in anterior.get(h, []) if x.get('codigo') == p['codigo']), None)
                    cache[p['codigo']] = {k: velho[k] for k in ('eventos', 'mensagem', 'consultado')} if velho else {}
            item.update(cache[p['codigo']])
        saida.setdefault(h, []).append(item)

    json.dump({'atualizado': agora(), 'pedidos': saida}, open(SAIDA, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1, sort_keys=True)
    print('%d e-mails, %d códigos' % (len(saida), len(cache)))


if __name__ == '__main__':
    main()
