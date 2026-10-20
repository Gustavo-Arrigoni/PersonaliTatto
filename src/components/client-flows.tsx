"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  FilePlus2,
  FolderOpen,
  ImagePlus,
  Info,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import {
  buildWhatsAppMessage,
  getAllowedTattoos,
  getProjectConflicts,
  id,
  makeProjectCopy,
  safeNextRoute,
} from "@/lib/rules";
import type { Profile, Project, QuoteRequest, Role, Studio } from "@/lib/types";
import styles from "./client-flows.module.css";

const emailSchema = z.string().trim().email("Informe um e-mail válido.");
const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Use ao menos 8 caracteres para testar o formulário."),
});
const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome.")
      .max(80, "Use até 80 caracteres."),
    email: emailSchema,
    password: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres.")
      .max(128, "Use até 128 caracteres."),
    confirmation: z.string(),
    accountType: z.enum(["client", "studio"]),
    studioName: z.string().trim(),
    phone: z.string().trim(),
    city: z.string().trim(),
    state: z.string().trim(),
    address: z.string().trim(),
    description: z.string().trim().max(1000, "Use até 1.000 caracteres."),
    instagram: z.string().trim().max(120),
    plan: z.enum(["basic", "pro"]),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmation)
      context.addIssue({
        code: "custom",
        path: ["confirmation"],
        message: "As senhas precisam ser iguais.",
      });
    if (values.accountType === "studio") {
      const required = {
        studioName: "Informe o nome do estúdio.",
        phone: "Informe um telefone para o perfil local.",
        city: "Informe a cidade.",
        address: "Informe o endereço comercial.",
        description: "Conte um pouco sobre o estúdio.",
      };
      for (const [field, message] of Object.entries(required))
        if (values[field as keyof typeof required].length < 2)
          context.addIssue({ code: "custom", path: [field], message });
      if (!/^[A-Z]{2}$/.test(values.state.toUpperCase()))
        context.addIssue({
          code: "custom",
          path: ["state"],
          message: "Use a UF com duas letras.",
        });
      if (
        values.phone.replace(/\D/g, "").length < 10 ||
        values.phone.replace(/\D/g, "").length > 13
      )
        context.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Informe um telefone com DDD válido.",
        });
    }
  });
type Registration = z.infer<typeof registerSchema>;
const quoteSchema = z.object({
  region: z
    .string()
    .trim()
    .min(2, "Informe a região desejada.")
    .max(100, "Use até 100 caracteres."),
  dimensions: z.string().trim().max(100, "Use até 100 caracteres."),
  notes: z.string().trim().max(1500, "Use até 1.500 caracteres."),
});
type QuoteFormValues = z.infer<typeof quoteSchema>;

function homeForRole(role: Role) {
  return role === "studio"
    ? "/estudio/painel"
    : role === "admin"
      ? "/admin"
      : "/meus-projetos";
}
function formattedDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}
function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label>
        <span>{label}</span>
        {children}
      </label>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
function PasswordField({
  label,
  register,
  error,
  autoComplete = "current-password",
}: {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  autoComplete?: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error}>
      <span className={styles.password}>
        <input
          {...register}
          type={visible ? "text" : "password"}
          autoComplete={
            register.name === "confirmation" ? "new-password" : autoComplete
          }
          placeholder="Mínimo de 8 caracteres"
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </Field>
  );
}
function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.note}>
      <Info size={16} />
      <span>
        {children ??
          "Modo demonstração: os dados ficam neste navegador. Não há autenticação segura, envio de e-mails ou cobrança. Senhas nunca são salvas."}
      </span>
    </div>
  );
}

