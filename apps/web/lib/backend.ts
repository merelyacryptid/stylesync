// Calls the FastAPI backend (services/api) for real, budget-optimized outfit curation.
// This is separate from lib/supabase.ts, which handles auth and the guest->account migration.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const GUEST_TOKEN_KEY = "stylesync_guest_token";

export type BackendProduct = {
  product_id: string;
  source_platform: string;
  title: string;
  brand: string | null;
  product_url: string;
  current_price_minor: number;
  estimated_shipping_minor: number;
  primary_image_url: string;
  in_stock_sizes: string[];
  is_available: boolean;
  primary_category: string;
  sub_category: string | null;
};

export type BackendCuration = {
  id: string;
  project_id: string;
  total_price_minor: number;
  shipping_total_minor: number;
  compatibility_score: number;
  items: BackendProduct[];
};

function getGuestToken(): string {
  if (typeof window === "undefined") return "";
  let token = window.localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

async function backendFetch<T>(path: string, accessToken: string | null, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else {
    headers["X-Guest-Token"] = getGuestToken();
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

const DEFAULT_CATEGORIES = ["Main Outfit", "Outerwear", "Footwear", "Hair Accessories", "Jewelry", "Handbag / Carry"];

/**
 * Creates (or reuses, for guests) a backend project and generates real curated boards
 * for it. Returns the raw curations — caller maps them into whatever shape the UI needs.
 */
export async function fetchRealCurations(
  input: { name: string; budgetRupees: number; prompt: string },
  accessToken: string | null,
  boardCount = 3
): Promise<BackendCuration[]> {
  const project = await backendFetch<{ id: string }>("/api/v1/projects", accessToken, {
    method: "POST",
    body: JSON.stringify({
      project_name: input.name,
      max_budget_minor: Math.round(input.budgetRupees * 100),
      currency: "INR",
      required_categories: DEFAULT_CATEGORIES,
      event_description: input.prompt
    })
  }).catch(async (err) => {
    // Guests get exactly one project on the backend; a 409 here means it already exists —
    // fetch it instead of failing the whole flow.
    if (String(err).includes("409")) {
      const existing = await backendFetch<{ id: string }[]>("/api/v1/projects", accessToken);
      return existing[0];
    }
    throw err;
  });

  return backendFetch<BackendCuration[]>(`/api/v1/projects/${project.id}/curations/generate`, accessToken, {
    method: "POST",
    body: JSON.stringify({ sizes: {}, board_count: boardCount })
  });
}

/** Fetches other in-stock items in the same category, for the Mix & Match swap action. */
export async function fetchCategoryAlternatives(category: string, excludeProductId: string): Promise<BackendProduct[]> {
  const products = await backendFetch<BackendProduct[]>(
    `/api/v1/catalog/products?category=${encodeURIComponent(category)}`,
    null
  );
  return products.filter((p) => p.product_id !== excludeProductId && p.is_available);
}
