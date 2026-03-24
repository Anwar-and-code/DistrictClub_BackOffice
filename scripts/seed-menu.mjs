/**
 * Seed District Club POS menu: categories + products
 * Usage: node scripts/seed-menu.mjs
 */

const URL_BASE = "https://wnzsgcdgzendvgxzhode.supabase.co/rest/v1"
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduenNnY2RnemVuZHZneHpob2RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk2MzU1MSwiZXhwIjoyMDg5NTM5NTUxfQ.ag7g8GjI69tdDtqRLSmMID8SINwD9wf7nqB31WglBEY"

const HEADERS = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

async function req(method, path, body) {
  const res = await fetch(`${URL_BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

// ── 1. Deactivate old categories & products ──────────────────────────────────
console.log("Deactivating old categories and products...")
await req("PATCH", "/pos_products?is_active=eq.true", { is_active: false })
await req("PATCH", "/pos_categories?is_active=eq.true", { is_active: false })

// ── 2. Upsert new categories ──────────────────────────────────────────────────
const categoryDefs = [
  { name: "Petit-Déjeuner & Snacks", icon: "cookie",     display_order: 1, is_active: true },
  { name: "Cafés & Thés",            icon: "coffee",     display_order: 2, is_active: true },
  { name: "Salades",                 icon: "circle-dot", display_order: 3, is_active: true },
  { name: "Boissons Fraîches",       icon: "cup-soda",   display_order: 4, is_active: true },
  { name: "Desserts",                icon: "cookie",     display_order: 5, is_active: true },
]

console.log("Inserting categories...")
const insertedCats = await req("POST", "/pos_categories", categoryDefs)
console.log("Categories inserted:", insertedCats.map(c => `${c.id}: ${c.name}`))

// Build name → id map
const catMap = {}
for (const c of insertedCats) catMap[c.name] = c.id

// ── 3. Insert products ────────────────────────────────────────────────────────
const productDefs = [
  // Petit-Déjeuner & Snacks
  { cat: "Petit-Déjeuner & Snacks", name: "Manaïch Zaatar",                           price: 2500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Manaïch Fromage",                          price: 2500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Manaïch Mix",                              price: 2500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Granola maison",                           price: 5000 },
  { cat: "Petit-Déjeuner & Snacks", name: "Crackers au zaatar",                       price: 3500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Brioche au zaatar & fromage de chèvre",    price: 4500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Pain de mie beurre de cacahuète & banane", price: 3500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Pain de mie halloumi & miel",              price: 5500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Cookies healthy chocolat",                 price: 2000 },
  { cat: "Petit-Déjeuner & Snacks", name: "Pancakes healthy",                         price: 4500 },
  { cat: "Petit-Déjeuner & Snacks", name: "Crêpes healthy",                           price: 4000 },
  // Cafés & Thés
  { cat: "Cafés & Thés", name: "Espresso",                 price: 2000 },
  { cat: "Cafés & Thés", name: "Americano",                price: 3000 },
  { cat: "Cafés & Thés", name: "Cappuccino",               price: 4000 },
  { cat: "Cafés & Thés", name: "Latte classique",          price: 4000 },
  { cat: "Cafés & Thés", name: "Flat White",               price: 3000 },
  { cat: "Cafés & Thés", name: "Chocolat chaud",           price: 3500 },
  { cat: "Cafés & Thés", name: "Matcha Latte",             price: 5000 },
  { cat: "Cafés & Thés", name: "Espresso à l'eau de coco", price: 2500 },
  { cat: "Cafés & Thés", name: "Caramel Frappé",           price: 4500 },
  { cat: "Cafés & Thés", name: "Iced Rose Matcha",         price: 5000 },
  { cat: "Cafés & Thés", name: "Spanish Latte",            price: 5000 },
  { cat: "Cafés & Thés", name: "Affogato",                 price: 4000 },
  { cat: "Cafés & Thés", name: "Thés Dammann Frères",      price: 2500 },
  // Salades
  { cat: "Salades", name: "Salade thaï aux crevettes",   price: 10000 },
  { cat: "Salades", name: "Salade de boule de chèvre",   price: 10000 },
  { cat: "Salades", name: "Salade césar façon District", price: 10000 },
  { cat: "Salades", name: "Salade Friké au poulet",      price: 10000 },
  // Boissons Fraîches
  { cat: "Boissons Fraîches", name: "Perrier",                price: 2000 },
  { cat: "Boissons Fraîches", name: "Red Bull",               price: 2000 },
  { cat: "Boissons Fraîches", name: "Eau minérale (petite)",  price:  500 },
  { cat: "Boissons Fraîches", name: "Eau minérale (grande)",  price: 1000 },
  { cat: "Boissons Fraîches", name: "Eau de coco",            price: 2000 },
  { cat: "Boissons Fraîches", name: "Jus nature",             price: 3000 },
  { cat: "Boissons Fraîches", name: "Mocktail fait maison",   price: 3500 },
  { cat: "Boissons Fraîches", name: "Detox Shot",             price: 1500 },
  // Desserts
  { cat: "Desserts", name: "Cake matcha",             price: 4000 },
  { cat: "Desserts", name: "Brownie double chocolat", price: 4000 },
  { cat: "Desserts", name: "Cake thé chaï & amande",  price: 4000 },
  { cat: "Desserts", name: "Tiramisu healthy",        price: 4000 },
  { cat: "Desserts", name: "Energy Ball",             price: 1500 },
  { cat: "Desserts", name: "Lazy cake",               price: 3000 },
]

const productsPayload = productDefs.map(p => ({
  category_id:      catMap[p.cat],
  name:             p.name,
  product_type:     "bien",
  price:            p.price,
  price_ttc:        p.price,
  selling_price_ht: p.price,
  tax_rate:         0,
  purchase_price:   0,
  stock_quantity:   null,
  is_active:        true,
}))

console.log("Inserting products...")
const insertedProds = await req("POST", "/pos_products", productsPayload)
console.log(`✓ ${insertedProds.length} products inserted.`)
console.log("Done!")
