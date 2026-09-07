export type DemoProduct = {
  id: string;
  category: string;
  name: string;
  brand: string;
  retailer: string;
  price: number;
  currency: "INR";
  sizes: string[];
  inStock: boolean;
  image: string;
  vibeTags: string[];
  sourceUpdatedAt: string;
  productUrl: string;
};

// Course-project fixture data. Names, brands, retailers, prices, and product URLs are fictional.
// Unsplash URLs are temporary visual placeholders, not retailer product images.
export const demoCatalog: DemoProduct[] = [
  { id: "demo-dress-001", category: "Dress", name: "Rose satin slip dress", brand: "Mira Studio", retailer: "StyleSync Demo Shop", price: 1890, currency: "INR", sizes: ["S", "M", "L"], inStock: true, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=80", vibeTags: ["Soft romance", "Y2K glow"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/rose-satin-slip-dress" },
  { id: "demo-layer-001", category: "Outerwear", name: "Cloud white shrug", brand: "Nila Edit", retailer: "StyleSync Demo Shop", price: 899, currency: "INR", sizes: ["XS", "S", "M", "L"], inStock: true, image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=80", vibeTags: ["Coastal muse", "Old money"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/cloud-white-shrug" },
  { id: "demo-shoes-001", category: "Shoes", name: "Strappy kitten heels", brand: "Aster Steps", retailer: "StyleSync Demo Shop", price: 1199, currency: "INR", sizes: ["EU 37", "EU 38", "EU 39"], inStock: true, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80", vibeTags: ["Soft romance", "City cool"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/strappy-kitten-heels" },
  { id: "demo-bag-001", category: "Bag", name: "Mini shoulder bag", brand: "Lune Carry", retailer: "StyleSync Demo Shop", price: 772, currency: "INR", sizes: ["One size"], inStock: true, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80", vibeTags: ["Y2K glow", "City cool"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/mini-shoulder-bag" },
  { id: "demo-top-001", category: "Top", name: "Butterfly sleeve blouse", brand: "Mira Studio", retailer: "StyleSync Demo Shop", price: 1120, currency: "INR", sizes: ["S", "M", "L", "XL"], inStock: true, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80", vibeTags: ["Desi modern", "Soft romance"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/butterfly-sleeve-blouse" },
  { id: "demo-bottom-001", category: "Bottom", name: "Wide-leg sand trousers", brand: "Nila Edit", retailer: "StyleSync Demo Shop", price: 1450, currency: "INR", sizes: ["28", "30", "32", "34"], inStock: true, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80", vibeTags: ["Old money", "Coastal muse"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/wide-leg-sand-trousers" },
  { id: "demo-jewelry-001", category: "Jewellery", name: "Pearl drop earrings", brand: "Aster Steps", retailer: "StyleSync Demo Shop", price: 540, currency: "INR", sizes: ["One size"], inStock: true, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80", vibeTags: ["Old money", "Soft romance"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/pearl-drop-earrings" },
  { id: "demo-ethnic-001", category: "Ethnic wear", name: "Marigold kurta set", brand: "Rang Studio", retailer: "StyleSync Demo Shop", price: 2290, currency: "INR", sizes: ["S", "M", "L", "XL"], inStock: true, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80", vibeTags: ["Desi modern", "Coastal muse"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/marigold-kurta-set" },
  { id: "demo-hair-001", category: "Hair accessory", name: "Cherry silk bow", brand: "Lune Carry", retailer: "StyleSync Demo Shop", price: 320, currency: "INR", sizes: ["One size"], inStock: true, image: "https://images.unsplash.com/photo-1599950755342-5f0f0e25db16?auto=format&fit=crop&w=700&q=80", vibeTags: ["Y2K glow", "Soft romance"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/cherry-silk-bow" },
  { id: "demo-glasses-001", category: "Eyewear", name: "Amber oval sunglasses", brand: "Aster Steps", retailer: "StyleSync Demo Shop", price: 980, currency: "INR", sizes: ["One size"], inStock: true, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80", vibeTags: ["City cool", "Y2K glow"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/amber-oval-sunglasses" },
  { id: "demo-skirt-001", category: "Bottom", name: "Ink pleated midi skirt", brand: "Nila Edit", retailer: "StyleSync Demo Shop", price: 1350, currency: "INR", sizes: ["S", "M", "L"], inStock: true, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=700&q=80", vibeTags: ["City cool", "Old money"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/ink-pleated-midi-skirt" },
  { id: "demo-dress-002", category: "Dress", name: "Citrus wrap dress", brand: "Rang Studio", retailer: "StyleSync Demo Shop", price: 2100, currency: "INR", sizes: ["S", "M", "L"], inStock: false, image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=700&q=80", vibeTags: ["Coastal muse", "Desi modern"], sourceUpdatedAt: "2026-09-06", productUrl: "https://example.com/demo/citrus-wrap-dress" }
];

export const demoStudioItems = [
  demoCatalog[0],
  demoCatalog[1],
  demoCatalog[2],
  demoCatalog[3]
];
