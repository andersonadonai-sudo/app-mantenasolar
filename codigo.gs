/**
 * ============================================================
 *  MANTENA SOLAR - APP DE VISITAS v3.1
 *
 *  ARQUIVO UNICO DE 38 KB - copie TUDO e cole no lugar de tudo.
 *  A TELA VEM DA INTERNET (nao precisa criar App.html, nao ha blocos).
 *
 *  COMO PUBLICAR:
 *   1. Selecione tudo no editor (Ctrl+A) e apague
 *   2. Cole este arquivo inteiro e salve (Ctrl+S)
 *   3. Implantar > Gerenciar implantacoes > lapis > Nova versao > Implantar
 *
 *  v3.1: filtros por vendedor/usina/etapa, busca, detalhe do lead,
 *        agenda com proximos contatos, lancamentos do time para o gestor
 * ============================================================
 */

var ID_PLANILHA = '17lXKTo-3qUyddIu7rUzeq6g6NQoxNvAGkYiHCwTJdwA';

// planilha antiga — usada só para importar os leads existentes
var ID_PLANILHA_ANTIGA = '1_Jd5-5apE20je65TMJT4pdAsT2W8FxnBwycVVCsUIDI';

var ABA_VISITAS = 'Visitas';
var ABA_ATENDIMENTOS = 'Atendimentos';
var ABA_USUARIOS = 'Usuários';

var ETAPAS = ['VISITA', 'ORÇAMENTO ENTREGUE', 'NEGOCIAÇÃO', 'GANHO', 'PERDIDO'];

var JORNADA = ['CAPTAÇÃO', 'APRESENTAÇÃO DO ORÇAMENTO', 'NEGOCIAÇÃO', 'FECHAMENTO', 'PÓS-VENDA'];

var TIPOS = ['LIGAÇÃO', 'WHATSAPP', 'VISITA', 'REUNIÃO', 'E-MAIL', 'OUTRO'];

/**
 * CLASSIFICAÇÃO — o vendedor toca no botão do que aconteceu.
 * Simples, sem texto livre. É o coração do registro.
 */
var CLASSIFICACOES = [
  { id: 'ATENDIDO',      rotulo: 'Atendido',          emoji: '✅', cor: '#10b981',
    desc: 'Falei com o cliente' },
  { id: 'NAO_ATENDEU',   rotulo: 'Não atendeu',       emoji: '📵', cor: '#94a3b8',
    desc: 'Não respondeu / caixa postal' },
  { id: 'APRESENTOU_PROPOSTA', rotulo: 'Apresentou proposta', emoji: '📄', cor: '#3b82f6',
    desc: 'Mostrou o orçamento' },
  { id: 'VISITA_TECNICA', rotulo: 'Visita técnica',   emoji: '🔧', cor: '#8b5cf6',
    desc: 'Foi no local / mediu telhado' },
  { id: 'VENDA_REALIZADA', rotulo: 'Venda realizada', emoji: '🎉', cor: '#059669',
    desc: 'Fechou negócio' },
  { id: 'CURIOSO',       rotulo: 'Curioso',           emoji: '👀', cor: '#f59e0b',
    desc: 'Só perguntou preço, sem interesse' },
  { id: 'SEM_INTERESSE', rotulo: 'Sem interesse',     emoji: '🚫', cor: '#ef4444',
    desc: 'Recusou / desistiu' },
  { id: 'RETORNAR',      rotulo: 'Retornar depois',   emoji: '⏰', cor: '#0ea5e9',
    desc: 'Pediu para chamar outra hora' }
];

/** Atalho: só os ids para validação */
function idsClassificacao() {
  return CLASSIFICACOES.map(function(c) { return c.id; });
}

/** Converte a classificação em etapa do funil */
function etapaDaClassificacao(cls) {
  switch (cls) {
    case 'VENDA_REALIZADA': return 'GANHO';
    case 'SEM_INTERESSE':   return 'PERDIDO';
    case 'APRESENTOU_PROPOSTA': return 'ORÇAMENTO ENTREGUE';
    case 'VISITA_TECNICA':  return 'VISITA';
    default: return null;   // não mexe na etapa
  }
}

/** Nome legível — é o que aparece na planilha e nos relatórios */
function rotuloClassificacao(cls) {
  for (var i = 0; i < CLASSIFICACOES.length; i++) {
    if (CLASSIFICACOES[i].id === cls) return CLASSIFICACOES[i].rotulo.toUpperCase();
  }
  return texto(cls);
}

var RESULTADOS = [
  'FALOU COM O CLIENTE', 'NÃO ATENDEU', 'NÚMERO ERRADO', 'PEDIU PARA LIGAR DEPOIS',
  'ENVIOU PROPOSTA', 'AGUARDANDO RETORNO', 'VISITA AGENDADA', 'VISITA REALIZADA',
  'NEGOCIANDO VALOR', 'FECHOU', 'RECUSOU'
];

var MOTIVOS = [
  'CLIENTE PEDIU DESCONTO', 'AGUARDANDO CRÉDITO', 'COMPARANDO COM CONCORRENTE',
  'VAI DECIDIR COM CÔNJUGE/SÓCIO', 'SEM TEMPO / RETORNA DEPOIS', 'NÃO RECEBEU A PROPOSTA',
  'TELHADO PRECISA DE AJUSTE', 'RETORNAR NO MÊS SEGUINTE', 'NÃO RESPONDEU MAIS',
  'FECHOU NEGÓCIO', 'RECUSOU — PREÇO', 'RECUSOU — CRÉDITO', 'RECUSOU — PRAZO',
  'RECUSOU — CONCORRENTE', 'RECUSOU — DESISTIU', 'OUTRO'
];

