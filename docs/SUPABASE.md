# Supabase — preparação para integração futura

Revisado em **20/10/2026**, America/Sao_Paulo. Este guia foi conferido com o changelog e a documentação oficial do Supabase nessa data. É um desenho de integração para o produto, não uma integração instalada.

## O que existe agora

A aplicação funciona com fixtures e localStorage via `DemoProvider`. Não há pacote Supabase instalado, cliente browser/server, conexão Auth, banco, bucket, política RLS, migração ou webhook ativo. **Preencher `.env.example` ou copiá-lo para `.env.local` não ativa o Supabase.** Nenhum recurso remoto foi criado ou alterado para produzir esta documentação.

`next.config.ts` exporta um site estático. Antes de autenticar e proteger dados também no servidor, será necessário adotar um runtime Next.js compatível e revisar `output: 'export'`. O site estático de demonstração continua independente de chaves externas.

## Verificação de compatibilidade

Foi consultado o [índice oficial do changelog](https://supabase.com/changelog.md), incluindo mudanças marcadas como Breaking Change. Dois avisos são relevantes para a futura configuração:

- A exposição de novas tabelas pela Data API passa a exigir concessões explícitas; o aviso prevê aplicação a todos os projetos em **30/10/2026**. Não depender de permissões implícitas de tabelas novas. [Aviso oficial sobre Data API](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
- Um conjunto antigo de cifras TLS 1.2 será desativado em **10/11/2026** nas APIs HTTP. Usar clientes e sistemas atualizados e testar os ambientes de implantação. [Aviso oficial sobre TLS](https://supabase.com/changelog/cbc-tls-ciphers-deprecated).

Avisos de extensões PostgreSQL e cenários self-hosted também foram revisados no índice; este repositório não possui banco ou extensão a migrar. Repetir a consulta ao changelog e às versões de SDK/CLI quando a implementação começar.

## Ambiente e clientes planejados

O exemplo de ambiente contém apenas placeholders vazios:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

A chave publishable identifica o cliente público. Uma chave secret ou a chave legada `service_role` jamais deve entrar em `NEXT_PUBLIC_*`, código de cliente, arquivos em `public/`, logs ou ZIP distribuído. Operações normais de usuário devem usar a sessão do próprio usuário e RLS; credenciais privilegiadas só cabem em componentes exclusivos do servidor com autorização própria. [Tipos de chave oficiais](https://supabase.com/docs/guides/getting-started/api-keys).

Na fase de conexão, instalar versões testadas e fixadas de `@supabase/supabase-js` e `@supabase/ssr`, registrando o lockfile. Os imports planejados são:

```ts
// Exemplo de preparação; não existe código de integração ativo no MVP.
import { createBrowserClient, createServerClient } from "@supabase/ssr";
```

Criar utilitários separados para navegador e servidor, por exemplo `src/lib/supabase/client.ts` e `server.ts`. Configurar cookies e renovação de tokens no Proxy do Next.js, seguindo a versão vigente do framework; manter esses arquivos fora do bundle de cliente quando manipularem contexto do servidor. Confirmar identidade no servidor com o método oficial adequado (`getClaims` ou `getUser`, conforme a necessidade de validação atual); não autorizar por `getSession` ou por estado local. Respostas autenticadas e respostas com `Set-Cookie` não podem ser compartilhadas por cache entre usuários. [Guia oficial de SSR para Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).

Substituir os formulários demonstrativos por fluxos reais de cadastro, confirmação, login, logout e recuperação, com redirects permitidos configurados. Não migrar senhas da demo: elas não são credenciais persistidas. Estúdio cadastrado deve receber ownership/membership por operação confiável no backend; a escolha de um papel na tela não concede poderes administrativos.

## Mapeamento das entidades

Os nomes abaixo são a proposta para o banco futuro. A coluna atual explica exatamente o que já está em `src/lib/types.ts` e no estado local; não significa que existam tabelas.

| Entidade solicitada | Forma atual                                            | Tabela/relação planejada e invariantes                                                                                                                     |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profiles            | `Profile`; coleção `profiles`                          | `profiles`, ID ligado a `auth.users.id`; usuário altera campos pessoais permitidos, sem elevar papel ou trocar ownership                                   |
| Studios             | `Studio`; coleção `studios`                            | `studios`; proprietário confiável, slug único, estado comercial e campos públicos separados dos internos                                                   |
| Members             | `StudioMember`; coleção `members`                      | `studio_members`; vínculo ao estúdio, autoria e eventual usuário autenticado, papel e convite aceito. O registro de autor atual não é autorização de login |
| Subscriptions       | `Subscription` como tipo; plano atual em `Studio.plan` | `subscriptions`; estúdio, plano e estado de cobrança vindos do backend/provedor. O status atual `demo` não representa cobrança                             |
| Arts                | `TattooArt`; coleção `arts`                            | `tattoo_arts`; estúdio e autor consistentes, publicação, permissão de demonstração e referências distintas para original privado e preview                 |
| Tags                | `TattooArt.tags: string[]`                             | `tags` e associação `art_tags`; rótulos descritivos normalizados, sem restrição anatômica obrigatória                                                      |
| Projects            | `Project`; coleção `projects`                          | `projects`; proprietário `user_id`, nome, modelo e versão da composição; dados privados por usuário                                                        |
| ProjectTattoos      | `ProjectTattoo[]` embutido em `Project`                | `project_tattoos`; ID independente, projeto, arte ou upload, ownership de origem e transformação editável por item                                         |
| QuoteRequests       | `QuoteRequest`; coleção `quotes`                       | `quote_requests`; cliente e estúdio destino, dados de contato necessários, status e snapshot do contexto do pedido                                         |
| QuoteItems          | `QuoteRequest.items: ProjectTattoo[]` copiado          | `quote_items`; itens imutáveis do snapshot ligados ao pedido, com nomes, origem, imagem permitida e transformações congeladas                              |

As colunas adicionais são proposta de arquitetura do PersonaliTatto. Chaves estrangeiras e verificações devem garantir que um autor pertença ao mesmo estúdio da arte; itens pertençam ao projeto correto; itens de pedido pertençam ao pedido correto; e qualquer estúdio associado seja consistente. Nem o ID enviado pelo navegador nem o texto de um caminho de arquivo provam ownership.

## Autorização por usuário e por estúdio

O backend será a autoridade para cada leitura e mutação. O servidor valida identidade, o domínio verifica a operação, e o banco aplica RLS. Concessões da Data API controlam quais objetos podem ser alcançados; RLS controla as linhas. Habilitar RLS em todas as tabelas de esquemas expostos e conceder somente operações necessárias. Um filtro de interface não substitui essas políticas. [Segurança oficial da Data API](https://supabase.com/docs/guides/api/securing-your-api).

A política de produto proposta é:

- Visitante lê somente perfil comercial ativo, autoria pública e metadados/previews de artes publicadas. `publicDemo` é uma permissão adicional para o carrossel público, não licença para distribuir o original.
- Cliente lê e altera seu perfil e seus projetos; consulta os próprios pedidos e snapshots. Não pode atribuir um projeto a outro `user_id`, alterar ownership da arte ou promover o próprio papel.
- Membro aceito do estúdio acessa apenas o tenant ao qual pertence e as operações liberadas pelo seu papel. Autor sem conta vinculada não ganha acesso ao painel.
- Estúdio destinatário lê o snapshot dos pedidos recebidos e altera apenas campos operacionais permitidos, como status. Não recebe leitura irrestrita de outros projetos do cliente ou de artes de estúdios terceiros.
- Administrador da plataforma recebe permissão por cadastro controlado no backend. Administração deve usar rotas/serviços com auditoria, sem publicar uma chave que bypassa RLS no browser.

Políticas de UPDATE deverão combinar leitura autorizada, `USING` e `WITH CHECK` para impedir transferência indevida de linhas. Claims editáveis de `user_metadata` não serão fonte de autorização; memberships persistidos no banco permitem revogar vínculos sem depender de um papel escolhido pelo cliente. Views devem preservar RLS com `security_invoker` quando apropriado; funções privilegiadas exigem revisão explícita e não devem ser criadas para contornar um erro de permissão. [Referência oficial de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Exclusividade e snapshot de orçamento no backend

A regra local em `src/lib/rules.ts` documenta a intenção, mas produção deve refazê-la usando registros confiáveis do banco. Um comando autenticado recebe o projeto, estúdio e decisão do usuário; o servidor carrega o projeto do cliente, resolve cada arte e seu estúdio verdadeiro e recusa itens de outro estúdio. `origin: 'upload'` vindo do navegador nunca permite apagar `owner_studio_id` de uma arte. Upload próprio precisa ser um arquivo comprovadamente pertencente ao cliente, sem ownership de estúdio.

As opções permanecem: escolher outro destino, excluir os itens conflitantes somente do envio ou criar uma nova cópia compatível. A cópia preserva o original e recebe IDs novos; não transfere propriedade ou licenças das artes. Um pedido para cada estúdio é independente.

Em uma transação, criar `quote_requests` e `quote_items` apenas com os itens permitidos e com dados de contato/nomes/transformações necessários ao destinatário. O snapshot deve congelar a versão enviada; atualizar ou excluir um projeto depois não pode reescrever o pedido existente. Persistir identificadores de origem auditáveis, mas não incluir URLs privadas ou dados de itens estrangeiros no payload do estúdio. Validar arte despublicada/arquivada no envio segundo a regra comercial definida, sem simplesmente confiar em uma imagem antiga guardada no browser.

O estúdio lê os itens do pedido, não a composição inteira que originou a solicitação. Usar chave de idempotência e proteção contra concorrência para não duplicar um pedido em repetição de rede. O teto do plano Básico e permissões de publicação também precisam ser aplicados transacionalmente no backend, inclusive quando dois uploads ocorrem ao mesmo tempo. A cobrança real, se adotada, será atualizada por webhook verificado; mudar `Studio.plan` no cliente nunca concede benefícios.

## Arquivos privados e previews públicos

Proposta de buckets: `art-originals`, `client-uploads` e `project-previews` privados; `catalog-previews` pode conter somente derivações publicáveis. Caminhos incluem IDs de tenant/usuário e objeto, mas as políticas em `storage.objects` precisam confirmar a associação no banco. O backend valida formato, tamanho e ownership. Para substituir arquivos, revisar as permissões INSERT/SELECT/UPDATE necessárias ao upsert. [Controle oficial de acesso ao Storage](https://supabase.com/docs/guides/storage/security/access-control).

Usar download autenticado ou URL assinada de curta duração para conteúdo privado após verificar acesso. Buckets públicos permitem recuperar um arquivo a quem conhece a URL; por isso **originais de artes exclusivas nunca devem ficar em um bucket público**. A marca d'água é apresentação e não controle de acesso. Um preview entregue ao navegador pode ser capturado; não prometer impossibilidade de cópia. [Modelos oficiais de acesso de buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Os SVGs de demonstração em `public/art/` são recursos originais feitos para este MVP e deliberadamente públicos. Não usar esse diretório como destino de uploads reais ou de arquivos exclusivos de futuros estúdios.

## Sequência de implementação e validação

1. Selecionar o ambiente de runtime e projeto Supabase; fixar versões e implementar browser/server Auth antes de conectar os painéis.
2. Implementar adaptadores para `StudioRepository`, `ProjectRepository` e `AuthRepository`; criar contratos para os demais serviços e substituir `useDemo` gradualmente. Os contratos atuais são preparação, sem adaptadores conectados.
3. Criar o esquema em ambiente de desenvolvimento com grants, chaves estrangeiras, constraints e políticas; revisar funções/views e permissões de Storage. Somente nessa etapa gerar migrações usando a CLI descoberta por `--help`, verificar sua versão e revisar o SQL.
4. Executar testes com visitante, dois clientes, dois estúdios e membro revogado: isolamento de projetos/pedidos, tentativa de troca de proprietário, elevação de papel, alteração de ownership, arte estrangeira marcada como upload, acesso direto a arquivo e expiração de URL.
5. Testar snapshot imutável, cópia compatível, repetição idempotente e limite de publicação concorrente. Executar os advisors oficiais e testes de políticas antes de publicar o backend.
6. Definir consentimento, retenção, exclusão, exportação e auditoria adequados ao uso real; revisar o tratamento de dados antes de receber informações pessoais.

Nenhum teste de banco, Auth ou RLS foi executado nesta entrega, pois não existe integração ou recurso Supabase criado. A validação feita aqui é a conferência dos contratos locais e das referências oficiais; uma futura conexão só estará pronta após os testes de autorização acima.
