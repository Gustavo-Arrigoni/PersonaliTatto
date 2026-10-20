# PersonaliTatto

Plataforma de tatuagens — MVP visual e funcional, em português. A identidade **Midnight Steel** combina interfaces escuras, tipografia urbana, artes originais e uma esfera tridimensional real.

## Executar localmente

Requisitos: Node.js 22 LTS e npm 10 ou superior.

```bash
npm install
npm run dev
```

Abra **http://localhost:3000**. Não é necessário configurar variáveis, banco de dados ou qualquer serviço pago. Fontes, fotografias ilustrativas e desenhos são arquivos locais.

Para testar a versão de produção:

```bash
npm run build
npm start
```

O build gera `out/`; `npm start` serve essa exportação estática em http://127.0.0.1:3000. Use `PORT` para escolher outra porta. Não execute build simultaneamente aos testes no servidor de desenvolvimento.

## O que está implementado

- Landing completa: hero, carrossel infinito para a direita, etapas, estúdios, artes, diferenciais, seção profissional, planos, FAQ e rodapé.
- Esfera **Three.js + React Three Fiber + Drei**, com iluminação azul/vermelha, rotação automática, arraste, zoom, controle de luz e fallback WebGL. Importação dinâmica; movimento reduzido e pausa fora da tela.
- Descoberta de estúdios: busca sem distinção de acentos, filtros por cidade, estado e estilo, resultados vazios e perfis individuais.
- Galeria: busca, tags, estilos, modal de detalhes, autoria e seleção de referências para projetos.
- Formulários de cadastro pessoal/profissional, login e prévia de recuperação com React Hook Form e Zod.
- Projetos locais: criar, salvar referências, reabrir, renomear, duplicar, ordenar e excluir. Upload de PNG, JPG ou WebP até 2 MB por arquivo.
- Orçamentos locais: seleção de artes, região e dimensões informadas, observações e prévia da mensagem de WhatsApp.
- Exclusividade: detectar artes de outro estúdio, ocultá-las no pedido ou criar cópia sem elas; preservar original e imagens próprias.
- Painel do estúdio: indicadores derivados dos dados locais, pedidos agrupados por cliente em cards expansíveis, status, galeria CRUD, tags, equipe, perfil e assinatura.
- Planos simulados: Básico com um artista e 25 publicações simultâneas; Studio Pro com equipe e publicações sem limite comercial. Na redução de plano, registros excedentes são preservados, com artes excedentes em rascunho e membros adicionais inativos na interface.
- Administração geral: indicadores, dados de estúdios, planos e ativação/desativação local.
- Layout responsivo, navegação por teclado, foco visível, modais com Escape e movimento reduzido.

## O que é demonstração

**Esta versão não possui autenticação segura, backend ou pagamentos.** A sessão local serve somente para testar papéis. Senhas não são verificadas nem armazenadas. Qualquer pessoa com acesso ao navegador pode abrir os perfis de demonstração.

Os dados ficam na chave `personalitatto:demo:v1` do `localStorage` e não sincronizam entre dispositivos. Limpar os dados do navegador remove as alterações. Quota excedida ou armazenamento indisponível gera aviso e mantém alterações apenas em memória.

Uma seleção não salva pode ser guardada temporariamente em `sessionStorage` (`personalitatto:preview-draft`) durante a entrada no perfil de cliente. Esse rascunho é consumido ao retornar ao simulador e removido ao restaurar a demonstração.

Todos os estúdios, profissionais e pedidos iniciais são fictícios. Imagens dos estúdios foram geradas para ilustrar a experiência; não representam trabalhos realizados ou marcas reais. Os preços **R$ 49,90/mês** e **R$ 79,90/mês** são comerciais planejados, sem checkout ou cobrança.

**O simulador humano não foi implementado.** As artes são referências no projeto; não são aderidas à esfera. Tons de pele, anatomia, poses, remoção de fundo e edição de projeções estão claramente marcados como fase 2. Não existe medição do corpo nem cálculo automático de preço.

O WhatsApp exibe apenas a mensagem demonstrativa e opção de copiar. Não abre conversas com os números fictícios nem afirma ter enviado mensagens. O futuro adaptador pode gerar links gratuitos `https://wa.me/<numero>?text=<mensagem>`, mantendo o envio sob controle do cliente.

## Explorar os perfis

Em **`/entrar/`**, selecione um botão:

| Perfil       | Destino            | Conteúdo                                    |
| ------------ | ------------------ | ------------------------------------------- |
| Cliente demo | `/meus-projetos/`  | Alex Morgan, três projetos e pedidos locais |
| Estúdio demo | `/estudio/painel/` | Noir Tattoo Studio, plano Pro, Maia e Luca  |
| Admin demo   | `/admin/`          | Administração dos seis estúdios             |

Não é preciso digitar uma senha para esses botões. O formulário de entrada pode localizar `alex@example.com`, `noir@example.com` e `admin@example.com`, mas sua senha é somente validada como exemplo de formulário. **Não use uma senha real.** Também é possível cadastrar outro perfil local.

Para restaurar os dados iniciais, entre como Estúdio demo e acesse **Configurações → Restaurar demonstração**. Isso redefine os dados de todos os perfis locais.

## Rotas e roteiro de validação