var ACOES = ['LIGAR', 'VISITA TÉCNICA', 'ENVIAR PROPOSTA', 'MANDAR MENSAGEM',
             'COBRAR RETORNO', 'FECHAR CONTRATO'];

// ============================================================
//  WEB APP
// ============================================================

/**
 * A TELA VEM DA INTERNET.
 * Assim voce cola apenas este arquivo (37 KB) no Apps Script.
 * Para mudar a tela no futuro, nao precisa mexer no Apps Script.
 */
var URL_TELA = 'https://raw.githubusercontent.com/andersonadonai-sudo/app-mantenasolar/main/app-screen.html';
var URL_TELA2 = 'https://cdn.jsdelivr.net/gh/andersonadonai-sudo/app-mantenasolar@main/app-screen.html';

function doGet(e) {
  garantirFuso();

  var texto = buscarTela();

  if (!texto) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:-apple-system,sans-serif;padding:30px;line-height:1.8;max-width:540px;margin:0 auto">' +
      '<h2 style="color:#b91c1c;margin-bottom:10px">Nao consegui carregar a tela</h2>' +
      '<p style="color:#475569">O app precisa de internet para buscar a tela do sistema.</p>' +
      '<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px;border-radius:8px;margin:18px 0">' +
      '<b style="color:#991b1b">Tente:</b><br>1. Verifique a conexao do celular<br>' +
      '2. Toque em atualizar<br>3. Fale com o suporte</div>' +
      '<p style="color:#94a3b8;font-size:12px">Enderecos tentados:<br>' + URL_TELA + '<br>' + URL_TELA2 + '</p>' +
      '</div>');
  }

  return HtmlService.createHtmlOutput(texto)
    .setTitle('Mantena Solar')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

/**
 * Busca a tela: primeiro no arquivo HTML do projeto (se existir),
 * depois na internet. Guarda em cache por 5 minutos.
 */
function buscarTela() {
  // 1) arquivo HTML do projeto, se voce tiver criado
  var nomes = ['App', 'app', 'Index', 'Tela', 'Sistema', 'Painel'];
  for (var i = 0; i < nomes.length; i++) {
    try {
      var arq = HtmlService.createHtmlOutputFromFile(nomes[i]);
      var html = arq.getContent();
      if (html && html.length > 5000 && html.indexOf('function filtrarLista') > -1) {
        return html;
      }
    } catch (err) {}
  }

  // 2) cache
  try {
    var cache = CacheService.getScriptCache();
    var guardado = cache.get('tela_v31');
    if (guardado) return guardado;
  } catch (err) {}

  // 3) internet
  var urls = [URL_TELA, URL_TELA2];
  for (var u = 0; u < urls.length; u++) {
    try {
      var resp = UrlFetchApp.fetch(urls[u] + '?t=' + new Date().getTime(), {
        muteHttpExceptions: true,
        followRedirects: true
      });
      if (resp.getResponseCode() === 200) {
        var txt = resp.getContentText();
        if (txt && txt.length > 5000 && txt.indexOf('function filtrarLista') > -1) {
          try {
            CacheService.getScriptCache().put('tela_v3', txt, 300);
          } catch (err) {}
          return txt;
        }
      }
    } catch (err) {}
  }

  return null;
}

/** Rode para conferir se a tela carrega da internet */
function testarTela() {
  var t = buscarTela();
  if (!t) {
    return 'FALHOU: nao consegui buscar a tela.\n' +
           'Verifique: ' + URL_TELA;
  }
  var l = [];
  l.push('TELA CARREGADA DA INTERNET: OK');
  l.push('tamanho: ' + t.length + ' caracteres');
  l.push('versao v3.1: ' + (t.indexOf('v3.1') > -1 ? 'SIM' : 'nao'));
  l.push('filtros (filtrarLista): ' + (t.indexOf('function filtrarLista') > -1 ? 'OK' : 'FALTA'));
  l.push('campo de busca: ' + (t.indexOf('buscaLead') > -1 ? 'OK' : 'FALTA'));
  l.push('botoes de classificacao: ' + (t.indexOf('cls-grid') > -1 ? 'OK' : 'FALTA'));
  return l.join('\n');
}

/**
 * Garante o horario de Brasilia na planilha.
 */
var FUSO = 'America/Sao_Paulo';

function garantirFuso() {
  try {
    var p = SpreadsheetApp.openById(ID_PLANILHA);
    if (p.getSpreadsheetTimeZone() !== FUSO) p.setSpreadsheetTimeZone(FUSO);
  } catch (err) {}
}

function horaLocal(d) {
  if (!(d instanceof Date)) return 0;
  var s = Utilities.formatDate(d, FUSO, 'yyyy-MM-dd HH:mm:ss');
  var p = s.split(' ');
  var h = p[1].split(':');
  var dt = p[0].split('-');
  return new Date(+dt[0], +dt[1] - 1, +dt[2], +h[0], +h[1], +h[2]).getTime();
}

// ============================================================
//  LOGIN
// ============================================================

