"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Box,
  Palette,
  ScanLine,
  ImagePlus,
  SlidersHorizontal,
  FolderCheck,
  ShieldCheck,
  Sparkles,
  Heart,
  MapPin,
  MessageSquareText,
  Plus,
  MousePointer2,
  Check,
  Hexagon,
} from "lucide-react";
import { Model3DViewer } from "./model-3d-viewer";
import { ArtCard, ArtDialog, StudioCard } from "./discovery";
import { PlansSection } from "./plans";
import { useDemo } from "@/lib/demo-store";
import type { TattooArt } from "@/lib/types";

const steps = [
  {
    icon: Box,
    title: "Escolha seu modelo",
    text: "Um novo jeito de visualizar a sua ideia em um corpo 3D.",
  },
  {
    icon: Palette,
    title: "Encontre seu tom",
    text: "Uma experiência pensada para representar a sua pele.",
  },
  {
    icon: ScanLine,
    title: "Escolha a região",
    text: "Explore possibilidades e encontre o lugar da sua arte.",
  },
  {
    icon: ImagePlus,
    title: "Dê espaço à sua ideia",
    text: "Descubra uma arte do estúdio ou envie seu desenho.",
  },
  {
    icon: SlidersHorizontal,
    title: "Ajuste cada detalhe",
    text: "Posição, escala e rotação. Liberdade para experimentar.",
  },
  {
    icon: FolderCheck,
    title: "Salve. Converse. Tatue.",
    text: "Organize seu projeto e solicite um orçamento ao artista.",
  },
];
const benefits = [
  {
    icon: Box,
    title: "Uma nova perspectiva",
    text: "Visualização tridimensional em desenvolvimento para explorar sua próxima tatuagem.",
  },
  {
    icon: Heart,
    title: "Do seu jeito, sempre",
    text: "Reúna referências e desenhos em projetos que expressam quem você é.",
  },
  {
    icon: MapPin,
    title: "O artista que combina",
    text: "Encontre estúdios por cidade e estilo. Conexões que fazem sentido.",
  },
  {
    icon: ShieldCheck,
    title: "Respeito a cada criação",
    text: "Artes vinculadas ao seu estúdio de origem. Autoria faz parte da experiência.",
  },
  {
    icon: MessageSquareText,
    title: "Conversa antes da tinta",
    text: "Peça um orçamento personalizado. Quem define o preço é o profissional.",
  },
  {
    icon: FolderCheck,
    title: "Sua ideia não se perde",
    text: "Salve, organize e continue seus projetos quando a inspiração chegar.",
  },
];
const faqs = [
  {
    q: "Preciso pagar para usar a plataforma?",
    a: "Não. O uso será gratuito para clientes. Você pode conhecer estúdios, explorar artes e organizar projetos. As assinaturas são destinadas aos estúdios. Neste MVP, todas as assinaturas são simuladas.",
  },
  {
    q: "Já consigo experimentar uma tatuagem no corpo 3D?",
    a: "Ainda não. Esta primeira versão apresenta uma esfera 3D interativa para validar a experiência visual. Os modelos humanos, tons de pele e projeção realista de tatuagens serão implementados na próxima fase.",
  },
  {
    q: "Como os meus projetos são salvos?",
    a: "Nesta demonstração, os projetos ficam apenas no armazenamento local deste navegador. Eles não são sincronizados entre dispositivos e podem ser perdidos ao limpar os dados do site. A persistência em nuvem será conectada futuramente.",
  },
  {
    q: "Posso levar a arte de um estúdio para outro?",
    a: "As artes de estúdio são vinculadas ao estabelecimento de origem. Ao pedir um orçamento a outro estúdio, você pode ocultar temporariamente as artes restritas ou criar uma cópia do projeto sem elas. Suas imagens próprias podem ser utilizadas em diferentes estúdios, respeitando os direitos de uso.",
  },
  {
    q: "O orçamento já vem com um preço?",
    a: "Não. Você compartilha as referências, dimensões desejadas e observações, e o tatuador define o valor. No modo de demonstração, o pedido é salvo localmente e o texto para WhatsApp pode ser visualizado, sem contatar números reais.",
  },
  {
    q: "Sou tatuador. Como faço parte?",
    a: "Conheça os planos Básico e Studio Pro e crie um perfil profissional de demonstração. Você poderá testar a publicação de artes, a gestão da equipe e os pedidos. Não há cobrança nesta versão.",
  },
];
export function Landing() {
  const { state } = useDemo();
  const [selected, setSelected] = useState<TattooArt | null>(null);
  const studios = state.studios.filter((s) => s.active).slice(0, 3);
  const arts = state.arts.filter(
    (a) =>
      a.published &&
      a.publicDemo &&
      state.studios.some((s) => s.id === a.studioId && s.active),
  );
  const carousel = arts.length ? arts.slice(0, 6) : [];
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-topline">
          <span>
            <Hexagon size={9} /> ARTE, IDENTIDADE E NOVAS POSSIBILIDADES.
          </span>
          <span>
            DESENHADO PARA SER ÚNICO. ASSIM COMO VOCÊ.{" "}
            <span style={{ color: "#7596aa" }}>✳</span>
          </span>
        </div>
        <div className="hero-heading reveal">
          <span className="eyebrow">EXPRESSE SUA IDENTIDADE</span>
          <h1 id="hero-title">
            A ARTE GANHA <span className="corpo">CORPO.</span>
          </h1>
        </div>
        <div className="hero-visual reveal reveal-delay">
          <div className="hero-carousel" aria-hidden="true">
            <div className="hero-carousel-track">
              {[0, 1].map((g) => (
                <div className="carousel-group" key={g}>
                  {carousel.map((a, i) => (
                    <div className="carousel-art" key={`${g}-${a.id}`}>
                      <img
                        src={a.image}
                        alt=""
                        loading={i < 4 ? "eager" : "lazy"}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <span className="hero-side-label left">
            FEITO DE HISTÓRIAS. MARCADO NA PELE.
          </span>
          <div className="hero-sphere">
            <Model3DViewer />
          </div>
          <span className="hero-side-label right">
            SUA IDENTIDADE. EM OUTRA DIMENSÃO.
          </span>
          <span className="sphere-caption">
            <span />
            <MousePointer2 size={10} /> ARRASTE PARA EXPLORAR · PRÉVIA 3D
          </span>
        </div>
        <div className="reveal reveal-delay">
          <p className="hero-copy">
            <strong>Sua próxima tatuagem começa antes da tinta.</strong>{" "}
            Experimente desenhos em um corpo 3D realista, encontre o lugar
            perfeito e transforme suas ideias em realidade.
          </p>
          <p style={{ fontSize: 8, color: "#728b9e", margin: "8px 20px 0" }}>
            Uma visão do que vem por aí. Nesta versão, explore uma esfera 3D
            interativa.
          </p>
          <div className="hero-actions">
            <Link href="/estudios/" className="button">
              Explorar estúdios <ArrowUpRight size={16} />
            </Link>
            <Link href="/planos/" className="button secondary">
              Sou tatuador <ArrowUpRight size={16} />
            </Link>
          </div>
          <Link className="hero-demo-link" href="/simulador/">
            <Box size={12} /> Conheça a prévia do simulador{" "}
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="hero-floor container">
          <div>
            <span className="tiny-art-mark">✳</span>
            <span>
              Não é só tinta.
              <br />
              <b>É sobre quem você é.</b>
            </span>
          </div>
          <a href="#como-funciona" className="discover-scroll">
            CONTINUE DESCOBRINDO <ArrowDown size={14} />
          </a>
          <span className="free-note">
            GRATUITO PARA CLIENTES.
            <br />
            LIBERDADE PARA CRIAR.
          </span>
        </div>
      </section>
      <div className="ticker-strip" aria-hidden="true">
        <div className="ticker-inner">
          {[0, 1].map((k) => (
            <span key={k}>
              {[
                "SUA PELE, SUA HISTÓRIA",
                "ARTISTAS INDEPENDENTES",
                "INSPIRAÇÃO SEM LIMITES",
                "CRIATIVIDADE EM MOVIMENTO",
                "MUITO ALÉM DA TINTA",
              ].map((t) => (
                <span key={t}>
                  {t}
                  <Sparkles size={13} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <section id="como-funciona" className="section-block">
        <div className="container">
          <div className="section-title">
            <div>
              <span className="eyebrow">DA INSPIRAÇÃO À EXPRESSÃO</span>
              <h2>
                Sua ideia merece
                <br />
                ser vista de perto.
              </h2>
            </div>
            <p style={{ fontSize: 12 }}>
              Estamos construindo uma experiência para conectar a sua imaginação
              ao próximo traço. Conheça o fluxo do futuro simulador.
            </p>
          </div>
          <div className="step-grid">
            {steps.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="step-number">
                  <span>0{i + 1}</span>
                  <s.icon size={24} strokeWidth={1.3} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <p className="future-note">
            <Box size={13} />
            Modelos humanos e aplicação na pele chegam na fase 2. Já é possível
            explorar a esfera, escolher artes e salvar projetos.
          </p>
        </div>
      </section>
      <section className="section-block soft">
        <div className="container">
          <div className="section-title">
            <div>
              <span className="eyebrow">CONEXÕES QUE DEIXAM MARCA</span>
              <h2>Talento perto de você.</h2>
            </div>
            <Link className="text-link" href="/estudios/">
              Todos os estúdios <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="studio-grid">
            {studios.map((s) => (
              <StudioCard studio={s} key={s.id} />
            ))}
          </div>
          <p className="gallery-caption">
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#698fa4",
              }}
            />{" "}
            Estúdios e profissionais fictícios para explorar a experiência.
          </p>
        </div>
      </section>
      <section className="section-block">
        <div className="container">
          <div className="section-title">
            <div>
              <span className="eyebrow">ARTE QUE ENCONTRA VOCÊ</span>
              <h2>Cada traço, uma possibilidade.</h2>
            </div>
            <Link className="text-link" href="/galeria/">
              Explorar galeria <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="art-grid">
            {arts.slice(0, 4).map((a) => (
              <ArtCard art={a} key={a.id} onSelect={setSelected} />
            ))}
          </div>
          <p className="gallery-caption">
            <ShieldCheck size={12} />
            Criações originais de demonstração. A autoria de cada estúdio é
            respeitada.
          </p>
        </div>
      </section>
      <section className="section-block soft">
        <div className="container">
          <div className="section-title">
            <div>
              <span className="eyebrow">PENSADO EM CADA DETALHE</span>
              <h2>
                Liberdade para imaginar.
                <br />
                Confiança para escolher.
              </h2>
            </div>
            <span
              style={{
                fontSize: 66,
                color: "#3a5263",
                lineHeight: 1,
                fontWeight: 200,
              }}
              aria-hidden="true"
            >
              ✳
            </span>
          </div>
          <div className="benefit-grid">
            {benefits.map((b) => (
              <div className="benefit" key={b.title}>
                <b.icon size={25} strokeWidth={1.3} />
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="para-tatuadores" className="pro-section">
        <div className="container pro-layout">
          <div className="pro-photo">
            <img
              src="/images/studio-3.png"
              alt="Ilustração fotográfica de um artista trabalhando em um estúdio de tatuagem"
              loading="lazy"
            />
            <div className="pro-photo-caption">
              <p>
                Você cria a arte.
                <br />A gente conecta.
              </p>
              <ArrowUpRight size={38} strokeWidth={1} />
            </div>
          </div>
          <div className="pro-copy">
            <span className="eyebrow">PARA QUEM VIVE DA ARTE</span>
            <h2>
              Seu talento merece
              <br />
              um novo espaço.
            </h2>
            <p>
              Uma vitrine à altura do seu trabalho. Apresente suas artes,
              conecte-se a novos clientes e organize os pedidos do seu estúdio
              em um só lugar.
            </p>
            <ul className="pro-points">
              <li>
                <Check size={14} />
                Um perfil com a identidade do seu estúdio
              </li>
              <li>
                <Check size={14} />
                Galeria autoral com proteção de origem
              </li>
              <li>
                <Check size={14} />
                Orçamentos e equipe, sem complicação
              </li>
            </ul>
            <Link href="/cadastro/?tipo=profissional" className="button">
              Quero fazer parte <ArrowUpRight size={15} />
            </Link>
            <small>
              Cadastre um estúdio demonstrativo. Sem cobrança nesta versão.
            </small>
          </div>
        </div>
      </section>
      <PlansSection />
      <section className="section-block">
        <div className="container faq-layout">
          <div className="faq-heading">
            <span className="eyebrow">ANTES DO PRIMEIRO TRAÇO</span>
            <h2>
              Ficou com
              <br />
              alguma dúvida?
            </h2>
            <p>O que você precisa saber para começar sua próxima história.</p>
            <Link className="text-link" href="/contato/">
              Fale com a gente <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="faq-list">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <Plus size={17} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <p className="closing-line">
        A SUA HISTÓRIA MERECE <span>VIRAR ARTE.</span>
      </p>
      <ArtDialog art={selected} onClose={() => setSelected(null)} />
    </>
  );
}
