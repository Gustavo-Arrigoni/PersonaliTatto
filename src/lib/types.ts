export type Role = "client" | "studio" | "admin";
export type Plan = "basic" | "pro";
export type QuoteStatus = "pending" | "contacted" | "completed";
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  studioId?: string;
}
export interface Studio {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  address: string;
  description: string;
  styles: string[];
  image: string;
  initials: string;
  plan: Plan;
  active: boolean;
  instagram: string;
  whatsapp: string;
  isDemo: boolean;
}
export interface StudioMember {
  id: string;
  studioId: string;
  name: string;
  specialty: string;
  initials: string;
}
export interface TattooArt {
  id: string;
  studioId: string;
  authorId: string;
  name: string;
  description: string;
  style: string;
  tags: string[];
  image: string;
  published: boolean;
  publicDemo: boolean;
  details?: string;
}
export interface TattooTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  opacity: number;
  mirrored: boolean;
}
export interface ProjectTattoo {
  id: string;
  artId?: string;
  name: string;
  image: string;
  origin: "studio" | "upload";
  ownerStudioId?: string;
  region?: string;
  dimensions?: string;
  transform?: TattooTransform;
}
export interface Project {
  id: string;
  userId: string;
  name: string;
  model: "sphere-preview" | "male" | "female";
  studioId?: string;
  tattoos: ProjectTattoo[];
  createdAt: string;
  updatedAt: string;
}
export interface QuoteRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  studioId: string;
  projectId: string;
  projectName: string;
  items: ProjectTattoo[];
  notes: string;
  region: string;
  dimensions: string;
  status: QuoteStatus;
  createdAt: string;
  isDemo: boolean;
}
export interface DemoState {
  version: 1;
  studios: Studio[];
  members: StudioMember[];
  arts: TattooArt[];
  projects: Project[];
  quotes: QuoteRequest[];
  profiles: Profile[];
  session: Profile | null;
}
export interface Subscription {
  studioId: string;
  plan: Plan;
  status: "demo";
  monthlyPrice: number;
}
export interface StudioRepository {
  list(): Promise<Studio[]>;
  find(id: string): Promise<Studio | undefined>;
}
export interface ProjectRepository {
  list(userId: string): Promise<Project[]>;
  save(project: Project): Promise<void>;
}
export interface AuthRepository {
  current(): Promise<Profile | null>;
  signOut(): Promise<void>;
}