function verificarLogin(usuario, senha) {
  if (!usuario || !senha) return { ok: false, erro: 'Informe usuário e senha.' };

  var aba = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(ABA_USUARIOS);
  if (!aba || aba.getLastRow() < 2) return { ok: false, erro: 'Nenhum usuário cadastrado.' };

  var dados = aba.getRange(2, 1, aba.getLastRow() - 1, 7).getValues();
  var alvo = texto(usuario).toLowerCase();

  for (var i = 0; i < dados.length; i++) {
    var id = texto(dados[i][0]);
    if (!id) continue;

    var nome = texto(dados[i][1]);
    var email = texto(dados[i][3]);
    var bate = (id.toLowerCase() === alvo) ||
               (nome.toLowerCase() === alvo) ||
               (email && email.toLowerCase() === alvo);
    if (!bate) continue;

    var guardada = texto(dados[i][5]);
    var confere;
    if (guardada.indexOf('sha256:') === 0) {
      confere = (guardada === hashSenha(texto(senha), id));
    } else {
      confere = (guardada === texto(senha));
      if (confere) aba.getRange(i + 2, 6).setValue(hashSenha(texto(senha), id));
    }
    if (!confere) return { ok: false, erro: 'Senha incorreta.' };

    var ativo = texto(dados[i][6]).toUpperCase();
    if (ativo === 'NAO' || ativo === 'NÃO' || ativo === '0') {
      return { ok: false, erro: 'Acesso desativado. Fale com o gestor.' };
    }

    return {
      ok: true,
      usuario: {
        id: id,
        nome: nome,
        celular: texto(dados[i][2]),
        email: email,
        gestor: (texto(dados[i][4]).toLowerCase() === 'gestor') || id.indexOf('gerent') === 0
      }
    };
  }

  return { ok: false, erro: 'Usuário não encontrado.' };
}

function hashSenha(senha, sal) {
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, senha + '::' + sal);
  var s = 'sha256:';
  for (var i = 0; i < d.length; i++) {
    var b = (d[i] < 0) ? d[i] + 256 : d[i];
    s += ('0' + b.toString(16)).slice(-2);
  }
  return s;
}

function migrarSenhas() {
  var aba = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(ABA_USUARIOS);
  if (!aba || aba.getLastRow() < 2) return 'Nada a migrar.';
  var dados = aba.getRange(2, 1, aba.getLastRow() - 1, 7).getValues();
  var n = 0;
  for (var i = 0; i < dados.length; i++) {
    var id = texto(dados[i][0]);
    var s = texto(dados[i][5]);
    if (!id || !s || s.indexOf('sha256:') === 0) continue;
    aba.getRange(i + 2, 6).setValue(hashSenha(s, id));
    n++;
  }
  return n + ' senha(s) convertida(s).';
}

// ============================================================
//  DADOS PARA O APP
// ============================================================

function getTudo(usuario) {
  var planilha = SpreadsheetApp.openById(ID_PLANILHA);
  var abaV = planilha.getSheetByName(ABA_VISITAS);
  var visitas = [];
  var agenda = [];
  var reativar = [];
  var meusLancamentos = [];

  var nomes = {};
  getVendedores().forEach(function(v) { nomes[v.id] = v.nome; });

  if (abaV && abaV.getLastRow() >= 2) {
    var dados = abaV.getRange(2, 1, abaV.getLastRow() - 1, 20).getValues();
    var mapa = mapaAtendimentos(planilha);
    var gestor = usuario && usuario.gestor;

    for (var i = 0; i < dados.length; i++) {
      var r = dados[i];
      var cliente = texto(r[3]);
      if (!cliente) continue;

      var idVisita = texto(r[0]);
      var info = mapa[idVisita] || { total: 0, ultimo: null, ultimoTexto: '', ultimaEtapa: '', ts: 0 };
      var vendedor = texto(r[2]);

      if (!gestor && usuario && vendedor !== usuario.id) continue;

      var prox = r[16];
      var proxTxt = formatarData(prox);
      var item = {
        linha: i + 2,
        id: idVisita,
        data: formatarData(r[1]),
        vendedor: vendedor,
        vendedorNome: nomes[vendedor] || vendedor.replace('vend_', '').replace('_', ' '),
        cliente: cliente,
        telefone: texto(r[4]),
        cidade: texto(r[5]),
        uf: texto(r[6]),
        bairro: texto(r[7]),
        endereco: texto(r[8]),
        numero: texto(r[9]),
        cep: texto(r[10]),
        kwp: numero(r[11]),
        telhado: texto(r[12]),
        zona: texto(r[13]),
        etapa: texto(r[14]) || 'VISITA',
        valor: numero(r[15]),
        proximoContato: proxTxt,
        proximoISO: isoData(prox),
        proximaAcao: texto(r[17]),
        motivoPerda: texto(r[18]),
        diasParado: diasDesde(info.ultimo || r[1] || r[19]),
        atendimentos: info.total,
        ultimoAtendimento: info.ultimoTexto,
        atrasado: false,
        diasAtraso: 0
      };

      if (item.proximoContato && item.etapa !== 'GANHO' && item.etapa !== 'PERDIDO') {
        var dias = diasAte(prox);
        if (dias !== null && dias < 0) {
          item.atrasado = true;
          item.diasAtraso = Math.abs(dias);
        }
        item.diasParaContato = dias;
      }

      visitas.push(item);

      // AGENDA: todo lead com próximo contato marcado (qualquer data)
      // REATIVAR: lead sem data de retorno há 7+ dias
      if (item.etapa !== 'GANHO' && item.etapa !== 'PERDIDO') {
        if (item.proximoContato) {
          agenda.push(item);
        } else if (item.diasParado !== null && item.diasParado >= 7) {
          item.semContato = true;
          item.diasParaContato = null;
          reativar.push(item);
        }
      }
    }

    // agenda: primeiro o que venceu, depois o que vem
    agenda.sort(function(a, b) {
      if (a.diasParaContato === null) return 1;
      if (b.diasParaContato === null) return -1;
      return a.diasParaContato - b.diasParaContato;
    });

    // reativação: orçamento entregue primeiro (lead mais quente), depois mais antigo
    var peso = { 'ORÇAMENTO ENTREGUE': 0, 'NEGOCIAÇÃO': 1, 'VISITA': 2 };
    reativar.sort(function(a, b) {
      var pa = peso[a.etapa], pb = peso[b.etapa];
      if (pa === undefined) pa = 9;
      if (pb === undefined) pb = 9;
      if (pa !== pb) return pa - pb;
      return (b.diasParado || 0) - (a.diasParado || 0);
    });
  }

  // lançamentos recentes: vendedor vê os seus, gestor vê os do time
  if (usuario) {
    meusLancamentos = getMeusLancamentos(usuario.gestor ? null : usuario.id);
  }

  return {
    visitas: visitas,
    agenda: agenda,
    reativar: reativar,
    meusLancamentos: meusLancamentos,
    resumo: resumir(visitas),
    vendedores: getVendedores(),
    opcoes: {
      etapas: ETAPAS, jornada: JORNADA, tipos: TIPOS,
      classificacoes: CLASSIFICACOES, acoes: ACOES
    },
    usuario: usuario
  };
}