export function AuthGate({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { state, ready } = useDemo();
  const pathname = usePathname();
  const search = useSearchParams();
  if (!ready)
    return (
      <div className={styles.gate} role="status">
        <Sparkles size={28} />
        <p>Preparando sua experiência…</p>
      </div>
    );
  if (!state.session)
    return (
      <div className={styles.gate}>
        <LockKeyhole size={35} color="#86a7ba" />
        <p className="eyebrow">SEU ESPAÇO CRIATIVO</p>
        <h1>Suas ideias merecem um lugar.</h1>
        <p>
          Entre em um perfil local para guardar projetos e organizar seus
          pedidos. Você também pode escolher um perfil de demonstração.
        </p>
        <Link
          className="button"
          href={`/entrar?next=${encodeURIComponent(`${pathname}${search.size ? `?${search}` : ""}`)}`}
        >
          Entrar para continuar <ArrowRight size={15} />
        </Link>
      </div>
    );
  if (roles && !roles.includes(state.session.role))
    return (
      <div className={styles.gate}>
        <ShieldCheck size={35} color="#86a7ba" />
        <h1>Um espaço para cada perfil.</h1>
        <p>
          Esta página pertence à área de clientes. Use o perfil de cliente na
          tela de acesso para experimentar este fluxo.
        </p>
        <Link className="button" href="/entrar">
          Trocar perfil de demonstração <ArrowRight size={15} />
        </Link>
      </div>
    );
  return children;
}

function DemoRoles() {
  const { login } = useDemo();
  const router = useRouter();
  const params = useSearchParams();
  const activate = (role: Role) => {
    login(role);
    router.push(safeNextRoute(params.get("next"), homeForRole(role)));
  };
  return (
    <>
      <div className={styles.divider}>Ou explore com um perfil pronto</div>
      <div className={styles.roles}>
        <button type="button" onClick={() => activate("client")}>
          <User size={19} />
          Cliente demo
        </button>
        <button type="button" onClick={() => activate("studio")}>
          <Store size={19} />
          Estúdio demo
        </button>
        <button type="button" onClick={() => activate("admin")}>
          <ShieldCheck size={19} />
          Admin demo
        </button>
      </div>
    </>
  );
}

function LoginForm() {
  const { state, update, notify } = useDemo();
  const params = useSearchParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = handleSubmit((values) => {
    const profile = state.profiles.find(
      (item) => item.email.toLowerCase() === values.email.toLowerCase(),
    );
    if (!profile) {
      setError("email", {
        message:
          "Nenhum perfil local encontrado. Crie uma conta ou escolha um perfil demo abaixo.",
      });
      return;
    }
    update((current) => ({ ...current, session: profile }));
    notify("Perfil local aberto. A senha não foi validada nem armazenada.");
    router.push(safeNextRoute(params.get("next"), homeForRole(profile.role)));
  });
  return (
    <>
      <p className="eyebrow">BEM-VINDO DE VOLTA</p>
      <h1>Continue a sua história.</h1>
      <p className="muted">Seu próximo capítulo começa com uma ideia.</p>
      <form onSubmit={submit} noValidate>
        <Field label="E-mail" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            aria-invalid={!!errors.email}
          />
        </Field>
        <PasswordField
          label="Senha"
          register={register("password")}
          error={errors.password?.message}
        />
        <div className={styles.row}>
          <span className={styles.help}>Acesso local demonstrativo</span>
          <Link href="/recuperar-senha">Esqueceu sua senha?</Link>
        </div>
        <button className="button" type="submit" disabled={isSubmitting}>
          Entrar no perfil local <ArrowRight size={16} />
        </button>
        <DemoNote>
          A senha é apenas validada pelo formulário, nunca verificada ou salva.
          Qualquer pessoa neste navegador pode abrir os perfis demo.
        </DemoNote>
      </form>
      <DemoRoles />
      <p className={styles.center}>
        Primeira vez por aqui?{" "}
        <Link
          href={`/cadastro${params.get("next") ? `?next=${encodeURIComponent(safeNextRoute(params.get("next")))}` : ""}`}
        >
          Crie sua conta
        </Link>
      </p>
    </>
  );
}

function RegisterForm() {
  const { state, update, notify } = useDemo();
  const router = useRouter();
  const params = useSearchParams();
  const professional = ["studio", "estudio", "profissional"].includes(
    params.get("tipo") ?? params.get("role") ?? "",
  );
  const [coverImage, setCoverImage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Registration>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmation: "",
      accountType: professional ? "studio" : "client",
      studioName: "",
      phone: "",
      city: "",
      state: "SP",
      address: "",
      description: "",
      instagram: "",
      plan: params.get("plano") === "pro" ? "pro" : "basic",
    },
  });
  const type = useWatch({ control, name: "accountType" });
  const submit = handleSubmit((values) => {
    if (
      state.profiles.some(
        (profile) => profile.email.toLowerCase() === values.email.toLowerCase(),
      )
    ) {
      setError("email", {
        message: "Esse e-mail já pertence a um perfil neste navegador.",
      });
      return;
    }
    const profile: Profile = {
      id: id("profile"),
      name: values.name,
      email: values.email,
      role: values.accountType,
    };
    let studio: Studio | undefined;
    if (values.accountType === "studio") {
      const studioId = id("studio");
      profile.studioId = studioId;
      const slug = `${values.studioName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${studioId.slice(-6)}`;
      studio = {
        id: studioId,
        slug,
        name: values.studioName,
        city: values.city,
        state: values.state.toUpperCase(),
        address: values.address,
        description: values.description,
        styles: [],
        image: coverImage || "/images/studio-2.png",
        initials: values.studioName
          .split(/\s+/)
          .map((word) => word[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        plan: values.plan,
        active: true,
        instagram: values.instagram,
        whatsapp: values.phone.replace(/\D/g, ""),
        isDemo: true,
      };
    }
    const newStudio = studio;
    update((current) => ({
      ...current,
      profiles: [...current.profiles, profile],
      session: profile,
      studios: newStudio ? [...current.studios, newStudio] : current.studios,
      members: newStudio
        ? [
            ...current.members,
            {
              id: id("member"),
              studioId: newStudio.id,
              name: values.name,
              specialty: "Artista responsável",
              initials: values.name
                .split(/\s+/)
                .map((word) => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase(),
            },
          ]
        : current.members,
    }));
    notify(
      "Perfil de demonstração criado neste navegador. Nenhuma senha foi salva.",
    );
    router.push(safeNextRoute(params.get("next"), homeForRole(profile.role)));
  });
  const uploadCover = (file?: File) => {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setUploadError("Use JPG, PNG ou WebP de até 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(String(reader.result));
      setUploadError("");
    };
    reader.onerror = () =>
      setUploadError("Não foi possível abrir a imagem. Tente outro arquivo.");
    reader.readAsDataURL(file);
  };
  return (
    <>
      <p className="eyebrow">O PRIMEIRO TRAÇO É SEU</p>
      <h1>Comece algo único.</h1>
      <p className="muted">Um espaço para a arte que faz parte de você.</p>
      <form onSubmit={submit} noValidate>
        <div className={styles.tabs} aria-label="Tipo de conta">
          <button
            type="button"
            className={type === "client" ? styles.selected : ""}
            aria-pressed={type === "client"}
            onClick={() => setValue("accountType", "client")}
          >
            Sou cliente
          </button>
          <button
            type="button"
            className={type === "studio" ? styles.selected : ""}
            aria-pressed={type === "studio"}
            onClick={() => setValue("accountType", "studio")}
          >
            Sou tatuador
          </button>
        </div>
        <Field
          label={type === "studio" ? "Nome do responsável" : "Seu nome"}
          error={errors.name?.message}
        >
          <input
            {...register("name")}
            autoComplete="name"
            placeholder="Como podemos chamar você?"
          />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
        </Field>
        <div className={styles.twoCols}>
          <PasswordField
            label="Crie uma senha"
            autoComplete="new-password"
            register={register("password")}
            error={errors.password?.message}
          />
          <PasswordField
            label="Confirme a senha"
            register={register("confirmation")}
            error={errors.confirmation?.message}
          />
        </div>
        {type === "studio" && (
          <>
            <div className={styles.divider}>Seu estúdio</div>
            <Field label="Nome do estúdio" error={errors.studioName?.message}>
              <input
                {...register("studioName")}
                placeholder="Nome que leva sua arte"
              />
            </Field>
            <Field label="WhatsApp com DDD" error={errors.phone?.message}>
              <input
                {...register("phone")}
                type="tel"
                autoComplete="tel"
                placeholder="(15) 99999-9999"
              />
            </Field>
            <div className={styles.twoCols}>
              <Field label="Cidade" error={errors.city?.message}>
                <input {...register("city")} autoComplete="address-level2" />
              </Field>
              <Field label="Estado (UF)" error={errors.state?.message}>
                <select {...register("state")} autoComplete="address-level1">
                  {[
                    "AC",
                    "AL",
                    "AP",
                    "AM",
                    "BA",
                    "CE",
                    "DF",
                    "ES",
                    "GO",
                    "MA",
                    "MT",
                    "MS",
                    "MG",
                    "PA",
                    "PB",
                    "PR",
                    "PE",
                    "PI",
                    "RJ",
                    "RN",
                    "RS",
                    "RO",
                    "RR",
                    "SC",
                    "SP",
                    "SE",
                    "TO",
                  ].map((uf) => (
                    <option key={uf}>{uf}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Endereço comercial" error={errors.address?.message}>
              <input
                {...register("address")}
                autoComplete="street-address"
                placeholder="Rua, número e bairro"
              />
            </Field>
            <Field
              label="Sobre seu estúdio"
              error={errors.description?.message}
            >
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Sua história, estilos e o que torna seu trabalho único."
              />
            </Field>
            <Field
              label="Instagram (opcional)"
              error={errors.instagram?.message}
            >
              <input {...register("instagram")} placeholder="@seuestudio" />
            </Field>
            <Field
              label="Imagem do estúdio ou logotipo (opcional)"
              error={uploadError}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => uploadCover(event.target.files?.[0])}
              />
              <span className={styles.help}>
                {coverImage
                  ? "Imagem selecionada. Será salva somente neste navegador."
                  : "JPG, PNG ou WebP · até 2 MB"}
              </span>
            </Field>
            <Field label="Plano de demonstração">
              <select {...register("plan")}>
                <option value="basic">Básico · R$ 49,90/mês planejados</option>
                <option value="pro">
                  Studio Pro · R$ 79,90/mês planejados
                </option>
              </select>
            </Field>
            <p className={styles.help}>
              A assinatura é simulada. Nenhum pagamento é solicitado. O plano
              Básico permite 1 tatuador e até 25 artes publicadas.
            </p>
          </>
        )}
        <DemoNote>
          Use informações fictícias. O cadastro e suas imagens ficam neste
          navegador e podem ser apagados. Senhas nunca são salvas e o perfil não
          tem proteção de autenticação.
        </DemoNote>
        <button type="submit" className="button" disabled={isSubmitting}>
          Criar {type === "studio" ? "estúdio" : "perfil"} de demonstração{" "}
          <ArrowRight size={16} />
        </button>
        <p className={styles.help}>
          Ao continuar, você reconhece o uso demonstrativo descrito em{" "}
          <Link href="/termos">Termos</Link> e{" "}
          <Link href="/privacidade">Privacidade</Link>.
        </p>
      </form>
      <p className={styles.center}>
        Já tem um perfil local?{" "}
        <Link
          href={`/entrar${params.get("next") ? `?next=${encodeURIComponent(safeNextRoute(params.get("next")))}` : ""}`}
        >
          Entre por aqui
        </Link>
      </p>
    </>
  );
}

function RecoveryForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: emailSchema })),
  });
  return (
    <>
      <p className="eyebrow">SEM PERDER O SEU CAMINHO</p>
      <h1>Recupere seu acesso.</h1>
      <p className="muted">
        A recuperação por e-mail estará disponível com autenticação real.
      </p>
      {sent ? (
        <div className={styles.success} role="status">
          <CheckCircle2 size={27} />
          <h2>Prévia de recuperação concluída.</h2>
          <p>
            Nenhum e-mail foi enviado. No modo local, volte à tela de entrada e
            escolha um perfil demo; senhas não são armazenadas.
          </p>
          <Link className="button" href="/entrar">
            Voltar para entrar <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(() => setSent(true))}>
          <Field label="Seu e-mail" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />
          </Field>
          <DemoNote>
            Esta é uma prévia do fluxo. Não existe envio de e-mail ou
            redefinição de senha no ambiente de demonstração.
          </DemoNote>
          <button className="button" type="submit">
            Visualizar recuperação <ArrowRight size={16} />
          </button>
          <Link className={styles.center} href="/entrar">
            Voltar para entrar
          </Link>
        </form>
      )}
    </>
  );
}

