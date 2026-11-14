# Impacto — atualização Premium 4.3

Data: 14/11/2026. Base: pacote Premium 4.2, conferido com o index publicado no
repositório do usuário. Banco campo_nr_v2, versão 1, e formato de backup 3 mantidos.

## Alterações desta versão

- Cabeçalho: logo com largura proporcional e nome do aplicativo maior, com regras específicas para telas estreitas.
- Painel do croqui: grupos Desenhar, Cotar e Editar, seleção acessível, navegação de abas por teclado e ajuda contextual.
- Forma inteligente: reconhecimento geométrico local por amostragem, ajuste de linhas, polígonos e elipses. Não usa serviços externos. Casos incertos conservam o desenho original.
- Retorno ao traço original após reconhecimento; histórico de desfazer/refazer preservado.
- Cotas: linear, Ø diâmetro, R raio e anotação com seta. Distinção visual das setas, centro do raio e extensões lineares.
- Anotação de até 500 caracteres e 12 linhas, com quebra de palavras, caixa de texto dentro da folha, recorte de exportação incluindo toda a caixa e exclusão por toque no texto.
- Cotas numéricas e anotações separadas no registro salvo, PDF, HTML e CSV. Backup preserva o subtipo da cota e o texto.
- Formas reconhecidas usam os tipos anteriores do desenho; nenhuma migração destrutiva é necessária. Backups de versões anteriores continuam aceitos.
- Cache PWA atualizado para v4-3; HTML autocontido regenerado a partir do mesmo index.

## Verificação executada em 14/11/2026

- 17 casos de reconhecimento: linhas com ruído, retângulo, quadrado, retângulo girado, triângulo, círculo, elipse e elipse girada. Arco incompleto, L aberto, zigue-zague, oito, duas voltas, ponto e pentágono não foram convertidos indevidamente. Contorno quase fechado também foi reconhecido.
- Código real dos manipuladores de eventos executado em Node com Canvas nativo e interface simulada: reconhecimento, manter à mão livre, desfazer/refazer, quatro tipos de cota, dois toques, rejeição de zero, cancelar diálogo, salvar, reabrir, apagar pela caixa de anotação, grade, zoom e cancelamento do traço por segundo toque.
- Renderização de croqui com fundo raster e de croqui salvo em JPEG.
- Validador real de backup aceitou cotas novas e lineares anteriores; subtipo inválido foi rejeitado.
- PDF real de quatro páginas gerado com jsPDF e fontes locais, texto extraído com acentos, Ø e R, e página de croqui renderizada e conferida visualmente. Anotação completa, sem corte.
- CSV e JSON gerados pelas funções do app; texto da anotação e subtipos preservados.
- Sintaxe dos scripts e integridade do pacote conferidas.

Limitação: o navegador local não iniciou por restrição do ambiente. O navegador
remoto não alcançou a prévia local. Por isso, não se declara teste de interface
visual nem Web Share em navegador nesta versão, tampouco em iPhone/Android físico.
A interface simulada não substitui essa conferência. Os testes históricos abaixo
referem-se à versão 4.2; o fluxo nativo de compartilhamento foi preservado.

## Sugestões de uso

Em campo, use zoom antes de marcar cotas pequenas. Faça uma forma por gesto e
confirme a forma reconhecida; mantenha à mão livre quando precisar de contornos
irregulares. Informe as medidas reais conferidas. Uma foto sem referência de
escala não permite deduzir o tamanho físico do objeto.

---

## Histórico de auditoria da versão anterior

# Impacto — auditoria de software Premium 4.2

Data: 27/09/2026. Base: pacote Premium 3 entregue anteriormente. O banco IndexedDB `campo_nr_v2`, seus quatro repositórios e o formato de backup versão 3 foram preservados.

## Principais correções