function getMeusLancamentos(vendedorId) {
  var aba = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(ABA_ATENDIMENTOS);
  if (!aba || aba.getLastRow() < 2) return [];

  var dados = aba.getRange(2, 1, aba.getLastRow() - 1, 13).getValues();
  var lista = [];
  var limite = new Date().getTime() - (30 * 86400000);

  for (var i = 0; i < dados.length; i++) {
    // vendedorId vazio/null = todos (visao do gestor)
    if (vendedorId && texto(dados[i][3]) !== vendedorId) continue;
    var quando = dados[i][2];
    var ts = horaLocal(quando);
    if (!ts) ts = 0;
    if (ts && ts < limite) continue;

    lista.push({
      ts: ts,
      idVisita: texto(dados[i][1]),
      data: formatarDataHora(quando),
      cliente: texto(dados[i][12]),
      vendedor: texto(dados[i][3]),
      tipo: texto(dados[i][4]),
      etapa: texto(dados[i][5]),
      resultado: texto(dados[i][6]),
      motivo: texto(dados[i][7])
    });
  }

  lista.sort(function(a, b) { return b.ts - a.ts; });
  return lista.slice(0, 50);
}

function getVendedores() {
  var aba = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(ABA_USUARIOS);
  if (!aba || aba.getLastRow() < 2) return [];
  var dados = aba.getRange(2, 1, aba.getLastRow() - 1, 7).getValues();
  var lista = [];
  for (var i = 0; i < dados.length; i++) {
    var id = texto(dados[i][0]);
    if (id.indexOf('vend_') !== 0) continue;
    var ativo = texto(dados[i][6]).toUpperCase();
    if (ativo === 'NAO' || ativo === 'NÃO' || ativo === '0') continue;
    lista.push({ id: id, nome: texto(dados[i][1]), celular: texto(dados[i][2]) });
  }
  return lista;
}

function mapaAtendimentos(planilha) {
  var aba = planilha.getSheetByName(ABA_ATENDIMENTOS);
  var mapa = {};
  if (!aba || aba.getLastRow() < 2) return mapa;

  var dados = aba.getRange(2, 1, aba.getLastRow() - 1, 13).getValues();
  for (var i = 0; i < dados.length; i++) {
    var id = texto(dados[i][1]);
    if (!id) continue;
    var quando = dados[i][2];
    var ts = horaLocal(quando);

    if (!mapa[id]) mapa[id] = { total: 0, ultimo: null, ultimoTexto: '', ultimaEtapa: '', ts: 0 };
    mapa[id].total++;
    if (ts >= mapa[id].ts) {
      mapa[id].ts = ts;
      mapa[id].ultimo = quando;
      mapa[id].ultimaEtapa = texto(dados[i][5]);
      mapa[id].ultimoTexto = texto(dados[i][4]) + ' · ' + texto(dados[i][6]);
    }
  }
  return mapa;
}

function resumir(visitas) {
  var porEtapa = {};
  ETAPAS.forEach(function(e) { porEtapa[e] = 0; });

  var total = 0, ganhos = 0, perdidos = 0, valorGanho = 0, valorAberto = 0;
  var atrasados = 0, semProximo = 0, semana = 0;

  visitas.forEach(function(v) {
    total++;
    if (porEtapa[v.etapa] === undefined) porEtapa[v.etapa] = 0;
    porEtapa[v.etapa]++;

    if (v.etapa === 'GANHO') {
      ganhos++;
      valorGanho += v.valor || 0;
    } else if (v.etapa === 'PERDIDO') {
      perdidos++;
    } else {
      valorAberto += v.valor || 0;
      if (!v.proximoContato) semProximo++;
      else {
        if (v.atrasado) atrasados++;
        if (v.diasParaContato !== null && v.diasParaContato <= 7) semana++;
      }
    }
  });

  return {
    total: total,
    porEtapa: porEtapa,
    ganhos: ganhos,
    perdidos: perdidos,
    abertos: total - ganhos - perdidos,
    valorGanho: valorGanho,
    valorAberto: valorAberto,
    atrasados: atrasados,
    semProximo: semProximo,
    semana: semana,
    conversao: total ? Math.round((ganhos / total) * 100) : 0
  };
}

// ============================================================
//  GRAVAR
// ============================================================

