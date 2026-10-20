# Arquitetura — MVP PersonaliTatto

Verificado em **20/10/2026**, data do cliente em America/Sao_Paulo.

## Estado implementado

A aplicação usa Next.js App Router, React e TypeScript. `next.config.ts` configura `output: 'export'`, URLs com barra final e imagens sem otimização do servidor. O resultado da build é um site estático em `out/`; não há API própria, Server Actions de persistência, banco de dados, pagamentos ou autenticação real. Todas as operações demonstrativas acontecem no navegador.

O layout raiz envolve as rotas com `DemoProvider` e `SiteShell`. A identidade visual usa estilos globais em `src/app/globals.css`, módulos CSS para os fluxos de cliente e administração, fontes locais e ícones Lucide. React Hook Form e Zod validam formulários; CSS compõe animações de interface e respeita movimento reduzido. O inventário de mídia e as licenças estão em [ASSETS.md](ASSETS.md).

## Mapa do código

| Módulo                               | Responsabilidade atual                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `src/lib/types.ts`                   | Entidades do domínio, estado da demo, contratos iniciais de repositórios e transformação futura        |
| `src/lib/demo-data.ts`               | Fábrica de dados fictícios; restauração usa cópia independente dos fixtures                            |
| `src/lib/demo-store.tsx`             | Contexto React, sessão local, notificações, reset e persistência em localStorage                       |
| `src/lib/rules.ts`                   | Exclusividade por estúdio, cópia de projetos, limite de publicação, destino de login e texto do pedido |
| `src/components/site-shell.tsx`      | Navegação, menu móvel e estrutura compartilhada                                                        |
| `src/components/landing.tsx`         | Hero, carrossel, apresentação, estúdios e artes em destaque                                            |
| `src/components/discovery.tsx`       | Pesquisa de estúdios, perfil, galeria e detalhes de artes                                              |
| `src/components/plans.tsx`           | Planos demonstrativos e convite ao cadastro profissional                                               |
| `src/components/client-flows.tsx`    | Formulários de acesso/cadastro/recuperação, projetos e solicitação de orçamento                        |
| `src/components/admin-panels.tsx`    | Gestão local de estúdio, artes, equipe, pedidos, assinatura e administração geral                      |
| `src/components/simulator.tsx`       | Composição da interface do simulador, referências selecionadas e salvamento local                      |
| `src/components/model-3d-viewer.tsx` | Fachada independente para carregar o renderer apenas no cliente                                        |
| `src/components/sphere-scene.tsx`    | Cena real Three.js/React Three Fiber/Drei, iluminação e OrbitControls                                  |

## Rotas navegáveis

| Rota                                  | Tela e parâmetros                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `/`                                   | Landing pública                                                                   |
| `/estudios/`                          | Busca por nome/localização e filtros                                              |
| `/estudios/perfil/?id=noir`           | Perfil do estúdio identificado pelo ID local                                      |
| `/galeria/`                           | Artes publicadas e filtros                                                        |
| `/planos/`                            | Comparação das assinaturas demonstrativas                                         |
| `/entrar/?next=/meus-projetos/`       | Acesso demonstrativo e preservação de destino interno                             |
| `/cadastro/`                          | Cadastro local de cliente ou estúdio                                              |
| `/recuperar-senha/`                   | Validação e estado de confirmação demonstrativo, sem envio de e-mail              |
| `/simulador/` e `/demo/`              | Interface do simulador com esfera temporária                                      |
| `/simulador/?project=...`             | Reabre projeto do perfil local; `art` e `studio` inicializam referências/contexto |
| `/meus-projetos/`                     | Listar, criar, renomear, copiar, excluir e reabrir projetos do perfil             |
| `/orcamentos/?project=...&studio=...` | Preparar pedido para um estúdio e consultar histórico                             |
| `/estudio/painel/`                    | Resumo do estabelecimento                                                         |
| `/estudio/perfil/`                    | Edição do perfil comercial local                                                  |
| `/estudio/artes/`                     | Gestão de artes, tags e publicação                                                |
| `/estudio/equipe/`                    | Membros e autores associados                                                      |
| `/estudio/orcamentos/`                | Cards de pedidos com detalhes e atualização de status                             |
| `/estudio/assinatura/`                | Plano local, sem cobrança                                                         |
| `/estudio/configuracoes/`             | Configurações demonstrativas                                                      |
| `/admin/`                             | Gestão local de estúdios, planos e estado ativo                                   |

Os parâmetros são lidos no cliente porque o artefato exportado é estático. Eles não representam autorização: o perfil e o proprietário do registro são conferidos pelos fluxos locais. `safeNextRoute` restringe o retorno de login a destinos internos e evita ciclos entre telas de acesso. Na integração real, a mesma decisão precisará ocorrer no servidor.

## Estado, persistência e limites