- **PDF:** geração local de um arquivo PDF real, com texto selecionável, acentos, páginas A4, capa, resumo por área, fichas numeradas, fotos, croquis, cotas e estimativas. O botão não depende mais da janela de impressão. Imagens são tratadas uma por vez; fontes e bibliotecas acompanham o aplicativo.
- **Compartilhamento:** o arquivo é preparado primeiro. Um novo toque em Compartilhar abre o menu nativo, preservando a interação exigida pelo navegador. Cancelar o menu não descarta o arquivo. Há alternativas de visualizar e baixar, inclusive quando o sistema não compartilha determinado formato.
- **ZIP:** inclui PDF, CSV, anexos com extensão correspondente ao formato real e backup JSON. Pastas organizadas por área e referência do item; compactação de textos/backup em worker. Cancelamento interrompe o trabalho.
- **Organização:** nova central de exportação, escolha de qualidade, filtros por prioridade, limpeza dos filtros, navegação por seções do formulário e indicação de gravação. Ações destrutivas ficam recolhidas.
- **Gravação:** criação de itens e operações de mídia confirmam a transação antes de atualizar a interface; falhas não mostram sucesso. Exclusão de item e anexos ocorre em uma transação. Tratamento de erros em exclusão de foto/croqui, criação e salvamento.
- **Fotos:** processamento protegido contra navegação no meio da importação, associação ao item de origem, liberação das URLs temporárias e aviso quando uma imagem não pode ser processada.
- **Croqui:** zoom de 100% a 600%, pinça, deslocamento, ajuste à tela, formas, cotas, cores, espessuras e histórico independente para cada edição. Gesto de pinça cancela a ferramenta pendente. Cotas aceitam vírgula decimal e separador de milhar; valores não positivos são recusados. Confirmação para descartar alterações; foto de fundo e traços permanecem editáveis no backup.
- **Dados:** validação adicional de backup antes da substituição; transação de restauração com rollback. Seleções “Nenhum/Nenhuma” são exclusivas. Cálculos e exportações interpretam valores brasileiros como `1.234,50`.
- **Offline:** novo cache da PWA inclui bibliotecas, scripts e fontes. Recursos são servidos do mesmo site, sem CDN em tempo de execução.

## Verificações executadas

Dados usados nos testes são fictícios e não acompanham o app instalado.

| Grupo de comandos | Verificação |
| --- | --- |
| Cliente e áreas | Edição, persistência, inclusão, exclusão e cancelamento de área |
| Itens | Criar, nome obrigatório, editar, salvar, voltar, filtros e exclusão com anexos |
| Formulários | Seleções exclusivas, prioridades, dados NR-12/33/35 e fabricação |
| Fotos | Seleção por galeria, processamento, legenda, exclusão, cancelamento e falha de armazenamento |
| Croqui | Livre, linha, retângulo, círculo, texto, cota, cor, espessura, escala, grade, borracha, limpar, desfazer e refazer |
| Navegação do croqui | Zoom, reduzir, mover e ajustar; pinça com eventos touch do navegador sem alteração das formas nem diálogo indevido |
| Croqui sobre foto | Salvar, reabrir e restaurar foto de fundo e seis tipos de registros de desenho |
| PDF | Arquivo `%PDF-`, download, Unicode, valores brasileiros, nomes de todos os itens, cotas, texto longo e paginação |
| Layout do relatório | Relatório demonstrativo de 10 páginas renderizado e inspecionado visualmente |
| ZIP | CRC de todas as entradas, PDF válido, CSV com custos, backup e anexos válidos |
| JSON | Backup e restauração completa; backup inválido recusado sem perda de dados |
| Transações | Restauração abortada após pedidos de limpeza preserva os registros anteriores |
| Compartilhar | Arquivo MIME correto e ativação de usuário no clique; cancelamento e API indisponível simulados |
| Outros formatos | Downloads de CSV e relatório HTML |
| Apagar tudo | Cancelar em cada etapa e confirmar duas vezes; itens e mídia removidos juntos |
| Falta de espaço | Erro de criação simulado sem item fictício na lista; falha de exclusão preserva foto |
| Offline | Recarregar sem rede e gerar PDF com fontes, mídia e scripts em cache |
| Responsividade | Retrato de celular, paisagem e desktop, sem transbordamento horizontal |
| HTML único | Aplicativo autocontido restaurou backup e gerou PDF sem requisições externas; histórico de desfazer não transporta formas entre croquis |
| Sintaxe | Scripts do index, HTML único, PDF, exportação e service worker analisados |

Ambiente: Chromium 153 automatizado com Playwright, emulação móvel com toque e tamanhos de tela de celular/desktop. A API de compartilhamento foi substituída por uma simulação que verifica o arquivo e a ativação do usuário; nenhum documento foi enviado a contatos.

## Limites e conferência no aparelho

Não foi realizada validação física em Safari/iPhone, Android ou WhatsApp real. A seleção do WhatsApp depende dos aplicativos instalados, do navegador e do menu nativo do sistema. Câmera física, instalação via menu do sistema e permissões de compartilhamento devem ser conferidas no dispositivo. O código do seletor de câmera e seu atributo `capture="environment"` foram verificados; a captura física não foi automatizada.

A geração com muitos anexos ainda depende da memória do aparelho. Qualidade equilibrada reduz o tamanho do PDF; o ZIP mantém as imagens e o backup editável. Relatórios e backups incluem os valores de fabricação quando registrados. Todos os itens são exportados, mesmo com filtros ativos.

O app continua local: não oferece sincronização automática entre dispositivos. Faça backup fora do navegador. O croqui é um registro de campo; esta auditoria trata de software e não certifica conformidade normativa.

## Atualização