function salvarVisita(dados, usuarioLogado) {
  if (!dados) throw new Error('Nenhum dado recebido.');

  var trava = LockService.getScriptLock();
  try { trava.waitLock(20000); }
  catch (e) { throw new Error('Sistema ocupado. Tente de novo.'); }

  try {
    var planilha = SpreadsheetApp.openById(ID_PLANILHA);
    var aba = planilha.getSheetByName(ABA_VISITAS);
    if (!aba) throw new Error('Aba Visitas não encontrada.');

    var cliente = texto(dados.cliente);
    var telefone = limparTelefone(dados.telefone);
    var cidade = texto(dados.cidade);

    if (!cliente) throw new Error('Informe o nome do cliente.');
    if (!telefone) throw new Error('Informe o telefone do cliente.');
    if (telefone.length < 10) throw new Error('Telefone incompleto. Use DDD + número.');
    if (!cidade) throw new Error('Informe a cidade.');

    var vendedor = texto(dados.vendedor) || (usuarioLogado && usuarioLogado.id) || '';
    if (!vendedor) throw new Error('Selecione o vendedor.');

    var vendedores = getVendedores();
    for (var v = 0; v < vendedores.length; v++) {
      if (limparTelefone(vendedores[v].celular) === telefone) {
        throw new Error('Este é o telefone do vendedor ' + vendedores[v].nome +
                        '. Informe o telefone do CLIENTE.');
      }
    }

    var existente = buscarPorTelefone(aba, telefone);
    if (existente) {
      return {
        ok: false, duplicado: true,
        mensagem: 'Este telefone já está cadastrado para ' + existente.cliente + '.'
      };
    }

    var agora = new Date();
    var id = Utilities.getUuid();
    var etapa = ETAPAS.indexOf(texto(dados.etapa)) >= 0 ? texto(dados.etapa) : 'VISITA';
    var prox = texto(dados.proximoContato);

    aba.appendRow([
      id, agora, vendedor, cliente, telefone, cidade,
      texto(dados.uf) || 'ES', texto(dados.bairro), texto(dados.endereco),
      texto(dados.numero), texto(dados.cep), numero(dados.kwp),
      texto(dados.telhado), texto(dados.zona), etapa,
      numero(dados.valor), prox ? virarData(prox) : '',
      texto(dados.proximaAcao), '', agora
    ]);

    try {
      var etapaJ = (etapa === 'ORÇAMENTO ENTREGUE' || etapa === 'NEGOCIAÇÃO')
        ? 'APRESENTAÇÃO DO ORÇAMENTO' : 'CAPTAÇÃO';

      registrarAtendimento({
        idVisita: id, cliente: cliente, vendedor: vendedor,
        tipo: 'VISITA', etapa: etapaJ,
        classificacao: etapa === 'ORÇAMENTO ENTREGUE' ? 'APRESENTOU_PROPOSTA' : 'ATENDIDO',
        proximoContato: prox,
        proximaAcao: texto(dados.proximaAcao),
        observacao: texto(dados.observacoes)
      }, usuarioLogado);
    } catch (e) {}

    return { ok: true, id: id, cliente: cliente };

  } finally {
    trava.releaseLock();
  }
}

function atualizarVisita(payload, usuarioLogado) {
  if (!payload || !payload.id) throw new Error('Visita não identificada.');

  var trava = LockService.getScriptLock();
  try { trava.waitLock(20000); }
  catch (e) { throw new Error('Sistema ocupado.'); }

  try {
    var aba = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(ABA_VISITAS);
    var linha = acharLinha(aba, payload.id);
    if (!linha) throw new Error('Visita não encontrada. Atualize a tela.');

    var etapa = texto(payload.etapa);
    if (etapa && ETAPAS.indexOf(etapa) < 0) throw new Error('Etapa inválida.');
    if (etapa === 'PERDIDO' && !texto(payload.motivoPerda)) {
      throw new Error('Para marcar como perdido, informe o motivo.');
    }

    if (etapa) aba.getRange(linha, 15).setValue(etapa);
    if (payload.valor !== undefined && payload.valor !== '') {
      aba.getRange(linha, 16).setValue(numero(payload.valor));
    }
    if (payload.proximoContato !== undefined) {
      var p = texto(payload.proximoContato);
      aba.getRange(linha, 17).setValue(p ? virarData(p) : '');
    }
    if (payload.proximaAcao !== undefined) {
      aba.getRange(linha, 18).setValue(texto(payload.proximaAcao));
    }
    if (payload.motivoPerda !== undefined) {
      aba.getRange(linha, 19).setValue(texto(payload.motivoPerda));
    }
    aba.getRange(linha, 20).setValue(new Date());

    return { ok: true };
  } finally { trava.releaseLock(); }
}