export function AuthScreen({
  mode,
}: {
  mode: "login" | "register" | "recovery";
}) {
  return (
    <div className="page-shell">
      <div className={styles.auth}>
        <aside className={styles.visual}>
          <Link href="/" className={styles.visualMark}>
            <Sparkles size={21} /> PERSONALITATTO
          </Link>
          <div>
            <p className="eyebrow">ARTE. IDENTIDADE. CONEXÃO.</p>
            <h2>
              Sua pele.
              <br />
              Sua história.
              <br />
              <em>Sua próxima arte.</em>
            </h2>
            <p>
              Ideias que encontram artistas. Referências que ganham significado.
              Tudo começa aqui.
            </p>
            <span className="chip">Uma nova forma de imaginar</span>
          </div>
        </aside>
        <section className={styles.formArea}>
          {mode === "register" ? (
            <RegisterForm />
          ) : mode === "recovery" ? (
            <RecoveryForm />
          ) : (
            <LoginForm />
          )}
        </section>
      </div>
    </div>
  );
}

export function ProjectsScreen() {
  return (
    <div className="page-shell">
      <AuthGate roles={["client"]}>
        <ProjectsContent />
      </AuthGate>
    </div>
  );
}

function ProjectsContent() {
  const { state, update, notify } = useDemo();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [editing, setEditing] = useState("");
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState("");
  const userId = state.session!.id;
  const all = state.projects.filter((project) => project.userId === userId);
  const projects = all
    .filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "pt-BR")
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  const newProject = () => {
    const timestamp = new Date().toISOString();
    const project: Project = {
      id: id("project"),
      userId,
      name: "Meu novo projeto",
      model: "sphere-preview",
      tattoos: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    update((current) => ({
      ...current,
      projects: [...current.projects, project],
    }));
    router.push(`/simulador?project=${encodeURIComponent(project.id)}`);
  };
  const rename = (projectId: string) => {
    if (!newName.trim() || newName.trim().length > 80) {
      notify("Use um nome entre 1 e 80 caracteres.");
      return;
    }
    update((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId && project.userId === userId
          ? {
              ...project,
              name: newName.trim(),
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    }));
    setEditing("");
    notify("Projeto renomeado.");
  };
  const duplicate = (project: Project) => {
    const copy = makeProjectCopy(project, userId);
    update((current) => ({
      ...current,
      projects: [...current.projects, copy],
    }));
    notify("Cópia criada. O projeto original foi preservado.");
  };
  const remove = (projectId: string) => {
    update((current) => ({
      ...current,
      projects: current.projects.filter(
        (project) => project.id !== projectId || project.userId !== userId,
      ),
    }));
    setDeleting("");
    notify(
      "Projeto excluído. Os registros de pedidos existentes foram preservados.",
    );
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SEU UNIVERSO CRIATIVO</p>
          <h1>
            Meus projetos<span>.</span>
          </h1>
          <p className="muted">
            Ideias de hoje. Histórias para a vida inteira.
          </p>
        </div>
        <button type="button" className="button" onClick={newProject}>
          <Plus size={17} /> Criar novo projeto
        </button>
      </div>
      <DemoNote>
        Projetos salvos localmente para {state.session!.name}. A prévia usa uma
        esfera 3D; as artes permanecem em uma pasta de referências, sem projeção
        na superfície.
      </DemoNote>
      <div className={styles.row} style={{ marginTop: 30 }}>
        <div className={styles.toolbar}>
          <input
            aria-label="Buscar projetos"
            type="search"
            placeholder="Buscar meus projetos…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="Ordenar projetos"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="recent">Atualizados recentemente</option>
            <option value="name">Nome do projeto</option>
          </select>
        </div>
        <span className={styles.meta}>
          {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
        </span>
      </div>
      {projects.length ? (
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article className={styles.project} key={project.id}>
              <Link
                className={styles.preview}
                href={`/simulador?project=${encodeURIComponent(project.id)}`}
                aria-label={`Abrir ${project.name}`}
              >
                {project.tattoos.slice(0, 2).map((tattoo) => (
                  <img key={tattoo.id} src={tattoo.image} alt={tattoo.name} />
                ))}
                {!project.tattoos.length && (
                  <FolderOpen size={62} color="#4c697c" />
                )}
              </Link>
              <div className={styles.projectBody}>
                <span className={styles.meta}>
                  <Clock3 size={12} />
                  Atualizado em {formattedDate(project.updatedAt)}
                </span>
                {editing === project.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      rename(project.id);
                    }}
                    style={{ display: "flex", gap: 5, margin: "12px 0" }}
                  >
                    <input
                      className={styles.rename}
                      value={newName}
                      aria-label="Novo nome do projeto"
                      maxLength={80}
                      autoFocus
                      onChange={(event) => setNewName(event.target.value)}
                    />
                    <button
                      type="submit"
                      className={styles.iconButton}
                      aria-label="Salvar nome"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label="Cancelar edição"
                      onClick={() => setEditing("")}
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <h2>{project.name}</h2>
                )}
                <div className={styles.row}>
                  <span className="chip">
                    {project.tattoos.length}{" "}
                    {project.tattoos.length === 1
                      ? "referência"
                      : "referências"}
                  </span>
                  <span className={styles.meta}>
                    {state.studios.find(
                      (studio) => studio.id === project.studioId,
                    )?.name ?? "Projeto pessoal"}
                  </span>
                </div>
                {deleting === project.id && (
                  <div className={styles.deletePanel}>
                    <strong>Excluir “{project.name}”?</strong>
                    <span>
                      A exclusão remove esta pasta local. Pedidos já registrados
                      mantêm suas referências.
                    </span>
                    <div className={styles.row}>
                      <button type="button" onClick={() => remove(project.id)}>
                        Excluir projeto
                      </button>
                      <button type="button" onClick={() => setDeleting("")}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                <div className={styles.projectActions}>
                  <Link
                    className="button secondary"
                    href={`/simulador?project=${encodeURIComponent(project.id)}`}
                  >
                    Abrir projeto <ArrowUpRight size={13} />
                  </Link>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Renomear ${project.name}`}
                    title="Renomear"
                    onClick={() => {
                      setEditing(project.id);
                      setNewName(project.name);
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Duplicar ${project.name}`}
                    title="Duplicar"
                    onClick={() => duplicate(project)}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.danger}`}
                    aria-label={`Excluir ${project.name}`}
                    title="Excluir"
                    onClick={() => setDeleting(project.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <Link
                  className={styles.textButton}
                  style={{ display: "inline-block", marginTop: 10 }}
                  href={`/orcamentos?project=${encodeURIComponent(project.id)}${project.studioId ? `&studio=${encodeURIComponent(project.studioId)}` : ""}`}
                >
                  Solicitar orçamento{" "}
                  <ArrowRight size={11} style={{ display: "inline" }} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ margin: "30px 0" }}>
          <FolderOpen size={36} />
          <h2>
            {all.length
              ? "Nenhum projeto por esse nome."
              : "Toda história começa com uma ideia."}
          </h2>
          <p>
            {all.length
              ? "Tente outra busca para encontrar suas referências."
              : "Crie seu primeiro projeto e reúna as artes que fazem sentido para você."}
          </p>
          {all.length ? (
            <button className="button secondary" onClick={() => setSearch("")}>
              Limpar busca
            </button>
          ) : (
            <button className="button" onClick={newProject}>
              <FilePlus2 size={16} /> Criar meu primeiro projeto
            </button>
          )}
        </div>
      )}
      <div className={styles.note}>
        <ShieldCheck size={16} />
        <span>
          Artes de estúdios mantêm sua autoria. Ao levar um projeto para outro
          estúdio, você pode ocultar referências restritas ou criar uma cópia
          sem elas.
        </span>
      </div>
    </>
  );
}

export function QuotesScreen() {
  return (
    <div className="page-shell">
      <AuthGate roles={["client"]}>
        <QuotesContent />
      </AuthGate>
    </div>
  );
}

function QuotesContent() {
  const { state, update, notify } = useDemo();
  const params = useSearchParams();
  const [projectId, setProjectId] = useState(params.get("project") ?? "");
  const [studioId, setStudioId] = useState(params.get("studio") ?? "");
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [conflictMode, setConflictMode] = useState<"none" | "hide">("none");
  const [saved, setSaved] = useState<QuoteRequest | null>(null);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { region: "", dimensions: "", notes: "" },
  });
  const profile = state.session!;
  const projects = state.projects.filter(
    (project) => project.userId === profile.id,
  );
  const project =
    projects.find((entry) => entry.id === projectId) ?? projects[0];
  const studios = state.studios.filter((studio) => studio.active);
  const studio =
    studios.find((entry) => entry.id === studioId) ??
    studios.find((entry) => entry.id === project?.studioId) ??
    studios[0];
  const conflicts =
    project && studio ? getProjectConflicts(project, studio.id) : [];
  const allowed =
    project && studio ? getAllowedTattoos(project, studio.id) : [];
  const selected = allowed.filter(
    (tattoo) => selectedIds === null || selectedIds.includes(tattoo.id),
  );
  const history = state.quotes
    .filter((quote) => quote.clientId === profile.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const changeProject = (value: string) => {
    setProjectId(value);
    setSelectedIds(null);
    setConflictMode("none");
    setSaved(null);
    setFormError("");
  };
  const changeStudio = (value: string) => {
    setStudioId(value);
    setSelectedIds(null);
    setConflictMode("none");
    setSaved(null);
    setFormError("");
  };
  const copyProject = () => {
    if (!project || !studio) return;
    const copy = makeProjectCopy(project, profile.id, studio.id);
    update((current) => ({
      ...current,
      projects: [...current.projects, copy],
    }));
    setProjectId(copy.id);
    setStudioId(studio.id);
    setSelectedIds(null);
    setConflictMode("none");
    notify(
      "Cópia criada sem artes de outros estúdios. O original está intacto.",
    );
  };
  const submit = handleSubmit((values) => {
    if (!project || !studio || !studio.active) {
      setFormError("Escolha um projeto e um estúdio ativo.");
      return;
    }
    if (conflicts.length && conflictMode !== "hide") {
      setFormError("Resolva as referências restritas antes de continuar.");
      return;
    }
    if (!selected.length) {
      setFormError(
        "Selecione ao menos uma referência autorizada para este estúdio.",
      );
      return;
    }
    const quote: QuoteRequest = {
      id: `PT-${id().slice(-8).toUpperCase()}`,
      clientId: profile.id,
      clientName: profile.name,
      clientEmail: profile.email,
      studioId: studio.id,
      projectId: project.id,
      projectName: project.name,
      items: structuredClone(selected),
      region: values.region,
      dimensions: values.dimensions,
      notes: values.notes,
      status: "pending",
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    update((current) => ({ ...current, quotes: [...current.quotes, quote] }));
    setSaved(quote);
    setFormError("");
    notify("Pedido demo registrado localmente. Nenhuma mensagem foi enviada.");
  });
  const copyMessage = async (quote: QuoteRequest) => {
    try {
      await navigator.clipboard.writeText(buildWhatsAppMessage(quote));
      notify("Mensagem de demonstração copiada.");
    } catch {
      notify(
        "A cópia não está disponível. Selecione o texto na prévia da mensagem.",
      );
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DO PRIMEIRO TRAÇO À CONVERSA</p>
          <h1>
            Vamos falar de arte<span>?</span>
          </h1>
          <p className="muted">
            Reúna as suas referências. O próximo passo é com o artista.
          </p>
        </div>
        <Link href="/meus-projetos" className="button secondary">
          <FolderOpen size={16} /> Meus projetos
        </Link>
      </div>
      <DemoNote>
        Pedidos de demonstração são registrados somente neste navegador. Valores
        são definidos pelo tatuador. Nenhum contato real ou envio de mensagem
        será realizado.
      </DemoNote>
      {saved && (
        <div className={styles.success} role="status" style={{ marginTop: 25 }}>
          <CheckCircle2 size={30} color="#8eb6a7" />
          <h2>Seu pedido demo está organizado.</h2>
          <p>
            Referência <strong>{saved.id}</strong> · O registro já aparece no
            seu histórico e no painel local do estúdio. Nenhuma mensagem foi
            enviada e nenhum orçamento real foi solicitado.
          </p>
          <details>
            <summary className={styles.textButton}>
              Ver prévia da mensagem para WhatsApp
            </summary>
            <pre className={styles.previewMessage}>
              {buildWhatsAppMessage(saved)}
            </pre>
            <button
              className="button secondary"
              type="button"
              onClick={() => copyMessage(saved)}
            >
              <Copy size={15} /> Copiar prévia
            </button>
          </details>
        </div>
      )}
      {projects.length && studios.length ? (
        <div className={styles.quoteLayout}>
          <form className={styles.quoteForm} noValidate onSubmit={submit}>
            <div>
              <p className="eyebrow">01 / SEU PONTO DE PARTIDA</p>
              <h2>Escolha o projeto e o estúdio</h2>
            </div>
            <Field label="Projeto">
              <select
                value={project?.id ?? ""}
                onChange={(event) => changeProject(event.target.value)}
              >
                {projects.map((entry) => (
                  <option value={entry.id} key={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estúdio destinatário">
              <select
                value={studio?.id ?? ""}
                onChange={(event) => changeStudio(event.target.value)}
              >
                {studios.map((entry) => (
                  <option value={entry.id} key={entry.id}>
                    {entry.name} · {entry.city}
                  </option>
                ))}
              </select>
            </Field>
            {conflicts.length > 0 && (
              <div className={styles.conflict}>
                <strong>
                  <ShieldCheck
                    size={15}
                    style={{ display: "inline", verticalAlign: "middle" }}
                  />{" "}
                  {conflicts.length}{" "}
                  {conflicts.length === 1 ? "arte pertence" : "artes pertencem"}{" "}
                  a outro estúdio.
                </strong>
                <span>
                  {conflicts.map((item) => item.name).join(", ")}. Essas
                  referências não podem entrar no pedido para {studio?.name}. O
                  projeto original sempre é preservado.
                </span>
                {conflictMode === "hide" ? (
                  <span>
                    <Check size={14} style={{ display: "inline" }} />{" "}
                    Referências restritas ocultadas apenas neste pedido.{" "}
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => setConflictMode("none")}
                    >
                      Desfazer
                    </button>
                  </span>
                ) : (
                  <div className={styles.row}>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => {
                        setConflictMode("hide");
                        setFormError("");
                      }}
                    >
                      Ocultar temporariamente
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={copyProject}
                    >
                      <Copy size={13} /> Criar cópia sem essas artes
                    </button>
                  </div>
                )}
              </div>
            )}
            <div>
              <p className="eyebrow">02 / SUAS REFERÊNCIAS</p>
              <h2>Quais artes fazem parte da ideia?</h2>
            </div>
            <div className={styles.itemList}>
              {allowed.map((tattoo) => (
                <label className={styles.quoteItem} key={tattoo.id}>
                  <input
                    type="checkbox"
                    checked={
                      selectedIds === null || selectedIds.includes(tattoo.id)
                    }
                    onChange={(event) => {
                      const current =
                        selectedIds ?? allowed.map((entry) => entry.id);
                      setSelectedIds(
                        event.target.checked
                          ? [...current, tattoo.id]
                          : current.filter((value) => value !== tattoo.id),
                      );
                    }}
                  />
                  <img src={tattoo.image} alt="" />
                  <span>
                    {tattoo.name}
                    <small>
                      {tattoo.origin === "upload"
                        ? "Referência pessoal"
                        : `Arte de ${studio?.name}`}
                    </small>
                  </span>
                </label>
              ))}
              {allowed.length === 0 && (
                <div className="empty-state">
                  <ImagePlus size={28} />
                  <h3>Nenhuma referência disponível para este estúdio.</h3>
                  <p>
                    Escolha o estúdio proprietário ou adicione uma referência
                    pessoal no seu projeto.
                  </p>
                  <Link
                    className="button secondary"
                    href={`/simulador?project=${encodeURIComponent(project!.id)}`}
                  >
                    Editar projeto <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
            <div>
              <p className="eyebrow">03 / OS DETALHES</p>
              <h2>Conte como você imagina</h2>
            </div>
            <div className={styles.twoCols}>
              <Field label="Região do corpo" error={errors.region?.message}>
                <input
                  {...register("region")}
                  placeholder="Ex.: antebraço, costas…"
                  maxLength={100}
                />
              </Field>
              <Field
                label="Dimensões aproximadas (opcional)"
                error={errors.dimensions?.message}
              >
                <input
                  {...register("dimensions")}
                  placeholder="Ex.: 15 × 8 cm"
                  maxLength={100}
                />
              </Field>
            </div>
            <Field label="Observações (opcional)" error={errors.notes?.message}>
              <textarea
                {...register("notes")}
                rows={4}
                maxLength={1500}
                placeholder="Fale sobre sua ideia, referências e o que você gostaria de explorar com o artista."
              />
            </Field>
            {formError && (
              <p className={styles.error} role="alert">
                {formError}
              </p>
            )}
            <button
              className="button"
              type="submit"
              disabled={
                !selected.length ||
                (!!conflicts.length && conflictMode !== "hide")
              }
            >
              <MessageCircle size={16} /> Registrar pedido de demonstração{" "}
              <ArrowRight size={15} />
            </button>
            <span className={styles.help}>
              Este botão salva um registro local. Você pode revisar a mensagem
              antes de qualquer envio futuro.
            </span>
          </form>
          <aside className={styles.quoteAside}>
            <div className={styles.summary}>
              <p className="eyebrow">SUA PRÓXIMA CONEXÃO</p>
              <h2>{studio?.name}</h2>
              <p className={styles.meta}>
                {studio?.city}, {studio?.state} · Estúdio fictício
              </p>
              <dl>
                <dt>Projeto</dt>
                <dd>{project?.name}</dd>
                <dt>Referências selecionadas</dt>
                <dd>{selected.length}</dd>
                <dt>Cliente</dt>
                <dd>{profile.name}</dd>
                <dt>Valor</dt>
                <dd>A definir com o artista</dd>
              </dl>
              <hr />
              <button
                className="button secondary"
                type="button"
                disabled
                style={{ width: "100%" }}
              >
                <MessageCircle size={15} /> WhatsApp indisponível no demo
              </button>
              <p className={styles.help}>
                Os contatos demonstrativos não são usados para envio. Após
                registrar o pedido, consulte a prévia do texto.
              </p>
            </div>
            <div className={styles.note}>
              <ShieldCheck size={18} />
              <span>
                Autoria em primeiro lugar. Apenas artes deste estúdio e suas
                referências pessoais entram neste pedido.
              </span>
            </div>
          </aside>
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 30 }}>
          <FolderOpen size={38} />
          <h2>
            {projects.length
              ? "Nenhum estúdio ativo disponível."
              : "Crie seu primeiro projeto."}
          </h2>
          <p>
            {projects.length
              ? "Um estúdio precisa ser ativado no painel local para receber novos pedidos."
              : "Reúna pelo menos uma referência para conversar com um estúdio."}
          </p>
          <Link
            className="button"
            href={projects.length ? "/estudios" : "/simulador"}
          >
            {projects.length ? "Explorar estúdios" : "Criar projeto"}{" "}
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <section style={{ marginTop: 45 }}>
        <div className="section-title">
          <div>
            <p className="eyebrow">CADA IDEIA, UMA CONVERSA</p>
            <h2>Meus pedidos</h2>
          </div>
          <span className={styles.meta}>{history.length} registros locais</span>
        </div>
        {history.length ? (
          history.map((quote) => (
            <article key={quote.id} className={styles.quoteCard}>
              <div className={styles.row}>
                <span className={styles.meta}>
                  {quote.id} · {formattedDate(quote.createdAt)}
                </span>
                <span className="chip">
                  {quote.status === "completed"
                    ? "Concluído"
                    : quote.status === "contacted"
                      ? "Em conversa"
                      : "Pendente"}{" "}
                  · demo
                </span>
              </div>
              <h3>{quote.projectName}</h3>
              <p>
                {state.studios.find((entry) => entry.id === quote.studioId)
                  ?.name ?? "Estúdio indisponível"}{" "}
                · {quote.items.length}{" "}
                {quote.items.length === 1 ? "referência" : "referências"} ·{" "}
                {quote.region || "Região a combinar"}
              </p>
              <details>
                <summary>Ver referências e prévia da mensagem</summary>
                <div className={styles.itemList} style={{ marginTop: 15 }}>
                  {quote.items.map((item) => (
                    <div className={styles.quoteItem} key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
                <pre>{buildWhatsAppMessage(quote)}</pre>
                <div className={styles.row}>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => copyMessage(quote)}
                  >
                    <Copy size={14} /> Copiar prévia
                  </button>
                  {projects.some((entry) => entry.id === quote.projectId) && (
                    <Link
                      href={`/simulador?project=${encodeURIComponent(quote.projectId)}`}
                      className="button secondary"
                    >
                      Abrir projeto <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
                <p>
                  Nenhuma mensagem foi enviada pelo aplicativo. Este registro é
                  demonstrativo.
                </p>
              </details>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <MessageCircle size={30} />
            <h3>Suas conversas começam por aqui.</h3>
            <p>
              Os pedidos registrados neste navegador aparecerão neste espaço.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
