"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { Plan } from "@/lib/types";
import styles from "./admin-panels.module.css";

const plans = [
  {
    id: "basic" as const,
    name: "Básico",
    price: "49,90",
    description: "Seu traço. Seu espaço. Tudo para começar.",
    features: [
      "Perfil completo do estúdio",
      "1 tatuador",
      "Até 25 artes publicadas por vez",
      "Projetos e pedidos de orçamento",
      "Proteção de artes entre estúdios",
      "Integração por link com WhatsApp",
    ],
  },
  {
    id: "pro" as const,
    name: "Studio Pro",
    price: "79,90",
    description: "Mais artistas. Mais liberdade para criar.",
    features: [
      "Tudo que faz parte do Básico",
      "Múltiplos tatuadores no estúdio",
      "Publicações ilimitadas*",
      "Identificação do autor em cada arte",
      "Galeria organizada por profissional",
      "Gerenciamento centralizado da equipe",
    ],
  },
];

export function PlanCards({
  current,
  onSelect,
}: {
  current?: Plan;
  onSelect?: (plan: Plan) => void;
}) {
  return (
    <div className={styles.planGrid}>
      {plans.map((plan) => (
        <article
          key={plan.id}
          className={`${styles.planCard} ${plan.id === "pro" ? styles.proPlan : ""}`}
        >
          <div className={styles.planTop}>
            <span className="eyebrow">
              {plan.id === "pro" ? (
                <>
                  <Sparkles size={13} /> LIBERDADE CRIATIVA
                </>
              ) : (
                "O ESSENCIAL, BEM FEITO"
              )}
            </span>
            {current === plan.id && <span className="chip">Seu plano</span>}
          </div>
          <h2>{plan.name}</h2>
          <p className="muted">{plan.description}</p>
          <div className={styles.price}>
            <span>R$</span> {plan.price}
            <small>/mês</small>
          </div>
          <p className={styles.priceNote}>
            Valor comercial planejado · sem cobrança no MVP
          </p>
          <ul className={styles.features}>
            {plan.features.map((feature) => (
              <li key={feature}>
                <Check size={16} />
                {feature}
              </li>
            ))}
          </ul>
          {onSelect ? (
            <button
              className={`button ${plan.id === "basic" ? "secondary" : ""}`}
              type="button"
              disabled={current === plan.id}
              onClick={() => onSelect(plan.id)}
            >
              {current === plan.id
                ? "Plano atual"
                : `Simular plano ${plan.name}`}
              <ArrowUpRight size={16} />
            </button>
          ) : (
            <Link
              className={`button ${plan.id === "basic" ? "secondary" : ""}`}
              href={`/cadastro?tipo=estudio&plano=${plan.id}`}
            >
              Criar estúdio demonstrativo
              <ArrowUpRight size={16} />
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}

export function PlansSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "section-block"} id="planos">
      <div className={compact ? "" : "container"}>
        <div className="section-title">
          <div>
            <span className="eyebrow">UM ESPAÇO PARA SUA ARTE</span>
            <h2>Escolha o seu próximo passo.</h2>
          </div>
          <Link className="text-link" href="/planos">
            Conheça os planos
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <PlanCards />
        <p className={styles.footnote}>
          Valores comerciais planejados. Demonstração sem cobranças. Clientes
          usam gratuitamente. * Publicações no Pro sujeitas a limites técnicos
          razoáveis de armazenamento e uso.
        </p>
      </div>
    </section>
  );
}

export function PlansPage() {
  return (
    <div className="page-shell">
      <div className={styles.plansIntro}>
        <span className="eyebrow">PARA QUEM VIVE DE ARTE</span>
        <h1 className="page-heading">
          Seu estúdio.
          <br />
          <span className={styles.accent}>Um novo espaço.</span>
        </h1>
        <p className="muted">
          Transforme a descoberta da próxima tatuagem em uma experiência.
          Escolha o plano que acompanha o seu ritmo.
        </p>
        <span className={styles.demoLabel}>
          Demonstração gratuita · nenhum pagamento é solicitado
        </span>
      </div>
      <PlanCards />
      <p className={styles.footnote}>
        * Publicações ilimitadas no Studio Pro, respeitando limites técnicos
        razoáveis de armazenamento e uso. O MVP usa dados locais de
        demonstração. Clientes usam a plataforma gratuitamente.
      </p>
      <div className={styles.planFaq}>
        <div>
          <h3>Posso testar os dois planos?</h3>
          <p className="muted">
            Sim. Crie um perfil demonstrativo e alterne os planos em Assinatura
            para conhecer os limites e recursos.
          </p>
        </div>
        <div>
          <h3>Como funciona a cobrança?</h3>
          <p className="muted">
            Esta versão não possui checkout nem cobrança. Os valores
            apresentados são os preços comerciais planejados.
          </p>
        </div>
        <div>
          <h3>E os dados do meu estúdio?</h3>
          <p className="muted">
            Na demonstração, os dados ficam neste navegador. Não cadastre
            informações sensíveis ou dados reais de clientes.
          </p>
        </div>
      </div>
    </div>
  );
}