function registrarAtendimento(payload, usuarioLogado) {
  if (!payload || !payload.idVisita) throw new Error('Visita não identificada.');

  var cls = texto(payload.classificacao).toUpperCase();
  if (!cls) throw new Error('Escolha o que aconteceu.');
  if (idsClassificacao().indexOf(cls) < 0) throw new Error('Classificação inválida: ' + cls);

  var trava = LockService.getScriptLock();
  try { trava.waitLock(20000); }
  catch (e) { throw new Error('Sistema ocupado.'); }

  try {
    var planilha = SpreadsheetApp.openById(ID_PLANILHA);
    var abaAt = planilha.getSheetByName(ABA_ATENDIMENTOS);
    if (!abaAt) throw new Error('Aba Atendimentos não encontrada.');

    var agora = new Date();
    var vendedor = texto(payload.vendedor) || (usuarioLogado && usuarioLogado.id) || '';
    var criadoPor = (usuarioLogado && usuarioLogado.id) || vendedor;
    var prox = texto(payload.proximoContato);
    var rotulo = rotuloClassificacao(cls);

    // 1) grava o atendimento
    abaAt.appendRow([
      Utilities.getUuid(),        // A ID
      texto(payload.idVisita),    // B ID Visita
      agora,                      // C Data/Hora
      vendedor,                   // D Vendedor
      texto(payload.tipo) || 'WHATSAPP', // E Tipo
      texto(payload.etapa) || 'CAPTAÇÃO',// F Etapa da jornada
      rotulo,                     // G Resultado (classificação)
      texto(payload.observacao),  // H Motivo/Observação
      prox ? virarData(prox) : '',// I Próximo contato
      texto(payload.proximaAcao), // J Próxima ação
      texto(payload.observacao),  // K Observação
      criadoPor,                  // L Criado por
      texto(payload.cliente)      // M Cliente
    ]);

    // 2) atualiza o card do cliente
    var abaV = planilha.getSheetByName(ABA_VISITAS);
    var linha = acharLinha(abaV, payload.idVisita);

    if (linha) {
      abaV.getRange(linha, 20).setValue(agora);   // Atualizado em

      if (prox) {
        abaV.getRange(linha, 17).setValue(virarData(prox));
      }
      if (texto(payload.proximaAcao)) {
        abaV.getRange(linha, 18).setValue(texto(payload.proximaAcao));
      }

      // etapa do funil muda conforme a classificação
      var etapa = etapaDaClassificacao(cls);
      var etapaAtual = texto(abaV.getRange(linha, 15).getValue());

      // venda já fechada não volta atrás
      if (etapaAtual === 'GANHO' && etapa && etapa !== 'GANHO') {
        etapa = null;
      }

      if (etapa) {
        abaV.getRange(linha, 15).setValue(etapa);
        if (etapa === 'GANHO') {
          abaV.getRange(linha, 17).setValue('');   // ganho não precisa de retorno
          abaV.getRange(linha, 18).setValue('');
        }
        if (etapa === 'PERDIDO') {
          abaV.getRange(linha, 17).setValue('');
          abaV.getRange(linha, 18).setValue('');
          abaV.getRange(linha, 19).setValue(texto(payload.observacao) || 'SEM INTERESSE');
        }
      }
    }

    return { ok: true, classificacao: rotulo };
  } finally { trava.releaseLock(); }
}

function acharLinha(aba, id) {
  if (!aba || aba.getLastRow() < 2) return 0;
  var ids = aba.getRange(2, 1, aba.getLastRow() - 1, 1).getValues();
  var alvo = texto(id);
  for (var i = 0; i < ids.length; i++) {
    if (texto(ids[i][0]) === alvo) return i + 2;
  }
  return 0;
}

function buscarPorTelefone(aba, telefone) {
  if (aba.getLastRow() < 2) return null;
  var n = aba.getLastRow() - 1;
  var tels = aba.getRange(2, 5, n, 1).getValues();
  var nomes = aba.getRange(2, 4, n, 1).getValues();
  for (var i = 0; i < tels.length; i++) {
    if (limparTelefone(tels[i][0]) === telefone) {
      return { cliente: texto(nomes[i][0]) || '(sem nome)', linha: i + 2 };
    }
  }
  return null;
}

// ============================================================
//  JORNADA
// ============================================================

function getJornada(idVisita) {
  var aba = SpreadsheetApp.openById(ID_PLANILHA).getSheetByName(ABA_ATENDIMENTOS);
  if (!aba || aba.getLastRow() < 2) {
    return { atendimentos: [], etapas: [], total: 0, dias: 0 };
  }

  var dados = aba.getRange(2, 1, aba.getLastRow() - 1, 13).getValues();
  var alvo = texto(idVisita);
  var lista = [];

  for (var i = 0; i < dados.length; i++) {
    if (texto(dados[i][1]) !== alvo) continue;
    var q = dados[i][2];
    lista.push({
      ts: horaLocal(q),
      data: formatarDataHora(q),
      tipo: texto(dados[i][4]),
      etapa: texto(dados[i][5]) || 'CAPTAÇÃO',
      resultado: texto(dados[i][6]),
      motivo: texto(dados[i][7]),
      proximoContato: formatarData(dados[i][8]),
      proximaAcao: texto(dados[i][9]),
      observacao: texto(dados[i][10]),
      criadoPor: texto(dados[i][11]).replace('vend_', '')
    });
  }

  var crono = lista.slice().sort(function(a, b) { return a.ts - b.ts; });
  var etapas = [], atual = '', inicio = 0;

  crono.forEach(function(a) {
    if (a.etapa !== atual) {
      if (atual) {
        etapas.push({ etapa: atual, dias: Math.round(((a.ts - inicio) / 86400000) * 10) / 10 });
      }
      atual = a.etapa;
      inicio = a.ts;
    }
  });
  if (atual) {
    etapas.push({ etapa: atual, dias: Math.round(((new Date().getTime() - inicio) / 86400000) * 10) / 10 });
  }

  lista.sort(function(a, b) { return b.ts - a.ts; });

  return {
    atendimentos: lista, etapas: etapas, total: lista.length,
    primeira: crono.length ? formatarDataHora(new Date(crono[0].ts)) : '',
    ultima: crono.length ? formatarDataHora(new Date(crono[crono.length - 1].ts)) : '',
    dias: crono.length > 1
      ? Math.floor((crono[crono.length - 1].ts - crono[0].ts) / 86400000) : 0
  };
}

// ============================================================
//  IMPORTAÇÃO DOS LEADS ANTIGOS
// ============================================================

/**
 * Rode UMA VEZ. Traz os leads da planilha antiga para a nova,
 * sem duplicar quem já foi importado.
 */
