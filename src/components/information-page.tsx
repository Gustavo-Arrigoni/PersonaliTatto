import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
type Section = { title: string; text: string };
const pages: Record<
  string,
  { eyebrow: string; title: string; intro: string; sections: Section[] }
> = {
  sobre: {
    eyebrow: "NOSSA PRIMEIRA VERSÃO",
    title: "Arte que conecta histórias.",
    intro:
      "PersonaliTatto é um projeto de plataforma para aproximar pessoas, artistas e estúdios de tatuagem. Esta versão valida o design e os fluxos da experiência.",
    sections: [
      {
        title: "O que você pode explorar",
        text: "Descubra estúdios fictícios, filtre artes originais de demonstração, organize referências em projetos e acompanhe pedidos locais. Profissionais podem testar o cadastro de artes, o gerenciamento da equipe e os planos simulados.",
      },
      {
        title: "Um novo olhar para a tatuagem",
        text: "A esfera interativa apresenta a base tridimensional da plataforma. Modelos humanos, tons de pele, poses e aplicação realista de desenhos estão previstos para a próxima fase.",
      },
      {
        title: "Construído para evoluir",
        text: "O projeto usa Next.js, TypeScript, React Three Fiber e dados locais. A integração futura com autenticação e persistência real está documentada no repositório.",
      },
    ],
  },
  contato: {
    eyebrow: "CONTINUE A CONVERSA",
    title: "Toda conexão começa com uma ideia.",
    intro:
      "Esta é uma demonstração visual da PersonaliTatto. Os estúdios e profissionais apresentados são fictícios.",
    sections: [
      {
        title: "Para conhecer a plataforma",
        text: "Explore os perfis de demonstração pela página Entrar. Você pode experimentar a área do cliente, o painel do estúdio e a administração geral no mesmo navegador.",
      },
      {
        title: "Para profissionais",
        text: "Conheça os planos planejados e crie um estúdio local de demonstração. Não há cobrança, contratação ou publicação comercial de perfis nesta versão.",
      },
      {
        title: "Canais de contato",
        text: "Os canais oficiais de atendimento e redes sociais ainda não foram definidos. Nenhum formulário nesta demonstração envia mensagens, e os botões de WhatsApp não contatam terceiros.",
      },
    ],
  },
  termos: {
    eyebrow: "TERMOS DA DEMONSTRAÇÃO",
    title: "Clareza em cada etapa.",
    intro:
      "Estas informações descrevem o funcionamento do MVP visual. Antes do lançamento comercial, serão publicados termos específicos para o serviço real.",
    sections: [
      {
        title: "Ambiente de teste",
        text: "Cadastros, estúdios, assinaturas e pedidos são demonstrações locais. Não existe autenticação segura, verificação de identidade, pagamento, envio de e-mails ou contratação de tatuagens.",
      },
      {
        title: "Projetos e artes",
        text: "As artes de demonstração são referências para testar os fluxos. Artes de um estúdio permanecem associadas à sua origem e são excluídas de pedidos destinados a outro. Imagens enviadas devem ser de sua autoria ou ter autorização de uso.",
      },
      {
        title: "Prévia tridimensional",
        text: "A esfera é renderizada em 3D e permite rotação e zoom. Não há aplicação de tatuagens sobre o corpo. As referências salvas não representam resultado estético, dimensões reais ou aconselhamento profissional.",
      },
      {
        title: "Dados deste navegador",
        text: "Use informações fictícias. Dados e imagens ficam no armazenamento local e podem ser perdidos ao limpar o navegador. Os perfis de demonstração podem ser acessados por qualquer pessoa com acesso a este navegador.",
      },
    ],
  },
  privacidade: {
    eyebrow: "PRIVACIDADE NO MVP",
    title: "Seus dados, neste navegador.",
    intro:
      "Esta demonstração não possui backend de contas. Abaixo está a descrição do armazenamento implementado nesta versão.",
    sections: [
      {
        title: "O que fica salvo",
        text: "Nomes e e-mails fictícios, perfis de estúdio, referências enviadas, projetos, pedidos, planos simulados e o perfil ativo são armazenados localmente na chave personalitatto:demo:v1. Uma seleção temporária pode ficar em sessionStorage, na chave personalitatto:preview-draft, durante o acesso ao simulador. Senhas digitadas nos formulários não são persistidas.",
      },
      {
        title: "Como apagar os dados",
        text: "Acesse Configurações no painel do estúdio e restaure a demonstração, ou limpe os dados deste site nas configurações do navegador. Sair de um perfil encerra a sessão local, mas preserva os projetos e cadastros locais.",
      },
      {
        title: "Imagens e serviços",
        text: "As imagens e fontes do site são servidas com a própria aplicação. Os pedidos não abrem conversas com números fictícios nem enviam mensagens. Nenhum formulário desta versão transmite seus dados a um serviço de autenticação.",
      },
      {
        title: "Antes de usar em produção",
        text: "Autenticação real, políticas de acesso entre estúdios, persistência em nuvem e os documentos definitivos do serviço ainda precisam ser implementados e revisados. Não cadastre dados pessoais reais ou sensíveis nesta demonstração.",
      },
    ],
  },
};
export function InformationPage({ kind }: { kind: keyof typeof pages }) {
  const p = pages[kind];
  return (
    <div className="page-shell article-content">
      <Link className="text-link" href="/">
        <ArrowLeft size={14} />
        Voltar ao início
      </Link>
      <div className="page-heading" style={{ marginTop: 40 }}>
        <span className="eyebrow">{p.eyebrow}</span>
        <h1>{p.title}</h1>
        <p>{p.intro}</p>
      </div>
      {p.sections.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </section>
      ))}
      <div className="notice">
        <Info size={17} />
        <p>
          MVP visual e funcional de demonstração. Nenhum pagamento ou contato
          comercial é realizado.
        </p>
      </div>
      <div className="inline-actions" style={{ marginTop: 30 }}>
        <Link className="button" href="/entrar/">
          Explorar os perfis demo <ArrowUpRight size={15} />
        </Link>
        <Link className="button secondary" href="/estudios/">
          Conhecer estúdios <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