`DemoState` reúne estúdios, membros, artes, perfis, projetos, pedidos e a sessão demonstrativa. A chave do navegador é `personalitatto:demo:v1`; a hidratação espera a leitura local antes de persistir alterações. O provider verifica a versão e as coleções principais ao restaurar, confirma que a sessão aponta para um perfil existente e sincroniza mudanças entre abas por eventos de storage. Essa checagem não é validação profunda nem barreira de segurança. Se o armazenamento estiver bloqueado ou cheio, o estado continua em memória e a interface avisa.

`Profile.role` seleciona as experiências de cliente, estúdio e administrador. Os gates e filtros são úteis para demonstrar os percursos, mas os dados e papéis podem ser alterados pelas ferramentas do navegador. Não usar dados pessoais reais. Senhas dos formulários são validadas na interface e não viram credenciais de autenticação; recuperação não envia mensagens.

Uploads do simulador aceitam PNG, JPEG e WebP com limite local de 2 MB por imagem, lidos como data URLs. Não há processamento, remoção de fundo, inspeção segura de arquivo ou Storage. Vários arquivos podem exceder a cota total do localStorage; o aviso de persistência cobre essa condição. A mesma referência não é aplicada à esfera.

## Contratos existentes e substituição da persistência

Em `src/lib/types.ts` já existem:

```ts
interface StudioRepository {
  list(): Promise<Studio[]>;
  find(id: string): Promise<Studio | undefined>;
}
interface ProjectRepository {
  list(userId: string): Promise<Project[]>;
  save(project: Project): Promise<void>;
}
interface AuthRepository {
  current(): Promise<Profile | null>;
  signOut(): Promise<void>;
}
```

São interfaces de preparação. Não há adaptadores concretos ligados a elas: os componentes atuais usam `useDemo()` diretamente. A conexão real precisa implementar os adaptadores, ampliar contratos para artes/equipe/pedidos/assinaturas e substituir gradualmente essas leituras e mutações por serviços de aplicação. Um `userId` recebido por parâmetro de interface não é confiável; o adaptador conectado deverá restringir a consulta ao usuário autenticado e às políticas do banco. Não basta preencher variáveis de ambiente.

`Project` mantém `tattoos: ProjectTattoo[]`, em vez de uma imagem final achatada. Cada item tem ID próprio, origem, arte, eventual estúdio proprietário, região/dimensões opcionais e `transform` opcional. `TattooTransform` já descreve posição, rotação, escala, opacidade e espelhamento; a interface de edição correspondente está sinalizada como fase 2 e não atua no renderer atual.

## Regras demonstradas

`canUseTattooAtStudio` verifica primeiro `ownerStudioId`: uma arte de outro estúdio continua bloqueada mesmo se um item malformado disser `origin: 'upload'`. Somente uma referência própria sem proprietário de estúdio pode ser compartilhada livremente. `getProjectConflicts` identifica itens incompatíveis; `getAllowedTattoos` seleciona os permitidos; `makeProjectCopy` cria novos IDs para projeto e itens, preserva o projeto de origem e, quando informado um destino, copia apenas os itens autorizados para esse estúdio.

A solicitação oferece trocar de estúdio, ocultar itens conflitantes no envio ou criar uma cópia compatível. O pedido salva `items` por `structuredClone`, como fotografia dos itens permitidos naquele momento; alterações posteriores do projeto não reescrevem esse snapshot. A referência WhatsApp pode ser copiada. Os contatos fictícios não disparam envio a negócios reais; links externos só fazem sentido após configurar um contato válido. Status disponíveis: `pending`, `contacted`, `completed`.

O helper `canPublishArt` representa Básico com até 25 artes publicadas e Pro sem esse teto. Alguns fluxos exibem/limitam capacidade localmente. Isso não é controle de assinatura, quota transacional ou cobrança: produção exigirá verificação no backend.

## Fronteira do renderer

`Model3DViewer` recebe `autoRotate`, `lightMode`, `resetKey` e `className`; carrega `sphere-scene` por `next/dynamic` com SSR desabilitado. Hero e simulador compartilham a mesma fachada. A esfera tem geometria real, material físico, textura procedural local, luz azul/aço e vermelho suave, zoom e rotação com mouse/toque. Não usa um PNG como substituto da geometria.

O renderer verifica suporte WebGL, mostra fallback, reduz o pixel ratio, observa visibilidade para suspender quadros fora da tela e respeita movimento reduzido ao controlar autorrotação. A integração humana deverá substituir a cena e evoluir o contrato dessa fachada, preservando a navegação e a estrutura lateral. Não há modelo humano, seleção anatômica funcional ou projeção de tatuagens nesta entrega. Ver [PHASE-2.md](PHASE-2.md).

## Fronteira futura do backend

O caminho de implantação atual é estático. Supabase Auth por cookies e autorização no servidor exigem runtime Next.js apropriado, revisão de `output: 'export'`, clientes browser/server, renovação de sessão, handlers e políticas de dados/arquivos. A preparação detalhada está em [SUPABASE.md](SUPABASE.md). Este repositório não cria projeto, tabela, bucket, política ou migração no Supabase.