function importarLeadsAntigos() {
  var planilha = SpreadsheetApp.openById(ID_PLANILHA);
  var nova = planilha.getSheetByName(ABA_VISITAS);

  var antiga;
  try {
    antiga = SpreadsheetApp.openById(ID_PLANILHA_ANTIGA);
  } catch (e) {
    return 'Não consegui abrir a planilha antiga: ' + e.message;
  }

  if (!nova) return 'Aba Visitas não existe na planilha nova.';

  // telefones já cadastrados na nova
  var existentes = {};
  if (nova.getLastRow() >= 2) {
    var t = nova.getRange(2, 5, nova.getLastRow() - 1, 1).getValues();
    t.forEach(function(x) { var n = limparTelefone(x[0]); if (n) existentes[n] = true; });
  }

  var linhas = [];
  var vistos = {};
  var pulados = 0;

  function adicionar(vendedor, data, cliente, telefone, cidade, uf, bairro,
                     endereco, numero, cep, usina, obs, status, kwpCol) {
    var tel = limparTelefone(telefone);
    var nome = texto(cliente);
    if (!nome) return;

    var chave = tel || ('NOME:' + nome.toLowerCase() + '|' + texto(cidade).toLowerCase());
    if (existentes[chave] || vistos[chave]) { pulados++; return; }
    vistos[chave] = true;

    var etapa = normalizarEtapa(status);

    linhas.push([
      Utilities.getUuid(),
      data || new Date(),
      vendedor,
      nome,
      tel,
      texto(cidade),
      texto(uf) || 'ES',
      texto(bairro),
      texto(endereco),
      texto(numero),
      texto(cep),
      numero(usina) || numero(kwpCol),
      '', '', etapa, '',
      '', '', '', data || new Date()
    ]);
  }

  // --- aba Visitas da planilha antiga ---
  var abaV = antiga.getSheetByName('Visitas');
  if (abaV && abaV.getLastRow() >= 2) {
    var d = abaV.getRange(2, 1, abaV.getLastRow() - 1, 28).getValues();
    for (var i = 0; i < d.length; i++) {
      adicionar(
        texto(d[i][0]),                    // vendedor
        lerData(d[i][1]),                  // data
        texto(d[i][2]),                    // cliente
        d[i][5],                           // telefone
        texto(d[i][3]),                    // cidade
        texto(d[i][24]),                   // uf
        texto(d[i][23]),                   // bairro
        texto(d[i][4]),                    // endereço
        texto(d[i][22]),                   // número
        texto(d[i][21]),                   // cep
        d[i][6],                           // usina
        texto(d[i][9]),                    // obs
        texto(d[i][18]),                   // status
        d[i][26]                           // kwp
      );
    }
  }

  // --- aba café com música ---
  var abaC = antiga.getSheetByName('cafe com musica ') || antiga.getSheetByName('cafe com musica');
  if (abaC && abaC.getLastRow() >= 3) {
    var c = abaC.getRange(3, 1, abaC.getLastRow() - 2, 11).getValues();
    for (var j = 0; j < c.length; j++) {
      adicionar(
        'cafe_com_musica',
        lerData(c[j][1]),
        texto(c[j][3]),
        c[j][6],
        texto(c[j][4]),
        'ES',
        texto(c[j][5]),
        '-', '', '',
        c[j][7],
        texto(c[j][8]),
        texto(c[j][9]),
        ''
      );
    }
  }

  if (!linhas.length) {
    return 'Nada a importar. ' + pulados + ' já existiam.';
  }

  // grava em blocos
  var inicio = nova.getLastRow() + 1;
  var lote = 300;
  for (var k = 0; k < linhas.length; k += lote) {
    var parte = linhas.slice(k, k + lote);
    nova.getRange(inicio + k, 1, parte.length, 20).setValues(parte);
  }

  return linhas.length + ' lead(s) importado(s). ' + pulados + ' já existiam e foram ignorados.';
}

function normalizarEtapa(s) {
  var t = texto(s).toUpperCase();
  if (!t) return 'VISITA';
  if (t.indexOf('ENTREGA OR') === 0 || t === 'ORÇAMENTO' || t === 'ORÇAMENTO ENVIADO') {
    return 'ORÇAMENTO ENTREGUE';
  }
  if (t === 'FECHADO' || t === 'GANHO' || t === 'VENDIDO' || t === 'FECHADA') return 'GANHO';
  if (t.indexOf('PERDID') === 0 || t === 'CANCELADO') return 'PERDIDO';
  if (t.indexOf('NEGOCIA') === 0) return 'NEGOCIAÇÃO';
  if (ETAPAS.indexOf(t) >= 0) return t;
  return 'VISITA';
}

function lerData(v) {
  if (!v) return '';
  if (v instanceof Date) return v;
  var s = texto(v);
  var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  var d = new Date(s);
  return isNaN(d.getTime()) ? '' : d;
}

// ============================================================
//  RELATÓRIO
// ============================================================

function relatorioSemanal() {
  var p = getTudo({ gestor: true, id: '' });
  var r = p.resumo;
  var l = [];

  l.push('MANTENA SOLAR — RELATÓRIO');
  l.push(Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'));
  l.push('');
  l.push('Leads no funil: ' + r.total);
  l.push('Em aberto: ' + r.abertos);
  l.push('Ganhos: ' + r.ganhos + ' | Perdidos: ' + r.perdidos);
  l.push('Conversão: ' + r.conversao + '%');
  l.push('Contatos nesta semana: ' + r.semana);
  l.push('Sem próximo contato: ' + r.semProximo);
  l.push('Contato vencido: ' + r.atrasados);
  l.push('');
  l.push('POR ETAPA');
  ETAPAS.forEach(function(e) { l.push('  ' + e + ': ' + (r.porEtapa[e] || 0)); });
  l.push('');
  l.push('POR VENDEDOR');

  var pv = {};
  p.visitas.forEach(function(v) {
    var k = v.vendedorNome || '(sem)';
    if (!pv[k]) pv[k] = { n: 0, g: 0, p: 0 };
    pv[k].n++;
    if (v.etapa === 'GANHO') pv[k].g++;
    if (v.etapa === 'PERDIDO') pv[k].p++;
  });
  Object.keys(pv).sort().forEach(function(k) {
    l.push('  ' + k + ': ' + pv[k].n + ' leads | ' + pv[k].g + ' ganhos | ' + pv[k].p + ' perdas');
  });

  return l.join('\n');
}

// ============================================================
//  UTILITÁRIOS
// ============================================================

function texto(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/\s+/g, ' ').trim();
}