Siga `ATUALIZAR-GITHUB.txt`. Envie os 18 arquivos do pacote para a raiz do repositório. Esta edição para celular não contém subpastas. Não substitua apenas `sw.js`. Abra o site conectado após a atualização e confira a identificação PREMIUM 4.2.

A publicação no GitHub não foi realizada nesta entrega. O acesso de gravação disponível anteriormente retornou HTTP 403; o ZIP permite atualização manual.

## Dependências e referências técnicas

- jsPDF 4.2.1, licença MIT: https://github.com/parallax/jsPDF/releases/tag/v4.2.1
- fflate 0.8.3, licença MIT: https://github.com/101arrowz/fflate
- DejaVu Sans regular/negrito; licença incluída em `FONT-LICENSE.txt`.
- Compartilhamento de arquivos e ativação transitória: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share

As licenças acompanham o pacote na mesma pasta dos demais arquivos. Nenhum serviço externo recebe os dados para converter o relatório.

## Ajuste da edição 4.1 para celular

Os recursos de PDF, ZIP, interface e croqui da versão 4 foram mantidos. Bibliotecas e fontes agora ficam na raiz, facilitando a seleção de arquivos pelo Android/iPhone. Referências do HTML, carregamento das fontes e cache offline foram atualizados juntos. O novo cache usa `impacto-campo-premium-v4-1`. O banco de dados local não foi renomeado.

Validação adicional da edição 4.1: scripts analisados, 18 arquivos sem subpastas, nenhum recurso HTTP ausente, backup restaurado, dados preservados ao recarregar, fontes/bibliotecas no novo cache e geração real de PDF/ZIP com rede desativada. ZIP gerado conferido por CRC, cabeçalho PDF e conteúdo do backup. Nenhum erro de JavaScript foi registrado.

## Correção 4.2 — compartilhamento de ZIP

Relato recebido: o PDF abre o menu nativo no aparelho, mas o ZIP não abre o menu e o usuário fica com o caminho de download. A documentação e a implementação do Chromium para Android incluem PDF, mas excluem `.zip` e `application/zip` da lista de compartilhamento de arquivos. Isso explica a diferença e é compatível com o relato, embora o aparelho do usuário não tenha sido inspecionado diretamente.

A versão 4.1 verificava `navigator.canShare`, mas deixava um botão desativado com orientação genérica. Além disso, ao chamar `navigator.share`, bloqueava Fechar até a Promise concluir, criando um bloqueio real da interface caso o sistema não respondesse.

Mudanças da versão 4.2:

- Detecta capacidade por arquivo; quando ZIP não é aceito, mostra uma ação explícita de salvar e instruções para compartilhar pelo gerenciador de arquivos.
- Não faz download automático nem tenta alterar extensão/MIME para contornar a restrição do navegador. O pacote permanece um ZIP verdadeiro.
- Reaproveita o PDF já gerado dentro do ZIP para a opção “Compartilhar somente o PDF”, com indicação clara de que os anexos editáveis não são enviados nessa opção.
- Fechar, salvar e navegar continuam disponíveis mesmo com uma solicitação nativa sem resposta. Após 12 segundos, mostra orientação sobre a espera. A API nativa não oferece cancelamento programático; uma segunda solicitação não é disparada enquanto a primeira continua pendente.
- Impede que respostas tardias de um compartilhamento antigo sobrescrevam as mensagens de uma nova exportação.
- Mantém o gerador principal de PDF, as bibliotecas, fontes e o banco local da versão 4.1.

Referências primárias verificadas em 27/09/2026:
- Lista de formatos: https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/renderer/modules/webshare/FILE_TYPES.md
- Implementação Android: https://chromium.googlesource.com/chromium/src/+/HEAD/components/browser_ui/webshare/android/java/src/org/chromium/components/browser_ui/webshare/ShareServiceImpl.java
- Promise de compartilhamento e erros: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share

O compartilhamento direto do ZIP não foi habilitado no Chrome/Android: essa restrição continua pertencendo ao navegador. Não foram enviados arquivos a contatos.

Testes adicionais 4.2 concluídos: ZIP recusado e aceito por `canShare`; nenhum download automático; compartilhamento do PDF interno com ativação no clique e cabeçalho PDF válido; download explícito; cancelamento e recusa nativa; Promise nativa pendente por mais de 12 segundos com fechamento e navegação disponíveis; resposta tardia isolada da nova exportação; PDF principal ainda compartilhável; geração offline; CRC do ZIP e backup íntegros. Teste visual em 390 × 844 confirmou o botão de fechar visível no topo e operável enquanto a solicitação nativa permanece pendente. Nenhum erro de JavaScript. As respostas da API nativa foram simuladas; o WhatsApp real não foi acionado.
