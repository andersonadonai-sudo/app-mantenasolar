# app.mantenasolar.com.br

Página de acesso ao sistema de visitas da Mantena Solar.

O app roda dentro do Google Apps Script e grava na planilha.
Este site é só a porta de entrada: abre e redireciona.

- Página: `index.html`
- Destino: variável `APP` dentro do `index.html`

## Por que redirect e não o app aqui

O app precisa conversar com o Google (`google.script.run`) para ler e gravar na
planilha. Isso só funciona se a página estiver sendo servida pelo Apps Script.
Publicar o HTML direto aqui faria o app abrir, mas sem gravar nada.
