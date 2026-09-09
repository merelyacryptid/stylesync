// Calls the FastAPI backend (services/api) for real, budget-optimized outfit curation.
// This is separate from lib/supabase.ts, which handles auth and guest->account migration.

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

type BackendProject = {
  id: string;
  project_name?: string;
  max_budget_minor?: number;
  currency?: string;
  required_categories?: string[];
  event_description?: string;
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

async function backendFetch<T>(
  path: string,
  accessToken: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else {
    headers["X-Guest-Token"] = getGuestToken();
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();

    throw new Error(
      `Backend request failed: ${res.status} ${res.statusText} - ${body}`
    );
  }

  return res.json() as Promise<T>;
}

const DEFAULT_CATEGORIES = [
  "Main Outfit",
  "Outerwear",
  "Footwear",
  "Hair Accessories",
  "Jewelry",
  "Handbag / Carry",
];

/**
 * Creates a backend project and generates real curated boards.
 *
 * IMPORTANT:
 * We intentionally DO NOT reuse the first existing guest project when
 * the backend returns 409.
 *
 * Reusing existing[0] was causing a bug where:
 *
 *   ₹4,000 project
 *        ↓
 *   user changes to ₹6,000
 *        ↓
 *   POST /projects → 409
 *        ↓
 *   existing[0] is reused
 *        ↓
 *   curations are generated for the OLD ₹4,000 project
 *
 * That made the UI appear to ignore the new budget.
 *
 * Until the backend's project-update/reuse behaviour is confirmed,
 * a 409 is now surfaced instead of silently generating the wrong data.
 */
export async function fetchRealCurations(
  input: {
    name: string;
    budgetRupees: number;
    prompt: string;
  },
  accessToken: string | null,
  boardCount = 3
): Promise<BackendCuration[]> {
  const budgetMinor = Math.round(input.budgetRupees * 100);

  console.log("[StyleSync] Creating project:", {
    name: input.name,
    budgetRupees: input.budgetRupees,
    budgetMinor,
    prompt: input.prompt,
    boardCount,
    hasAccessToken: Boolean(accessToken),
    guestToken: accessToken ? null : getGuestToken(),
  });

  let project: BackendProject;

  try {
    project = await backendFetch<BackendProject>(
      "/api/v1/projects",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          project_name: input.name,
          max_budget_minor: budgetMinor,
          currency: "INR",
          required_categories: DEFAULT_CATEGORIES,
          event_description: input.prompt,
        }),
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error("[StyleSync] Project creation failed:", message);

    // DO NOT silently reuse an old project.
    //
    // A 409 means the backend has rejected this project creation.
    // We need to know what the backend expects before deciding whether
    // to update or reuse an existing project.
    if (message.includes("409")) {
      throw new Error(
        `The backend rejected the new project with 409 Conflict. ` +
          `The previous project was NOT reused because that could generate ` +
          `curations using the old budget. Backend response: ${message}`
      );
    }

    throw err;
  }

  if (!project?.id) {
    throw new Error(
      "Backend created the project but did not return a project ID."
    );
  }

  console.log("[StyleSync] Project created successfully:", {
    projectId: project.id,
    budgetMinor,
  });

  const curationPath = `/api/v1/projects/${encodeURIComponent(
    project.id
  )}/curations/generate`;

  console.log("[StyleSync] Generating curations:", {
    projectId: project.id,
    budgetRupees: input.budgetRupees,
    budgetMinor,
    boardCount,
    endpoint: curationPath,
  });

  const curations = await backendFetch<BackendCuration[]>(
    curationPath,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        sizes: {},
        board_count: boardCount,
      }),
    }
  );

  console.log("[StyleSync] Curations received:", {
    projectId: project.id,
    count: curations.length,
    curations,
  });

  return curations;
}

/**
 * Fetches other in-stock items in the same category,
 * for the Mix & Match swap action.
 */
export async function fetchCategoryAlternatives(
  category: string,
  excludeProductId: string
): Promise<BackendProduct[]> {
  const products = await backendFetch<BackendProduct[]>(
    `/api/v1/catalog/products?category=${encodeURIComponent(category)}`,
    null
  );

  return products.filter(
    (product) =>
      product.product_id !== excludeProductId && product.is_available
  );
}

