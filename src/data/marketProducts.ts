export type ProductStatus = "Available" | "Out of Stock" | "Unavailable";

export interface Product {
  id: string;
  ownerId?: string;
  photoPath?: string;
  updatedAt?: string;
  name: string;
  category: "Vegetables & Fruits" | "Rice & Grains" | "Livestock & Poultry" | "Fish & Seafood" | "Processed Products" | "Others";
  type: "Farm Product" | "Fishery Product" | "Processed Product";
  seller: string;
  sellerPhone: string;
  location: string;
  price: number;
  unit: string;
  availableStock: number;
  stockUnit: string;
  image: string;
  description: string;
  harvestDate?: string;
  rating?: number;
  isFeatured?: boolean;
  createdAt?: string;
  status?: ProductStatus;
  agreedToRules?: boolean;
  agreedAt?: string;
  is_hidden?: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Fresh Vegetables Bundle",
    category: "Vegetables & Fruits",
    type: "Farm Product",
    seller: "Juan Dela Cruz",
    sellerPhone: "+63 917 123 4567",
    location: "San Isidro, Sorsogon",
    price: 50.00,
    unit: "kg",
    availableStock: 50,
    stockUnit: "kg",
    image: "/assets/images/market/vegetables-bundle.jpg",
    description: "Farm-fresh bundle containing kangkong, pechay, native tomatoes, and fresh eggplant harvested at dawn. Grown organically without synthetic chemical pesticides.",
    harvestDate: "Daily Harvest",
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: "prod-2",
    name: "Fresh Tilapia",
    category: "Fish & Seafood",
    type: "Fishery Product",
    seller: "Maria Santos",
    sellerPhone: "+63 928 234 5678",
    location: "Pilar, Sorsogon",
    price: 120.00,
    unit: "kg",
    availableStock: 30,
    stockUnit: "kg",
    image: "/assets/images/market/fresh-tilapia.jpg",
    description: "Sustainably cage-raised freshwater tilapia from clean inland waters. Fresh, firm meat, cleaned on request, and packed directly on ice.",
    harvestDate: "Harvested Today",
    rating: 4.8,
    isFeatured: true,
  },
  {
    id: "prod-3",
    name: "Saba Banana",
    category: "Vegetables & Fruits",
    type: "Farm Product",
    seller: "Ramon Reyes",
    sellerPhone: "+63 939 345 6789",
    location: "Donsol, Sorsogon",
    price: 40.00,
    unit: "kg",
    availableStock: 100,
    stockUnit: "kg",
    image: "/assets/images/market/saba-banana.jpg",
    description: "Sweet and firm Saba bananas, naturally ripened on tree. Ideal for banana cue, turon, nilaga, or healthy snacks. Directly sourced from hillside agroforests.",
    harvestDate: "2 days ago",
    rating: 4.7,
    isFeatured: true,
  },
  {
    id: "prod-4",
    name: "Dried Tuyo",
    category: "Fish & Seafood",
    type: "Fishery Product",
    seller: "Liza Perez",
    sellerPhone: "+63 945 456 7890",
    location: "Matnog, Sorsogon",
    price: 250.00,
    unit: "pack",
    availableStock: 20,
    stockUnit: "packs",
    image: "/assets/images/market/dried-tuyo.jpg",
    description: "Sun-dried salted herring (tuyo) cured using traditional coastal artisanal methods. Crispy, non-bitter, and hygienically vacuum-packed for freshness.",
    harvestDate: "Artisanal Cured Batch",
    rating: 5.0,
    isFeatured: true,
  },
  {
    id: "prod-5",
    name: "Local Rice (Sinandomeng)",
    category: "Rice & Grains",
    type: "Farm Product",
    seller: "Alvin Garcia",
    sellerPhone: "+63 956 567 8901",
    location: "Bulusan, Sorsogon",
    price: 45.00,
    unit: "kg",
    availableStock: 200,
    stockUnit: "kg",
    image: "/assets/images/market/sinandomeng-rice.jpg",
    description: "First-class polished Sinandomeng white rice. Fluffy, fragrant when cooked, and milled from high-yielding irrigated rice paddies of Bulusan.",
    harvestDate: "Milled this week",
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: "prod-6",
    name: "Sweet Potato (Kamote)",
    category: "Vegetables & Fruits",
    type: "Farm Product",
    seller: "Elena Cruz",
    sellerPhone: "+63 967 678 9012",
    location: "Castilla, Sorsogon",
    price: 35.00,
    unit: "kg",
    availableStock: 80,
    stockUnit: "kg",
    image: "/assets/images/market/sweet-potato.jpg",
    description: "Naturally grown purple-skin sweet potatoes with sweet yellow-orange flesh. Packed with fiber and beta-carotene, perfect for boiling, roasting, or snacks.",
    harvestDate: "Harvested Yesterday",
    rating: 4.6,
    isFeatured: true,
  },
  {
    id: "prod-7",
    name: "Fresh Shrimp (Hipon)",
    category: "Fish & Seafood",
    type: "Fishery Product",
    seller: "Rodolfo Lim",
    sellerPhone: "+63 978 789 0123",
    location: "Gubat, Sorsogon",
    price: 350.00,
    unit: "kg",
    availableStock: 15,
    stockUnit: "kg",
    image: "/assets/images/market/fresh-shrimp.jpg",
    description: "Wild coastal caught medium-to-large pacific white shrimp (suahe/hipon). Freshly caught from coastal waters, chilled immediately to preserve juicy texture.",
    harvestDate: "Dawn Catch",
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: "prod-8",
    name: "Virgin Coconut Oil",
    category: "Processed Products",
    type: "Processed Product",
    seller: "Ana Santos",
    sellerPhone: "+63 989 890 1234",
    location: "Irosin, Sorsogon",
    price: 180.00,
    unit: "bottle",
    availableStock: 25,
    stockUnit: "bottles",
    image: "/assets/images/market/virgin-coconut-oil.jpg",
    description: "100% pure cold-pressed extra virgin coconut oil made from freshly harvested mature coconuts. Great for dietary cooking, skin moisturizer, and wellness.",
    harvestDate: "Fresh Batch",
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: "prod-9",
    name: "Native Chicken (Free-Range)",
    category: "Livestock & Poultry",
    type: "Farm Product",
    seller: "Benito Flores",
    sellerPhone: "+63 995 901 2345",
    location: "Catbalogan City, Samar",
    price: 280.00,
    unit: "kg",
    availableStock: 12,
    stockUnit: "heads",
    image: "/assets/images/market/native-chicken.jpg",
    description: "Free-range pasture-raised native chicken fed with grains and greens. Lean, flavorful meat ideal for traditional tinola and native pinaupo.",
    harvestDate: "Live or Dressed on Order",
    rating: 4.8,
    isFeatured: false,
  },
  {
    id: "prod-10",
    name: "Fresh Mud Crab (Alimango)",
    category: "Fish & Seafood",
    type: "Fishery Product",
    seller: "Danilo Ramos",
    sellerPhone: "+63 918 345 6789",
    location: "Basey, Samar",
    price: 550.00,
    unit: "kg",
    availableStock: 18,
    stockUnit: "kg",
    image: "/assets/images/market/mud-crab.jpg",
    description: "Fat, meaty mangrove mud crabs harvested from Samar mangrove estuaries. Solid claws and rich roe (aligue), tied securely and alive upon delivery.",
    harvestDate: "Fresh Catch",
    rating: 5.0,
    isFeatured: false,
  },
  {
    id: "prod-11",
    name: "Fresh Calamansi",
    category: "Vegetables & Fruits",
    type: "Farm Product",
    seller: "Clara Mendoza",
    sellerPhone: "+63 929 456 7891",
    location: "Calbayog City, Samar",
    price: 60.00,
    unit: "kg",
    availableStock: 45,
    stockUnit: "kg",
    image: "/assets/images/market/calamansi.jpg",
    description: "Juicy, freshly picked green Philippine limes (calamansi). Rich in vitamin C, perfect for refreshing citrus juice, marinades, and dipping sauces.",
    harvestDate: "Harvested Today",
    rating: 4.7,
    isFeatured: false,
  }
];

export const MARKET_CATEGORIES = [
  "All Products",
  "Vegetables & Fruits",
  "Rice & Grains",
  "Livestock & Poultry",
  "Fish & Seafood",
  "Processed Products",
  "Others"
] as const;

export const MARKET_LOCATIONS = [
  "All Locations",
  "San Isidro, Sorsogon",
  "Pilar, Sorsogon",
  "Donsol, Sorsogon",
  "Matnog, Sorsogon",
  "Bulusan, Sorsogon",
  "Castilla, Sorsogon",
  "Gubat, Sorsogon",
  "Irosin, Sorsogon",
  "Catbalogan City, Samar",
  "Calbayog City, Samar",
  "Basey, Samar"
];

export function getProductEffectiveStatus(product: Product): ProductStatus {
  if (product.status === "Unavailable") {
    return "Unavailable";
  }
  if (product.status === "Out of Stock" || product.availableStock <= 0) {
    return "Out of Stock";
  }
  return product.status || "Available";
}

