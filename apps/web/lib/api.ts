const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const GUEST_TOKEN_KEY = "stylesync_guest_token";

export type Product = {
  product_id: string;
  source_platform: string;
  title: string;
  brand: string | null;
  product_url: string;
  current_price_minor: number;
  original_mrp_minor: number | null;
  currency: string;
  estimated_shipping_minor: number;
  primary_image_url: string;
  in_stock_sizes: string[];
  is_available: boolean;
  primary_category: string;
  sub_category: string | null;
  color: string | null;
  occasions: string[];
};

export type ProjectDTO = {
  id: string;
  project_name: string;
  max_budget_minor: number;
  currency: string;
  required_categories: string[];
  event_description: string | null;
  status: string;
};

export type CurationDTO = {
  id: string;
  project_id: string;
  item_ids: string[];
  total_price_minor: number;
  shipping_total_minor: number;
  compatibility_score: number;
  is_custom_mix: boolean;
  items: Product[];
};

export function getGuestToken(): string {
  if (typeof window === "undefined") return "";
  let token = window.localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

function authHeaders(): Record<string, string> {
  // Swap this for `{ Authorization: \`Bearer ${supabaseAccessToken}\` }` once sign-in is wired up.
  return { "X-Guest-Token": getGuestToken() };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers ?? {})
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const DEFAULT_CATEGORIES = [
  "Main Outfit",
  "Outerwear",
  "Footwear",
  "Hair Accessories",
  "Jewelry",
  "Handbag / Carry"
];

export function createProject(input: {
  project_name: string;
  max_budget_minor: number;
  event_description: string;
  required_categories?: string[];
}): Promise<ProjectDTO> {
  return request<ProjectDTO>("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify({
      required_categories: DEFAULT_CATEGORIES,
      currency: "INR",
      ...input
    })
  });
}

export function generateCurations(projectId: string, boardCount = 3): Promise<CurationDTO[]> {
  return request<CurationDTO[]>(`/api/v1/projects/${projectId}/curations/generate`, {
    method: "POST",
    body: JSON.stringify({ sizes: {}, board_count: boardCount })
  });
}

export function listCatalog(category?: string): Promise<Product[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return request<Product[]>(`/api/v1/catalog/products${qs}`);
}

export function saveCustomMix(projectId: string, itemIds: string[]): Promise<CurationDTO> {
  return request<CurationDTO>(`/api/v1/projects/${projectId}/curations/custom-mix`, {
    method: "POST",
    body: JSON.stringify({ item_ids: itemIds })
  });
}

export function markBought(projectId: string, curationId: string): Promise<CurationDTO> {
  return request<CurationDTO>(`/api/v1/projects/${projectId}/curations/${curationId}/mark-bought`, {
    method: "POST"
  });
}

export function rupees(minor: number): string {
  return (minor / 100).toLocaleString("en-IN");
}
