# Fase 2 — Simulador humano planejado

Documento de preparação. Revisado em **20/10/2026**, America/Sao_Paulo. Os itens abaixo não estão implementados no MVP.

## Ponto de partida

A versão atual usa uma esfera real e interativa com React Three Fiber, Three.js e Drei. As imagens selecionadas são referências em uma lista; não viram adesivos, texturas ou projeções na esfera. As opções anatômicas e de edição aparecem como recursos futuros. O salvamento atual aceita várias referências selecionadas, sem aplicar a regra futura de uma nova tatuagem por salvamento.

A fachada a evoluir é `src/components/model-3d-viewer.tsx`; a cena temporária está em `src/components/sphere-scene.tsx`. A composição da tela e os pontos de extensão `ModelSelector`, `SkinToneSelector`, `RegionSelector` e `TattooEditor` estão em `src/components/simulator.tsx`. Os tipos `ProjectTattoo` e `TattooTransform` em `src/lib/types.ts` preparam identidade e transformação independentes.

## Modelos, pele, poses e câmera

Introduzir modelos humanos masculino e feminino com licença que permita uso comercial na aplicação e distribuição dos recursos necessários ao navegador. Registrar a fonte, versão, licença do modelo, materiais e texturas antes da adoção. Usar malhas otimizadas com UVs, unidades e eixos documentados; manter um identificador/versão de modelo no projeto para reabrir posições corretamente após atualizações.

O seletor deve oferecer uma faixa inclusiva de tons de pele com materiais de aparência consistente sob iluminação neutra e sob a iluminação artística. Preservar textura e detalhe, em vez de apenas cobrir o modelo com uma cor opaca. Prever poses utilizáveis com braços afastados do tronco, visão anterior/posterior e poses opcionais; a transformação precisa acompanhar a superfície quando o esqueleto mudar. As poses disponíveis e suas limitações devem ficar claras na interface.

`RegionSelector` deverá oferecer regiões anatômicas com metadados da malha, limites e alvo de câmera. Escolher antebraço, braço, ombro, costas, peito, abdômen, coxa ou perna deve girar e aproximar suavemente a câmera, preservando um botão de retorno à visão geral e os controles livres de mouse/toque. Zoom automático precisa respeitar movimento reduzido e permitir cancelar a transição. As tags das artes permanecem descritivas: não impedem aplicar uma arte em outra região.

## Importação e remoção de fundo

Preservar a referência original e gerar uma derivação com transparência. Antes de escolher biblioteca, modelo de segmentação ou serviço, conferir licenças comerciais separadas para código, pesos, modelos e conjuntos de recursos distribuídos. Não introduzir serviço pago obrigatório. Um processamento local ou auto-hospedado poderá atender a esse objetivo se qualidade, memória, tempo de carregamento e licença forem adequados; essa escolha ainda precisa de avaliação.

A interface deverá mostrar prévia de fundo removido, manter a imagem original e permitir corrigir ou rejeitar o recorte. Validar MIME real, limites de dimensões/tamanho e decodificação no backend, orientar sobre direitos de uso e tratar falhas com nova tentativa ou uso da referência intacta. Se houver serviço externo, explicar o envio da imagem antes da operação e definir retenção/exclusão. Arquivos pessoais e originais de estúdio ficarão privados; o plano de acesso está em [SUPABASE.md](SUPABASE.md).

## Projeção e transformação por tatuagem

Avaliar projeção por decal e estratégia baseada em UV para os modelos escolhidos, com testes reais de curvatura, costuras, sobreposição, articulações e mudança de pose. O MVP não assume que uma implementação simples de decal atenderá a todas as áreas. Prever seleção por raycast, ancoragem na superfície, normal e orientação locais, profundidade/offset para evitar z-fighting e uma ordem explícita entre tatuagens.

Cada tatuagem deve preservar seu ID e permitir ajustes próprios de posição, dimensão física/escala, rotação, espelhamento e opacidade. Selecionar uma tatuagem não altera as anteriores. A interface deve indicar a peça selecionada, oferecer desfazer/refazer e evitar conflito entre arrastar a câmera e mover a arte. O tom de pele e a iluminação não podem apagar ou recolorir o arquivo original.

O contrato futuro deverá acrescentar a `Project` o identificador/versão do modelo, tom/material de pele e pose. Evoluir `TattooTransform` com convenções documentadas de coordenadas, unidades e ordem de rotação; adicionar a `ProjectTattoo` ancoragem de superfície, versão da projeção, ordem de camada e referência privada da derivação. Manter origem, arte e estúdio proprietário como dados imutáveis definidos pelo servidor. Campos opcionais atuais não são um formato definitivo de projeção.

## Salvar, reabrir e acrescentar

O projeto continua sendo uma composição estruturada de tatuagens independentes. **Não salvar apenas uma textura achatada, screenshot ou corpo com as tatuagens fundidas.** Uma thumbnail derivada pode acelerar a lista de projetos, mas não substitui o estado editável.

No fluxo planejado, o usuário reabre o projeto com todas as tatuagens existentes, seleciona no máximo **uma nova tatuagem por operação de salvamento**, ajusta essa peça e confirma. A gravação acrescenta somente esse novo item e preserva os itens anteriores, inclusive transformações, origem e ownership. Edições e remoções de itens existentes devem ser operações explícitas, sem recriar a composição inteira como imagem. Novas tentativas do mesmo salvamento precisam ser idempotentes para não duplicar o item.

O backend deverá salvar o projeto e seus itens em transação, conferir proprietário, limitar uma inserção nova por comando de salvamento e usar versão do projeto para detectar alterações concorrentes. O ID da tatuagem é estável entre aberturas; cópias de projeto recebem novos IDs sem transferir a propriedade das artes. Pedidos de orçamento continuam snapshots independentes e não são reescritos quando o cliente edita o projeto.

## Critérios de aceitação futuros

- Modelos masculino e feminino, pele, poses e regiões funcionam em desktop e toque com acesso por teclado aos controles da interface.
- Escolher uma região aproxima a área correta; retorno à visão geral restaura enquadramento previsível.
- Cada tatuagem mantém posição, rotação, escala, espelhamento e opacidade após salvar e reabrir, sem alterar as outras.
- Um salvamento acrescenta uma única tatuagem nova; repetição por falha de rede não duplica itens.
- Projetos nunca dependem de uma única imagem achatada para edição; snapshots de pedidos permanecem estáveis.
- Upload e recorte preservam o original privado, apresentam falhas compreensíveis e usam componentes/modelos com licença comercial compatível.
- Trocar de estúdio continua bloqueando artes exclusivas de terceiros no backend; nenhuma imagem original privada é exposta no catálogo.
- Carregamento progressivo, liberação de texturas/geometrias, limites de resolução e suspensão fora da tela mantêm uso aceitável de memória e GPU; testar aparelhos modestos antes de definir orçamento final.

A entrega dessa fase deve ser acompanhada por testes de serialização/reabertura, inserção idempotente, autorização entre contas e validação visual em poses e regiões extremas. Não remover os rótulos de prévia até a projeção humana real estar disponível e verificada.