| Rota                                                | Experiência                                                 |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `/`                                                 | Landing e esfera interativa                                 |
| `/estudios/`                                        | Descoberta: busque `Sorocaba`, `Campinas` ou `Itapetininga` |
| `/estudios/perfil/?id=noir`                         | Perfil do Noir e galeria por profissional                   |
| `/galeria/`                                         | Artes, busca, tags e detalhes                               |
| `/simulador/` ou `/demo/`                           | Prévia pública tridimensional                               |
| `/simulador/?project=project-lunar`                 | Continuar o projeto do Cliente demo                         |
| `/cadastro/`                                        | Criar perfil de cliente local                               |
| `/cadastro/?tipo=profissional&plano=pro`            | Cadastro de estúdio demonstrativo                           |
| `/entrar/`, `/recuperar-senha/`                     | Acesso e recuperação demonstrativos                         |
| `/meus-projetos/`                                   | Organização de projetos de cliente                          |
| `/orcamentos/`                                      | Histórico e solicitação de orçamento                        |
| `/estudio/painel/`                                  | Dashboard do estúdio                                        |
| `/estudio/orcamentos/`                              | Cards expansíveis agrupados por cliente e status            |
| `/estudio/artes/`                                   | Cadastrar, editar, publicar, ocultar e excluir artes        |
| `/estudio/equipe/`, `/estudio/perfil/`              | Profissionais e dados do estabelecimento                    |
| `/estudio/assinatura/`, `/estudio/configuracoes/`   | Planos e restauração local                                  |
| `/planos/`, `/admin/`                               | Planos comerciais e administração geral                     |
| `/sobre/`, `/contato/`, `/termos/`, `/privacidade/` | Informações do MVP                                          |

Para validar exclusividade, entre como Cliente demo e abra **`/orcamentos/?project=project-lunar&studio=linha`**. A serpente pertence ao Noir e não pode entrar no orçamento do Linha Fina. A referência pessoal permanece disponível. Teste ocultar temporariamente e criar cópia; o projeto original deve continuar intacto.

No perfil de Estúdio demo, a aba Pendentes contém dois pedidos de Alex agrupados no mesmo card. Expanda, altere status e confira Concluídos. Alterações são refletidas no histórico do cliente neste navegador.

## Qualidade e testes

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Os testes unitários cobrem exclusividade, cópias independentes, redirecionamentos locais, limite de publicação, mensagens de orçamento e restauração dos fixtures.

Testes de navegador:

```bash
npm run test:e2e
```

O Playwright utiliza Chrome instalado quando disponível. Consulte `playwright.config.ts` para a variável de caminho do navegador e `PLAYWRIGHT_BASE_URL` para usar um servidor existente. Em máquinas sem Chrome/Chromium, instale o navegador do Playwright com `npx playwright install chromium`. Os testes não exigem contas externas. Capturas e relatórios ficam em diretórios ignorados pelo Git.

## Arquitetura e evolução

Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Lucide, React Hook Form/Zod e React Three Fiber. O CSS global define tokens e componentes compartilhados; os fluxos de cliente e administração têm módulos CSS próprios.

O estado ativo usa `DemoProvider`; entidades e interfaces de repositório estão em `src/lib/types.ts`. Os contratos foram preparados para adaptadores futuros, mas a UI ainda consome o contexto local. A conexão real exige implementar esses adaptadores e substituir os acessos ao contexto. **Preencher `.env.example` não ativa Supabase.**

- [Arquitetura e entidades](docs/ARCHITECTURE.md)
- [Plano de integração Supabase, Auth, RLS e isolamento](docs/SUPABASE.md)
- [Especificação obrigatória do simulador humano — fase 2](docs/PHASE-2.md)
- [Origem e licenças dos recursos visuais](docs/ASSETS.md)

`Model3DViewer` é o ponto de substituição da esfera. A fase 2 exige modelos humano masculino/feminino licenciados, projeções em superfícies articuladas, remoção de fundo com uso comercial e transformações independentes em cada tatuagem. O tipo `TattooTransform` já reserva posição, rotação, escala, opacidade e espelhamento. O MVP não grava transformações fictícias.

Para autenticação no servidor, será necessário abandonar a exportação estática e configurar o runtime Next.js com Supabase SSR. Toda validação de propriedade e limites também deverá existir no backend, com RLS e Storage privado; o contexto local não oferece isolamento de segurança.

## Exportar o projeto

```bash
npm run package
```

Gera `artifacts/PersonaliTatto-MVP.zip` com fontes, imagens, documentação, testes e lockfile. Exclui `node_modules`, builds, Git, identidade de hosting e arquivos `.env` privados. Descompacte, entre na pasta e execute `npm install` e `npm run dev`.

## Limitações conhecidas

- Persistência local tem limite de espaço e não é backup. Uploads usam data URLs para permitir uma demonstração sem infraestrutura.
- Links de perfis usam `/estudios/perfil/?id=...` para permitir também estúdios criados em tempo de execução numa exportação estática.
- Cadastro, preços, contatos, recuperação e permissões são demonstrações; não usar com dados reais.
- Originais e o estado local podem ser inspecionados no navegador. Proteção de arquivos exige backend privado; capturas de tela nunca podem ser completamente impedidas.
- Auditoria inicial de dependências: runtime sem alertas; cadeia de desenvolvimento do ESLint/Next apresenta alerta transitivo em `braces`, sem versão corrigida no registro consultado. Não foi aplicado downgrade incompatível do framework para ocultar o alerta.
