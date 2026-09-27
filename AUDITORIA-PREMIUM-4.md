# Impacto — auditoria de software Premium 4.1

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

Siga `ATUALIZAR-GITHUB.txt`. Envie os 18 arquivos do pacote para a raiz do repositório. Esta edição para celular não contém subpastas. Não substitua apenas `sw.js`. Abra o site conectado após a atualização e confira a identificação PREMIUM 4.1.

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