function limparTelefone(t) {
  var n = String(t || '').replace(/\D/g, '');
  if (n.indexOf('55') === 0 && n.length > 11) n = n.substring(2);
  return n;
}

function numero(v) {
  if (typeof v === 'number') return v;
  var s = texto(v).replace(/\s*(kwhp|kwh|kwp|kw)\s*$/i, '').replace('R$', '').trim();
  if (!s || /[^\d.,]/.test(s)) return '';
  if (s.indexOf('.') > -1 && s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.indexOf(',') > -1) s = s.replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  var n = parseFloat(s);
  return isNaN(n) ? '' : n;
}

function formatarData(d) {
  if (!d) return '';
  if (d instanceof Date) return Utilities.formatDate(d, 'America/Sao_Paulo', 'dd/MM/yyyy');
  return texto(d);
}

function formatarDataHora(d) {
  if (!d) return '';
  if (d instanceof Date) return Utilities.formatDate(d, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
  return texto(d);
}

function isoData(d) {
  if (!d) return '';
  if (d instanceof Date) return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
  var m = texto(d).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return m[3] + '-' + m[2] + '-' + m[1];
  return texto(d);
}

function virarData(txt) {
  var s = texto(txt);
  var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  var m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) return new Date(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]));
  var d = new Date(s);
  return isNaN(d.getTime()) ? '' : d;
}

function diasDesde(d) {
  if (!d) return null;
  var data = (d instanceof Date) ? d : lerData(d);
  if (!(data instanceof Date) || isNaN(data.getTime())) return null;
  return Math.floor((new Date() - data) / 86400000);
}

function diasAte(d) {
  if (!d) return null;
  var data = (d instanceof Date) ? d : lerData(d);
  if (!(data instanceof Date) || isNaN(data.getTime())) return null;
  var hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  var alvo = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  return Math.round((alvo - hoje) / 86400000);
}

// ============================================================
//  TESTE E MANUTENÇÃO
// ============================================================

function testarTudo() {
  var r = [];
  r.push('=== TESTE ===');

  var p;
  try {
    p = SpreadsheetApp.openById(ID_PLANILHA);
    r.push('[1] Planilha: OK — ' + p.getName());
  } catch (e) {
    r.push('[1] Planilha: ERRO — ' + e.message);
    return r.join('\n');
  }

  [ABA_VISITAS, ABA_ATENDIMENTOS, ABA_USUARIOS].forEach(function(n) {
    var s = p.getSheetByName(n);
    r.push('[2] ' + n + ': ' + (s ? 'OK (' + s.getLastRow() + ' linhas)' : 'NÃO EXISTE'));
  });

  r.push('[3] Vendedores: ' + getVendedores().map(function(v) { return v.nome; }).join(', '));
  r.push('[4] Login Anderson: ' + (verificarLogin('Anderson', '871306').ok ? 'OK' : 'FALHOU'));

  var antes = p.getSheetByName(ABA_VISITAS).getLastRow();
  try {
    var res = salvarVisita({
      vendedor: 'gerent_Anderson', etapa: 'VISITA',
      cliente: 'TESTE ' + new Date().getTime(),
      telefone: '33900000000', cidade: 'Mantenópolis', uf: 'ES', kwp: '500'
    }, { id: 'gerent_Anderson', gestor: true });
    r.push('[5] Gravação: ' + JSON.stringify(res));
  } catch (e) {
    r.push('[5] Gravação: ERRO — ' + e.message);
  }

  Utilities.sleep(800);
  var depois = p.getSheetByName(ABA_VISITAS).getLastRow();
  r.push('[6] Visitas: ' + antes + ' -> ' + depois +
         (depois > antes ? '  GRAVOU ✓' : '  NÃO GRAVOU ✗'));

  var t = getTudo({ id: 'gerent_Anderson', gestor: true });
  r.push('[7] Funil: ' + t.resumo.total + ' leads | agenda semana: ' + t.agenda.length);

  r.push('');
  r.push('Rode limparTeste() para apagar o registro de teste.');
  return r.join('\n');
}

function limparTeste() {
  var p = SpreadsheetApp.openById(ID_PLANILHA);
  var aba = p.getSheetByName(ABA_VISITAS);
  var n = 0;

  if (aba && aba.getLastRow() >= 2) {
    var d = aba.getRange(2, 1, aba.getLastRow() - 1, 20).getValues();
    for (var i = d.length - 1; i >= 0; i--) {
      if (texto(d[i][3]).indexOf('TESTE ') === 0) { aba.deleteRow(i + 2); n++; }
    }
  }

  var at = p.getSheetByName(ABA_ATENDIMENTOS);
  if (at && at.getLastRow() >= 2) {
    var d2 = at.getRange(2, 1, at.getLastRow() - 1, 13).getValues();
    for (var j = d2.length - 1; j >= 0; j--) {
      if (texto(d2[j][12]).indexOf('TESTE ') === 0) { at.deleteRow(j + 2); n++; }
    }
  }
  return n + ' linha(s) de teste removida(s).';
}
