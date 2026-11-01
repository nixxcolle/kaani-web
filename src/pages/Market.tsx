import { useText } from "@/lib/translate";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Search, 
  LayoutGrid, 
  MapPin, 
  ChevronRight, 
  ChevronDown,
  Heart, 
  MessageCircle, 
  Phone, 
  PlusCircle, 
  CheckCircle2, 
  Filter, 
  Tag, 
  Sparkles, 
  Sprout, 
  Fish, 
  Apple, 
  Wheat, 
  Egg, 
  Package, 
  MoreHorizontal,
  X,
  Share2,
  Calendar,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  ArrowUpDown,
  Flag,
  AlertCircle,
  Ban,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Languages
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Product, 
  ProductStatus,
  MARKET_CATEGORIES, 
  MARKET_LOCATIONS,
  getProductEffectiveStatus
} from "@/data/marketProducts";
import { calculateCommission, recordMarketTransaction, formatPeso } from "@/lib/commission";
import { useLanguage } from "@/lib/language-context";
import { 
  ReportCategory, 
  REPORT_CATEGORIES, 
  submitMarketReport, 
} from "@/lib/reports";
import { supabase } from '@/lib/supabase';
import { fetchProducts, saveProduct, deleteProduct, validatePhoto } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import heroBannerImg from "@/assets/images/market-hero-banner.jpg";

const categoryIcons: Record<string, React.ElementType> = {
  "All Products": Sprout,
  "Vegetables & Fruits": Apple,
  "Rice & Grains": Wheat,
  "Livestock & Poultry": Egg,
  "Fish & Seafood": Fish,
  "Processed Products": Package,
  "Others": MoreHorizontal,
};

const ITEMS_PER_PAGE = 8;

// Normalize image paths stored as /assets/... to work under the Vite base path.
const prodImg = (src: string) =>
  src.startsWith("/assets/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;

const EMPTY_PRODUCT: Partial<Product> = { name: '', category: 'Vegetables & Fruits', type: 'Farm Product', price: 50, unit: 'kg', availableStock: 0, stockUnit: 'kg', status: 'Available', location: 'Catbalogan City, Samar', seller: '', sellerPhone: '', description: '', image: '' };

const Market = () => {
  const tx = useText();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("cat") || "All Products";

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [myProducts, setMyProducts] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const { toast } = useToast();
  const catalogRequest = useRef(0);
  const mutationPending = useRef(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const reloadProducts = useCallback(async () => {
    const request = ++catalogRequest.current;
    try {
      const data = await fetchProducts();
      if (request === catalogRequest.current) { setProducts(data); setDetailProduct(previous => previous ? data.find(product => product.id === previous.id) || null : null); setContactProduct(previous => previous ? data.find(product => product.id === previous.id) || null : null); setCatalogError(''); }
    } catch (error) {
      if (request === catalogRequest.current) setCatalogError(error instanceof Error ? error.message : 'Products could not be loaded.');
    } finally { if (request === catalogRequest.current) setCatalogLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    const refreshUser = async () => { const { data } = await supabase.auth.getUser(); if (active) setOwnerId(data.user?.id || null); };
    void refreshUser(); void reloadProducts();
    window.addEventListener('auth-change', refreshUser); window.addEventListener('focus', reloadProducts);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { if (active) { setOwnerId(session?.user.id || null); if (!session?.user) setMyProducts(false); } });
    const channel = supabase.channel('marketplace-catalog').on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_products' }, () => { void reloadProducts(); }).subscribe();
    const interval = setInterval(() => { if (document.visibilityState === 'visible') void reloadProducts(); }, 30000);
    return () => { active = false; subscription.unsubscribe(); void supabase.removeChannel(channel); clearInterval(interval); window.removeEventListener('auth-change', refreshUser); window.removeEventListener('focus', reloadProducts); };
  }, [reloadProducts]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState<string>("All Locations");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("kaani_market_favs");
      return saved ? JSON.parse(saved) : ["prod-1", "prod-4"];
    } catch {
      return ["prod-1"];
    }
  });

  const { language, t } = useLanguage();

  // Modals & Flows
  const [contactProduct, setContactProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);

  // Reporting State (Requirement 2)
  const [reportProduct, setReportProduct] = useState<Product | null>(null);
  const [reportCategory, setReportCategory] = useState<ReportCategory | "">("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportReporterContact, setReportReporterContact] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Marketplace Rules State (Requirement 3)
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [rulesError, setRulesError] = useState("");

  // Contact Form State
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [orderQty, setOrderQty] = useState("1");
  const [buyerMessage, setBuyerMessage] = useState("");

  // Sell Form State (includes availability status)
  const [newProduct, setNewProduct] = useState<Partial<Product>>(EMPTY_PRODUCT);
  const openCreate = () => {
    if (mutationPending.current) return;
    setEditingProduct(null); setPhoto(null); setNewProduct({ ...EMPTY_PRODUCT });
    setAgreeRules(false); setRulesError(''); setSellSuccess(false); setIsSellModalOpen(true);
  };
  const openEdit = (product: Product) => {
    if (product.ownerId !== ownerId || mutationPending.current) return;
    setEditingProduct(product); setPhoto(null); setNewProduct({ ...product });
    setAgreeRules(true); setRulesError(''); setSellSuccess(false); setIsSellModalOpen(true);
  };
  useEffect(() => {
    if (!photo) return;
    const preview = URL.createObjectURL(photo);
    setNewProduct(previous => ({ ...previous, image: preview }));
    return () => URL.revokeObjectURL(preview);
  }, [photo]);

  // Update URL params
  useEffect(() => {
    if (searchParams.get("action") === "sell") {
      setIsSellModalOpen(true);
    }
  }, [searchParams]);

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem("kaani_market_favs", JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenReport = (product: Product) => {
    setReportProduct(product);
    setReportCategory("");
    setReportDescription("");
    setReportReporterContact("");
    setReportError(null);
    setReportSuccess(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportProduct || !reportCategory) {
      setReportError("Please select a complaint category.");
      return;
    }

    setIsSubmittingReport(true);
    setReportError(null);

    let currentUser: { id?: string; name?: string; email?: string } | null = null;
    try {
      const stored = localStorage.getItem("user");
      if (stored) currentUser = JSON.parse(stored);
    } catch { currentUser = null; }

    const res = await submitMarketReport({
      productId: reportProduct.id,
      productName: reportProduct.name,
      sellerName: reportProduct.seller,
      category: reportCategory as ReportCategory,
      description: reportDescription,
      reporterName: currentUser?.name || "Community Member",
      reporterContact: reportReporterContact || currentUser?.email || "",
      reporterUserId: currentUser?.id,
    });

    setIsSubmittingReport(false);

    if (res.success) {
      setReportSuccess(true);

      setTimeout(() => {
        setReportSuccess(false);
        setReportProduct(null);
        setReportCategory("");
        setReportDescription("");
      }, 2500);
    } else {
      setReportError(res.message || "Failed to submit report. Please try again.");
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (myProducts && prod.ownerId !== ownerId) return false;
      // Hide listings removed/hidden by admin
      if (prod.is_hidden) {
        return false;
      }
      // Category match
      if (activeCategory !== "All Products" && prod.category !== activeCategory) {
        return false;
      }
      // Location match
      if (selectedLocation !== "All Locations" && prod.location !== selectedLocation) {
        return false;
      }
      // Product Type match
      if (selectedType !== "All" && prod.type !== selectedType) {
        return false;
      }
      // Price match
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min) && prod.price < min) return false;
      if (!isNaN(max) && prod.price > max) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${prod.name} ${tx(prod.name)}`.toLowerCase().includes(q);
        const matchesSeller = prod.seller.toLowerCase().includes(q);
        const matchesLocation = prod.location.toLowerCase().includes(q);
        const matchesDesc = `${prod.description} ${tx(prod.description)}`.toLowerCase().includes(q);
        if (!matchesName && !matchesSeller && !matchesLocation && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [products, myProducts, ownerId, activeCategory, selectedLocation, selectedType, minPrice, maxPrice, searchQuery, tx]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "newest") {
      // Keep natural order or initial
      return list;
    } else if (sortBy === "price-low") {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      return list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "stock") {
      return list.sort((a, b) => b.availableStock - a.availableStock);
    } else if (sortBy === "name") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredProducts, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (category === "All Products") next.delete("cat");
      else next.set("cat", category);
      return next;
    });
  };

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveCategory("All Products");
    setSelectedLocation("All Locations");
    setSelectedType("All");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { validatePhoto(file); setPhoto(file); setRulesError(''); }
    catch (error) { setRulesError(error instanceof Error ? error.message : 'Invalid photo.'); e.target.value = ''; }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !contactProduct) return;

    // Record idempotent market transaction with 5% platform commission
    const totalAmount = (contactProduct.price || 0) * (Math.max(1, parseInt(orderQty) || 1));
    recordMarketTransaction({
      productId: contactProduct.id,
      productName: contactProduct.name,
      sellerName: contactProduct.seller,
      buyerName: buyerName.trim(),
      price: totalAmount,
      idempotencyKey: `inquiry-${contactProduct.id}-${buyerPhone.trim()}-${orderQty}-${buyerMessage.trim()}`,
    });

    const phone = contactProduct.sellerPhone.replace(/[^+\d]/g, "");
    const message = `${buyerName.trim()} (${buyerPhone.trim()}): ${contactProduct.name}, ${orderQty} ${contactProduct.unit}. ${buyerMessage.trim()}`;
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
    setContactSuccess(true);

  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (mutationPending.current) return;
    if (!agreeRules) { setRulesError('Please read and agree to the Kaani Web Marketplace Rules before publishing your listing.'); return; }
    mutationPending.current = true; setSaving(true); setRulesError('');
    try {
      const result = await saveProduct(newProduct, photo, editingProduct || undefined);
      setProducts(previous => [result.product, ...previous.filter(product => product.id !== result.product.id)]);
      setDetailProduct(previous => previous?.id === result.product.id ? result.product : previous);
      setContactProduct(previous => previous?.id === result.product.id ? result.product : previous);
      setSellSuccess(true); setPhoto(null); setCurrentPage(1);
      toast({ title: 'Product saved', description: result.warning || 'Your product is now saved in the marketplace database.' });
      void reloadProducts();
    } catch (error) { setRulesError(error instanceof Error ? error.message : 'Product could not be saved.'); }
    finally { mutationPending.current = false; setSaving(false); }
  };
  const handleDelete = async () => {
    if (!deleteTarget || mutationPending.current) return;
    mutationPending.current = true; setSaving(true);
    try {
      const result = await deleteProduct(deleteTarget);
      setProducts(previous => previous.filter(product => product.id !== deleteTarget.id));
      setDetailProduct(previous => previous?.id === deleteTarget.id ? null : previous);
      setContactProduct(previous => previous?.id === deleteTarget.id ? null : previous);
      setCurrentPage(1); setDeleteTarget(null);
      toast({ title: 'Product deleted', description: result.warning });
      void reloadProducts();
    } catch (error) { toast({ title: 'Delete failed', description: error instanceof Error ? error.message : 'Product could not be deleted.', variant: 'destructive' }); }
    finally { mutationPending.current = false; setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      <Header />

      {/* Main Hero Banner Matching Reference Image */}
      <section className="relative overflow-hidden bg-emerald-950 text-white min-h-[260px] md:min-h-[300px] lg:min-h-[320px] flex items-center">
        {/* Scenic Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{ backgroundImage: `url(${heroBannerImg})` }}
          role="img"
          aria-label={tx("Philippine farmer and coastal fishery view")}
        />

        {/* Gradient Overlay for crystal clear typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/75 to-transparent sm:via-emerald-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-black/20" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/90 text-white shadow-sm ring-1 ring-white/30">
                  <Sprout className="h-5 w-5 text-emerald-100" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading text-white">
                  {tx(t("market.title", "Kaani Market"))}
                </h1>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                {tx(t("market.heroHeadline", "Fresh from our farms and waters."))}
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
                {tx(t("market.heroSub", "Discover local agricultural and fisheries products from farmers and fisherfolk. Supporting local livelihoods and sustainable food security."))}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={openCreate}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-4 py-2 text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  {tx(t("market.listHarvest", "List Your Harvest"))}
                </Button>
                <a
                  href="#featured-products"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs border border-white/20 transition-all"
                >
                  {tx(t("market.browseCatalog", "Browse Catalog"))}{tx(" ↓")}</a>
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 backdrop-blur-xs border border-emerald-700/60 transition-all"
                >
                  <FileText className="h-4 w-4 text-emerald-300" />
                  <span>{tx("Marketplace Rules")}</span>
                </button>
              </div>
            </div>

            {/* Right Side Script Accent */}
            <div className="hidden md:flex flex-col items-end justify-center pr-4">
              <div className="rotate-[-2deg] text-right">
                <span className="font-script text-3xl lg:text-4xl xl:text-5xl text-emerald-100 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-tight block">{tx("Support Local")}</span>
                <span className="font-script text-3xl lg:text-4xl xl:text-5xl text-emerald-200 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-tight block">{tx("Farmers and Fisherfolk")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Marketplace Area */}
      <main id="featured-products" className="container mx-auto px-4 lg:px-8 py-8 md:py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR FILTERS (3 cols on desktop) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Categories Card */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-emerald-100/80">
                <LayoutGrid className="h-5 w-5 text-emerald-700" />
                <h3 className="font-extrabold text-base font-heading text-slate-800">{tx("Categories")}</h3>
              </div>

              <div className="space-y-1.5">
                {MARKET_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  const Icon = categoryIcons[cat] || Sprout;
                  const count = cat === "All Products" 
                    ? products.length 
                    : products.filter(p => p.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-[#0d533a] text-white shadow-xs font-bold"
                          : "text-slate-700 hover:text-emerald-900 hover:bg-emerald-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-200" : "text-emerald-700"}`} />
                        <span className="truncate">{tx(cat)}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-emerald-900/50 text-emerald-100" : "bg-slate-100 text-slate-500"
                        }`}>
                          {tx(count)}
                        </span>
                        <ChevronRight className={`h-4 w-4 ${isActive ? "text-emerald-200" : "text-slate-400"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Filter Card */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm font-heading">
                <MapPin className="h-4.5 w-4.5 text-emerald-700" />
                <span>{tx("Location")}</span>
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#f8faf9] border border-emerald-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              >
                {Array.from(new Set([...MARKET_LOCATIONS, ...products.map(product => product.location)])).map((loc) => (
                  <option key={loc} value={loc}>
                    {tx(loc)}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter Card */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm font-heading">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">{tx("₱ ")}</span>
                <span>{tx("Price Range")}</span>
              </div>

              <form onSubmit={handleApplyPriceFilter} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="market-field-1" className="text-[11px] font-semibold text-slate-500 block mb-1">{tx("Min (₱)")}</label>
                    <input id="market-field-1"
                      type="number"
                      placeholder={tx("0")}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-[#f8faf9] border border-emerald-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="market-field-2" className="text-[11px] font-semibold text-slate-500 block mb-1">{tx("Max (₱)")}</label>
                    <input id="market-field-2"
                      type="number"
                      placeholder={tx("1000")}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-[#f8faf9] border border-emerald-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#0d533a] hover:bg-[#093c2a] text-white font-bold rounded-xl py-2 text-xs shadow-xs"
                  >{tx("Apply Filters")}</Button>
                  {(minPrice || maxPrice || activeCategory !== "All Products" || selectedLocation !== "All Locations" || searchQuery) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="px-2.5 rounded-xl border-emerald-200 text-slate-600 text-xs hover:bg-rose-50 hover:text-rose-600"
                      title={tx("Reset all filters")}
                    >{tx("Reset")}</Button>
                  )}
                </div>
              </form>
            </div>

            {/* Marketplace Guidelines & Community Trust */}
            <div className="rounded-2xl p-4 bg-emerald-50/80 border border-emerald-200/90 text-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>{tx("Marketplace Rules")}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {tx("All listings adhere to the Kaani Web Marketplace Rules for accurate listings, respectful trade, and verified local producers.")}
              </p>
              <div className="pt-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{tx("View Marketplace Rules")}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA (9 cols on desktop) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Top Search Bar */}
            <div className="bg-white rounded-2xl p-2.5 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-700" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={tx("Search for products (e.g. tilapia, tomatoes, rice...)")}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8faf9] border border-emerald-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => setCurrentPage(1)}
                  className="bg-[#0d533a] hover:bg-[#093c2a] text-white font-bold rounded-xl px-6 py-2.5 text-sm shrink-0 shadow-xs"
                >{tx("Search")}</Button>
              </div>
            </div>

            {/* Horizontal Category Quick Pills */}
            <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
              <div className="flex items-center gap-2 min-w-max">
                {MARKET_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  const Icon = categoryIcons[cat] || Sprout;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${
                        isActive
                          ? "bg-[#0d533a] text-white font-bold shadow-xs scale-102"
                          : "bg-white text-slate-700 border border-emerald-100/90 hover:bg-emerald-50 hover:text-emerald-900"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-200" : "text-emerald-700"}`} />
                      <span>{tx(cat)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Header: Featured Products & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-emerald-100/80 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">{tx("Featured Products")}</h2>
                <div className="flex flex-wrap gap-2">{ownerId && <Button variant={myProducts ? 'default' : 'outline'} onClick={() => { setMyProducts(value => !value); setCurrentPage(1); }}>{tx(myProducts ? 'Show All Products' : 'My Products')}</Button>}<Button variant="outline" onClick={() => void reloadProducts()}>{tx('Refresh Products')}</Button></div>
                <p className="text-xs text-slate-500 font-medium">{tx("Showing ")}{tx(sortedProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0)}{tx(" - ")}{tx(Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length))}{tx(" of ")}{tx(sortedProducts.length)}{tx(" local items")}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sector filter */}
                <div className="flex items-center bg-white border border-emerald-100 rounded-xl p-1 text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => { setSelectedType("All"); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${selectedType === "All" ? "bg-emerald-800 text-white" : "hover:text-emerald-800"}`}
                  >{tx("All")}</button>
                  <button
                    onClick={() => { setSelectedType("Farm Product"); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${selectedType === "Farm Product" ? "bg-emerald-800 text-white" : "hover:text-emerald-800"}`}
                  >{tx("Farms")}</button>
                  <button
                    onClick={() => { setSelectedType("Fishery Product"); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${selectedType === "Fishery Product" ? "bg-emerald-800 text-white" : "hover:text-emerald-800"}`}
                  >{tx("Fisheries")}</button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <span className="hidden sm:inline">{tx("Sort by:")}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-emerald-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="newest">{tx("Newest First")}</option>
                    <option value="price-low">{tx("Price: Low to High")}</option>
                    <option value="price-high">{tx("Price: High to Low")}</option>
                    <option value="stock">{tx("Highest Stock")}</option>
                    <option value="name">{tx("Product Name (A-Z)")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PRODUCT GRID (4 columns on lg/xl desktop) */}
            {!catalogLoading && !catalogError && paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-emerald-100 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{tx("No products found")}</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">{tx("We couldn't find any products matching your current filters. Try selecting a different category or clearing your search.")}</p>
                <Button
                  onClick={handleResetFilters}
                  className="bg-[#0d533a] hover:bg-[#093c2a] text-white font-bold rounded-xl px-5"
                >{tx("Clear All Filters")}</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginatedProducts.map((prod) => {
                  const isFav = favorites.includes(prod.id);
                  const isFarm = prod.type === "Farm Product";
                  const isFishery = prod.type === "Fishery Product";
                  const status = getProductEffectiveStatus(prod);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => setDetailProduct(prod)}
                      className="group bg-white rounded-2xl border border-emerald-100/90 overflow-hidden shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-6px_rgba(13,83,58,0.12)] hover:border-emerald-300 transition-all duration-300 flex flex-col cursor-pointer"
                    >
                      {/* Product Image & Badges */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-emerald-50/50">
                        <img
                          src={prodImg(prod.image)}
                          alt={tx(prod.name)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null; // prevent infinite loop
                            img.src = `${import.meta.env.BASE_URL}assets/images/market/vegetables-bundle.jpg`;
                          }}
                        />

                        {/* Verified Direct Trade Badge */}
                        <div className="absolute bottom-2 right-2 bg-emerald-950/75 backdrop-blur-xs text-emerald-200 text-[9px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          <span>{tx("Illustrative 95% Seller Share")}</span>
                        </div>

                        {/* Top-Left Category Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide shadow-xs ${
                              isFarm
                                ? "bg-emerald-700 text-white"
                                : isFishery
                                ? "bg-sky-600 text-white"
                                : "bg-teal-700 text-white"
                            }`}
                          >
                            {tx(prod.type)}
                          </span>
                        </div>

                        {/* Top-Right Favorite & Report Action Buttons */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReport(prod);
                            }}
                            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-xs transition-all active:scale-90"
                            title={tx("Report this listing")}
                            aria-label={tx("Report listing")}
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(prod.id, e)}
                            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 flex items-center justify-center shadow-xs transition-all active:scale-90"
                            title={tx(isFav ? "Remove from favorites" : "Save to favorites")}
                            aria-label={tx(isFav ? "Remove from favorites" : "Save to favorites")}
                            aria-pressed={isFav}
                          >
                            <Heart
                              className={`h-4 w-4 transition-colors ${
                                isFav ? "fill-rose-500 text-rose-500" : "text-slate-500"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          {/* Availability Status Label (Available, Out of Stock, Unavailable) */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            {status === "Available" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>{tx("Available")}</span>
                              </span>
                            ) : status === "Out of Stock" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                                <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
                                <span>{tx("Out of Stock")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                                <Ban className="h-3 w-3 text-rose-600 shrink-0" />
                                <span>{tx("Unavailable")}</span>
                              </span>
                            )}

                            {prod.harvestDate && (
                              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                                {tx(prod.harvestDate)}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                            <button type="button" className="text-left" onClick={(event) => { event.stopPropagation(); setDetailProduct(prod); }}>{tx(prod.name)}</button>
                          </h3>

                          {/* Producer & Location Meta */}
                          <div className="space-y-1 mt-1.5 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="font-medium text-slate-700 truncate">{prod.seller}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 truncate">
                              <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{tx(prod.location)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-2.5">
                          {/* Price & Available Stock */}
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-emerald-800">{tx("₱ ")}{tx(prod.price.toFixed(2))}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">{tx(" / ")}{tx(prod.unit)}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">{tx("Available: ")}{tx(prod.availableStock)} {tx(prod.stockUnit)}
                            </span>
                          </div>

                          {prod.ownerId === ownerId && <div className="flex gap-2" onClick={event => event.stopPropagation()}>
                            <Button variant="outline" className="flex-1" onClick={() => openEdit(prod)}>{tx('Edit Product / Restock')}</Button>
                            <Button variant="destructive" onClick={() => setDeleteTarget(prod)}>{tx('Delete')}</Button>
                          </div>}
                          {/* Contact Seller or Status Button */}
                          {status === "Available" ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setContactProduct(prod);
                              }}
                              className="w-full bg-[#0d533a] hover:bg-[#093c2a] text-white font-bold rounded-xl py-2 text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              {tx(t("market.contactSeller", "Contact Seller"))}
                            </Button>
                          ) : (
                            <Button
                              disabled
                              className="w-full bg-slate-100 text-slate-400 border border-slate-200 font-semibold rounded-xl py-2 text-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                            >
                              {status === "Out of Stock" ? (
                                <>
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                  <span>{tx("Out of Stock")}</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="h-3.5 w-3.5 text-rose-500" />
                                  <span>{tx("Unavailable")}</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {catalogLoading && <p role="status">{tx('Loading products…')}</p>}
            {catalogError && <p role="alert" className="text-red-700 p-3">{tx(catalogError)}</p>}
            {/* Pagination Matching Reference Layout */}
            {totalPages > 1 && (
              <div className="pt-6 pb-2 flex items-center justify-center gap-1.5 text-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-emerald-100 text-slate-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs"
                >{tx("← Previous")}</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-[#0d533a] text-white shadow-xs"
                        : "text-slate-700 hover:bg-emerald-50"
                    }`}
                  >
                    {tx(page)}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-emerald-100 text-slate-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs"
                >{tx("Next →")}</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CONTACT SELLER MODAL */}
      <Dialog open={!!contactProduct} onOpenChange={(open) => !open && setContactProduct(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border border-emerald-100 shadow-2xl">
          {contactProduct && (
            <div>
              <DialogHeader className="pb-3 border-b border-emerald-100 text-left">
                <DialogTitle className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-emerald-700" />{tx("Contact Local Producer")}</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">{tx("Direct connection with the farmer or fisherfolk. No middleman markups.")}</DialogDescription>
              </DialogHeader>

              {contactSuccess ? (
                <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{tx("SMS Draft Ready")}</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {tx("Review and send your message in your messaging app. No payment or reservation has been made.")}</p>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {/* Item Summary Card */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <img
                      src={prodImg(contactProduct.image)}
                      alt={tx(contactProduct.name)}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{tx(contactProduct.name)}</p>
                      <p className="text-xs text-slate-600 truncate">{tx(contactProduct.location)}</p>
                      <p className="text-xs font-bold text-emerald-800">{tx("₱ ")}{tx(contactProduct.price.toFixed(2))}{tx(" / ")}{tx(contactProduct.unit)}
                      </p>
                    </div>
                  </div>

                  {/* Seller Direct Info */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-500 uppercase font-semibold">{tx("Producer")}</span>
                        <p className="text-sm font-bold text-slate-800">{contactProduct.seller}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" />{tx("Listed Producer")}</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <a
                        href={`tel:${contactProduct.sellerPhone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-2xs"
                      >
                        <Phone className="h-3.5 w-3.5" />{tx("Call (")}{contactProduct.sellerPhone}{tx(")")}</a>
                      <a
                        href={`sms:${contactProduct.sellerPhone}?body=Hello ${encodeURIComponent(contactProduct.seller)}, I saw your ${encodeURIComponent(contactProduct.name)} on Kaani Web.`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />{tx("Send SMS")}</a>
                    </div>
                  </div>

                  {/* Message inquiry form */}
                  <form onSubmit={handleContactSubmit} className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="market-field-3" className="text-xs font-bold text-slate-700 block mb-1">{tx("Your Name *")}</label>
                        <input id="market-field-3"
                          type="text"
                          required
                          placeholder={tx("Juan Dela Cruz")}
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label htmlFor="market-field-4" className="text-xs font-bold text-slate-700 block mb-1">{tx("Contact Number *")}</label>
                        <input id="market-field-4"
                          type="tel"
                          required
                          placeholder={tx("0917-000-0000")}
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="market-field-5" className="text-xs font-bold text-slate-700 block mb-1">{tx("Quantity Needed (")}{tx(contactProduct.stockUnit)}{tx(")")}</label>
                      <input id="market-field-5"
                        type="number"
                        min="1"
                        max={contactProduct.availableStock}
                        value={orderQty}
                        onChange={(e) => setOrderQty(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-emerald-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="market-field-6" className="text-xs font-bold text-slate-700 block mb-1">{tx("Message / Inquiries")}</label>
                      <textarea id="market-field-6"
                        rows={2}
                        placeholder={tx("Hi! Is this available for delivery or pickup in town?")}
                        value={buyerMessage}
                        onChange={(e) => setBuyerMessage(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    {/* Order & Commission Breakdown */}
                    {contactProduct && (() => {
                      const qty = Math.max(1, parseInt(orderQty) || 1);
                      const subtotal = (contactProduct.price || 0) * qty;
                      const comm = calculateCommission(subtotal);
                      return (
                        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-1.5">
                          <div className="flex justify-between items-center text-slate-700">
                            <span>{tx("Estimated Total (")}{tx(qty)} {tx(contactProduct.unit)}{tx("):")}</span>
                            <span className="font-bold text-slate-900">{tx(formatPeso(subtotal))}</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-800 text-[11px]">
                            <span>{tx("Illustrative platform fee (5%):")}</span>
                            <span className="font-semibold">{tx(formatPeso(comm.platformFee))}</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-950 font-bold pt-1 border-t border-emerald-200/60">
                            <span>{tx("Estimated seller share for ")}{contactProduct.seller}{tx(":")}</span>
                            <span className="text-emerald-900 font-extrabold">{tx(formatPeso(comm.sellerNet))}{tx(" (95%)")}</span>
                          </div>
                        </div>
                      );
                    })()}

                    <Button
                      type="submit"
                      className="w-full bg-[#0d533a] hover:bg-[#093c2a] text-white font-bold rounded-xl py-2.5 text-xs shadow-sm transition-all active:scale-98"
                    >{tx("Open SMS to Contact Seller")}</Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PRODUCT DETAILS MODAL */}
      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-white border border-emerald-100 shadow-2xl">
          {detailProduct && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={prodImg(detailProduct.image)}
                  alt={tx(detailProduct.name)}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-lg bg-emerald-800 text-white shadow-sm">
                  {tx(detailProduct.type)}
                </span>
                <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-lg bg-white/90 text-slate-800 shadow-sm backdrop-blur-xs">
                  {tx(detailProduct.category)}
                </span>
              </div>

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-slate-900">
                      {tx(detailProduct.name)}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                      {tx(detailProduct.location)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-800">{tx("₱ ")}{tx(detailProduct.price.toFixed(2))}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">{tx("per ")}{tx(detailProduct.unit)}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{tx("Availability Status:")}</span>
                    {(() => {
                      const st = getProductEffectiveStatus(detailProduct);
                      if (st === "Available") {
                        return (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            {tx("Available")}
                          </span>
                        );
                      }
                      if (st === "Out of Stock") {
                        return (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            {tx("Out of Stock")}
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                          <Ban className="h-3.5 w-3.5 text-rose-600" />
                          {tx("Unavailable")}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{tx("Available Quantity:")}</span>
                    <span className="font-bold text-slate-800">{tx(detailProduct.availableStock)} {tx(detailProduct.stockUnit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{tx("Harvest / Catch Info:")}</span>
                    <span className="font-bold text-slate-800">{tx(detailProduct.harvestDate || "Fresh Batch")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{tx("Registered Producer:")}</span>
                    <span className="font-bold text-emerald-900">{detailProduct.seller}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">{tx("Product Description")}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {tx(detailProduct.description)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-2 border-t border-slate-100">
                {getProductEffectiveStatus(detailProduct) === "Available" ? (
                  <Button
                    onClick={() => {
                      const prod = detailProduct;
                      setDetailProduct(null);
                      setContactProduct(prod);
                    }}
                    className="flex-1 bg-[#0d533a] hover:bg-[#093c2a] text-white font-bold rounded-xl py-2.5 text-sm shadow-xs flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />{tx("Contact ")}{detailProduct.seller}
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="flex-1 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl py-2.5 text-sm cursor-not-allowed opacity-80"
                  >
                    <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                    {tx(getProductEffectiveStatus(detailProduct) === "Out of Stock"
                      ? ("Out of Stock")
                      : ("Unavailable"))}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const prod = detailProduct;
                    setDetailProduct(null);
                    handleOpenReport(prod);
                  }}
                  className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  title={tx("Report this listing")}
                >
                  <Flag className="h-3.5 w-3.5 text-rose-600" />
                  <span>{tx("Report Listing")}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailProduct(null)}
                  className="rounded-xl border-slate-200 text-xs"
                >{tx("Close")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !saving) setDeleteTarget(null); }}>
        <DialogContent><DialogHeader><DialogTitle>{tx('Delete product?')}</DialogTitle><DialogDescription>{tx('This removes your listing from the marketplace.')} {deleteTarget?.name}</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" disabled={saving} onClick={() => setDeleteTarget(null)}>{tx('Cancel')}</Button><Button variant="destructive" disabled={saving} onClick={handleDelete}>{tx(saving ? 'Deleting…' : 'Delete')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {/* SELL PRODUCE MODAL (For farmers & fisherfolk) */}
      <Dialog open={isSellModalOpen} onOpenChange={(open) => { if (!mutationPending.current) setIsSellModalOpen(open); }}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-white border border-emerald-100 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-emerald-100 text-left">
            <DialogTitle className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-700" />
              {tx(editingProduct ? "Edit Product / Restock" : "Create Product Listing")}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {tx("Promote and sell your agriculture or fisheries products directly to buyers.")}
            </DialogDescription>
          </DialogHeader>

          {!ownerId ? <div className="py-6 space-y-3"><p>{tx('Sign in to manage your products.')}</p><Button asChild><Link to="/auth">{tx('Sign In')}</Link></Button></div> : sellSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">{tx("Product saved")}</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">{tx("Your product is now saved in the marketplace database.")}</p>
            </div>
          ) : (
            <form onSubmit={handleSellSubmit} className="space-y-3.5 pt-3"><fieldset disabled={saving} className="space-y-3.5">
              <div>
                <label htmlFor="market-field-7" className="text-xs font-bold text-slate-700 block mb-1">{tx("Product Name *")}</label>
                <input id="market-field-7"
                  type="text"
                  required
                  placeholder={tx("e.g. Fresh Red Tilapia, Native Tomatoes, Organic Saba...")}
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="market-field-8" className="text-xs font-bold text-slate-700 block mb-1">{tx("Category *")}</label>
                  <select id="market-field-8"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as typeof newProduct.category })}
                    className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  >
                    {MARKET_CATEGORIES.filter(c => c !== "All Products").map((c) => (
                      <option key={c} value={c}>{tx(c)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="market-field-9" className="text-xs font-bold text-slate-700 block mb-1">{tx("Product Type *")}</label>
                  <select id="market-field-9"
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as typeof newProduct.type })}
                    className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  >
                    <option value="Farm Product">{tx("Farm Product")}</option>
                    <option value="Fishery Product">{tx("Fishery Product")}</option>
                    <option value="Processed Product">{tx("Processed Product")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label htmlFor="market-field-10" className="text-xs font-bold text-slate-700 block mb-1">{tx("Price (₱) *")}</label>
                  <input id="market-field-10"
                    type="number"
                    step="0.01"
                    min="0.01" max="1000000000"
                    required
                    placeholder={tx("50")}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    className="w-full text-xs p-2 rounded-xl border border-emerald-200 bg-[#f8faf9]"
                  />
                </div>
                <div>
                  <label htmlFor="market-field-11" className="text-xs font-bold text-slate-700 block mb-1">{tx("Unit")}</label>
                  <select id="market-field-11"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-emerald-200 bg-[#f8faf9]"
                  >
                    <option value="kg">{tx("kg")}</option>
                    <option value="pack">{tx("pack")}</option>
                    <option value="sack">{tx("sack")}</option>
                    <option value="bottle">{tx("bottle")}</option>
                    <option value="piece">{tx("piece")}</option>
                    <option value="tali">{tx("tali / bundle")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="market-field-12" className="text-xs font-bold text-slate-700 block mb-1">{tx("Stock")}</label>
                  <input id="market-field-12"
                    min="0" max="1000000000" step="0.001"
                    type="number"
                    required
                    placeholder={tx("50")}
                    value={newProduct.availableStock}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setNewProduct((prev) => ({
                        ...prev,
                        availableStock: qty,
                        status: qty <= 0 ? "Out of Stock" : (prev.status === "Out of Stock" ? "Available" : prev.status)
                      }));
                    }}
                    className="w-full text-xs p-2 rounded-xl border border-emerald-200 bg-[#f8faf9]"
                  />
                </div>
                <div>
                  <label htmlFor="market-field-13" className="text-xs font-bold text-slate-700 block mb-1">{tx("Status *")}</label>
                  <select id="market-field-13"
                    value={newProduct.status || "Available"}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as ProductStatus })}
                    className="w-full text-xs p-2 rounded-xl border border-emerald-200 bg-[#f8faf9] font-medium"
                  >
                    <option value="Available">{tx("Available")}</option>
                    <option value="Out of Stock">{tx("Out of Stock")}</option>
                    <option value="Unavailable">{tx("Unavailable")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="market-field-14" className="text-xs font-bold text-slate-700 block mb-1">{tx("Your Full Name *")}</label>
                  <input id="market-field-14"
                    type="text"
                    required
                    placeholder={tx("Mang Juan")}
                    value={newProduct.seller}
                    onChange={(e) => setNewProduct({ ...newProduct, seller: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9]"
                  />
                </div>
                <div>
                  <label htmlFor="market-field-15" className="text-xs font-bold text-slate-700 block mb-1">{tx("Contact Phone *")}</label>
                  <input id="market-field-15"
                    type="tel"
                    required
                    placeholder={tx("+63 917 000 0000")}
                    value={newProduct.sellerPhone}
                    onChange={(e) => setNewProduct({ ...newProduct, sellerPhone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="market-field-16" className="text-xs font-bold text-slate-700 block mb-1">{tx("Location *")}</label>
                <input id="market-field-16" required maxLength={200} value={newProduct.location} onChange={event => setNewProduct({ ...newProduct, location: event.target.value })} className="w-full text-xs p-2.5 rounded-xl border border-emerald-200 bg-[#f8faf9]" />
              </div>

              <div><label htmlFor="product-description" className="text-xs font-bold block mb-1">{tx('Product Description')}</label><textarea id="product-description" maxLength={3000} value={newProduct.description} onChange={event => setNewProduct({ ...newProduct, description: event.target.value })} className="w-full rounded-xl border border-emerald-200 p-2" /></div>
              {/* Produce Photo Upload & Selection */}
              <div>
                <label htmlFor="product-photo" className="text-xs font-bold text-slate-700 block mb-1">{tx("Product Photo *")}</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-emerald-200 bg-slate-100 shrink-0">
                    <img 
                      src={newProduct.image || `${import.meta.env.BASE_URL}assets/images/market/vegetables-bundle.jpg`} 
                      alt={tx("Product preview")} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null; // prevent infinite loop
                        img.src = `${import.meta.env.BASE_URL}assets/images/market/vegetables-bundle.jpg`;
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 cursor-pointer transition-colors">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>{tx("Upload Photo")}</span>
                      <input 
                        id="product-photo" type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-slate-500">{tx("Choose a JPG, PNG, or WebP photo up to 5 MB.")}</p>
                  </div>
                </div>

              </div>

              {/* 5% Market Commission Live Calculator Preview */}
              {(() => {
                const priceVal = Number(newProduct.price) || 0;
                const comm = calculateCommission(priceVal);
                return (
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-emerald-700" />{tx("Illustrative Community Trade Model")}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{tx("95% Seller Direct")}</span>
                    </div>

                    <div className="space-y-1 text-slate-600 text-[11px] pt-1 border-t border-emerald-200/50">
                      <div className="flex justify-between">
                        <span>{tx("Listing Price (Buyer pays):")}</span>
                        <span className="font-semibold text-slate-800">{tx(formatPeso(comm.grossPrice))}</span>
                      </div>
                      <div className="flex justify-between text-emerald-800">
                        <span>{tx("Illustrative platform fee (5%):")}</span>
                        <span className="font-semibold">{tx(" - ")}{tx(formatPeso(comm.platformFee))}</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-emerald-200/70 flex justify-between items-center text-slate-900 font-bold">
                      <span className="text-emerald-950">{tx("Your Direct Net Take-Home (95%):")}</span>
                      <span className="text-sm font-extrabold text-emerald-900 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {tx(formatPeso(comm.sellerNet))}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic leading-snug">{tx("Estimates only. This website does not collect payments or deduct fees. Arrange terms directly with the seller.")}</p>
                  </div>
                );
              })()}

              {/* Kaani Web Marketplace Rules Agreement Checkbox */}
              <div className="pt-2 border-t border-emerald-100 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeRules}
                    onChange={(e) => {
                      setAgreeRules(e.target.checked);
                      if (e.target.checked) setRulesError("");
                    }}
                    className="mt-0.5 h-4 w-4 rounded text-emerald-700 border-emerald-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    {tx("By submitting a product listing, you confirm that you have read and agree to follow the ")}
                    <button
                      type="button"
                      onClick={() => setIsRulesModalOpen(true)}
                      className="text-emerald-700 font-bold underline hover:text-emerald-900 inline"
                    >
                      {tx("Kaani Web Marketplace Rules")}
                    </button>{tx(". *")}</span>
                </label>
                {rulesError && (
                  <div role="alert" className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{tx(rulesError)}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0d533a] hover:bg-[#093c2a] text-white font-bold rounded-xl py-2.5 text-xs shadow-md transition-all active:scale-98"
              >
                {tx(saving ? "Saving…" : editingProduct ? "Save Changes" : "Publish Product")}
              </Button>
            </fieldset></form>
          )}
        </DialogContent>
      </Dialog>

      {/* REPORT & COMPLAINT MODAL (Requirement 2) */}
      <Dialog open={!!reportProduct} onOpenChange={(open) => !open && setReportProduct(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border border-rose-100 shadow-2xl">
          {reportProduct && (
            <div>
              <DialogHeader className="pb-3 border-b border-rose-100 text-left">
                <DialogTitle className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Flag className="h-5 w-5 text-rose-600" />
                  {tx("Report Listing or Concern")}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {tx("Help keep Kaani Market trustworthy for farmers, fisherfolk, and community buyers.")}
                </DialogDescription>
              </DialogHeader>

              {reportSuccess ? (
                <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {tx(t("market.reportSuccess", "Report Submitted Successfully"))}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {tx(t(
                      "market.reportSuccessDesc",
                      "Thank you for helping keep Kaani Market safe. Our administrators will review this listing."
                    ))}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-3.5 pt-3">
                  {/* Reported Item Preview */}
                  <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-3">
                    <img
                      src={reportProduct.image}
                      alt={tx(reportProduct.name)}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 truncate">{tx(reportProduct.name)}</p>
                      <p className="text-[11px] text-slate-500 truncate">{tx("Seller: ")}{reportProduct.seller}</p>
                      <p className="text-[11px] font-semibold text-emerald-800">{tx("₱ ")}{tx(reportProduct.price.toFixed(2))}{tx(" / ")}{tx(reportProduct.unit)}</p>
                    </div>
                  </div>

                  {/* Complaint Category Select (Required) */}
                  <div>
                    <label htmlFor="market-field-17" className="text-xs font-bold text-slate-700 block mb-1">
                      {tx("Complaint Category *")}
                    </label>
                    <select id="market-field-17"
                      required
                      value={reportCategory}
                      onChange={(e) => {
                        setReportCategory(e.target.value as ReportCategory);
                        setReportError(null);
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    >
                      <option value="">{tx("-- Select a Reason --")}</option>
                      {REPORT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {tx(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Optional Description */}
                  <div>
                    <label htmlFor="market-field-18" className="text-xs font-bold text-slate-700 block mb-1">
                      {tx("Additional Details (Optional)")}
                    </label>
                    <textarea id="market-field-18"
                      rows={3}
                      placeholder={
                        tx("Describe the inaccuracy, misleading pricing, or suspicious behavior...")
                      }
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Optional Reporter Contact */}
                  <div>
                    <label htmlFor="market-field-19" className="text-xs font-bold text-slate-700 block mb-1">
                      {tx("Your Contact / Email (Optional for updates)")}
                    </label>
                    <input id="market-field-19"
                      type="text"
                      placeholder={tx("e.g. 0917-xxx-xxxx or email@example.com")}
                      value={reportReporterContact}
                      onChange={(e) => setReportReporterContact(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-[#f8faf9] focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {tx("Your private contact information is never shown publicly.")}
                    </p>
                  </div>

                  {reportError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{tx(reportError)}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="submit"
                      disabled={isSubmittingReport || !reportCategory}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl py-2 text-xs shadow-xs"
                    >
                      {tx(isSubmittingReport
                        ? ("Submitting...")
                        : ("Submit Report"))}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReportProduct(null)}
                      className="rounded-xl border-slate-200 text-xs"
                    >
                      {tx("Cancel")}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MARKETPLACE RULES MODAL (Requirement 3) */}
      <Dialog open={isRulesModalOpen} onOpenChange={setIsRulesModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-6 bg-white border border-emerald-100 shadow-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-emerald-100 text-left">
            <DialogTitle className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              {tx("Kaani Web Marketplace Rules")}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {tx("Standards and community guidelines for transparent, honest, and sustainable trading.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3 text-xs leading-relaxed text-slate-700">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("1")}</span>
                  {tx("1. Accurate Listings")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("Sellers must provide truthful and accurate product names, descriptions, prices, quantities, and availability information.")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("2")}</span>
                  {tx("2. Appropriate Products")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("All product listings must comply with applicable laws and Kaani Web marketplace policies.")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("3")}</span>
                  {tx("3. Seller Responsibility")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("Sellers are responsible for the accuracy of their listings and for communicating clearly with potential buyers.")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("4")}</span>
                  {tx("4. Respectful Transactions")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("Buyers and sellers must communicate honestly, respectfully, and professionally throughout their transactions.")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("5")}</span>
                  {tx("5. Listing Review")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("Kaani Web administrators may review, reject, hide, or remove product listings that violate marketplace rules or applicable policies.")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("6")}</span>
                  {tx("6. Seller Privacy")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("Only seller information intended for public display should appear in the marketplace. Sellers should not submit unnecessary personal or sensitive information.")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("7")}</span>
                  {tx("7. Product Availability")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("Sellers must keep product availability information updated. Products that are sold out or temporarily unavailable should be marked accordingly.")}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs">{tx("8")}</span>
                  {tx("8. Reporting Violations")}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tx("Users may report listings or marketplace activities they believe violate these rules. Reports should be submitted honestly and used for legitimate concerns.")}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-900 text-white space-y-1">
              <h5 className="font-bold text-xs text-emerald-200 uppercase tracking-wider">
                {tx("Agreement to the Rules")}
              </h5>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {tx("By submitting a product listing, you confirm that you have read and agree to follow the Kaani Web Marketplace Rules.")}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-emerald-100">
            <Button
              onClick={() => setIsRulesModalOpen(false)}
              className="bg-[#0d533a] hover:bg-[#093c2a] text-white rounded-xl text-xs font-bold"
            >
              {tx("Understood")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COLLAPSIBLE MARKETPLACE RULES SECTION (Requirement 3) */}
      <section className="container mx-auto px-4 lg:px-8 pb-12">
        <div className="bg-white rounded-3xl border border-emerald-100/90 p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            onClick={() => setIsRulesExpanded(!isRulesExpanded)}
            className="w-full flex items-center justify-between text-left group focus:outline-none"
            aria-expanded={isRulesExpanded}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {tx("Kaani Web Marketplace Rules")}
                </h3>
                <p className="text-xs text-slate-500">
                  {tx("Click to expand or collapse the 8 core policies ensuring transparent and respectful trade.")}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl border border-emerald-100 text-emerald-800 group-hover:bg-emerald-50 transition-colors">
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${
                  isRulesExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {isRulesExpanded && (
            <div className="pt-6 mt-6 border-t border-emerald-100 space-y-4 animate-in fade-in duration-200">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    num: 1,
                    title: "1. Accurate Listings",
                    desc: "Sellers must provide truthful and accurate product names, descriptions, prices, quantities, and availability information.",
                  },
                  {
                    num: 2,
                    title: "2. Appropriate Products",
                    desc: "All product listings must comply with applicable laws and Kaani Web marketplace policies.",
                  },
                  {
                    num: 3,
                    title: "3. Seller Responsibility",
                    desc: "Sellers are responsible for the accuracy of their listings and for communicating clearly with potential buyers.",
                  },
                  {
                    num: 4,
                    title: "4. Respectful Transactions",
                    desc: "Buyers and sellers must communicate honestly, respectfully, and professionally throughout their transactions.",
                  },
                  {
                    num: 5,
                    title: "5. Listing Review",
                    desc: "Kaani Web administrators may review, reject, hide, or remove product listings that violate marketplace rules or applicable policies.",
                  },
                  {
                    num: 6,
                    title: "6. Seller Privacy",
                    desc: "Only seller information intended for public display should appear in the marketplace. Sellers should not submit unnecessary personal or sensitive information.",
                  },
                  {
                    num: 7,
                    title: "7. Product Availability",
                    desc: "Sellers must keep product availability information updated. Products that are sold out or temporarily unavailable should be marked accordingly.",
                  },
                  {
                    num: 8,
                    title: "8. Reporting Violations",
                    desc: "Users may report listings or marketplace activities they believe violate these rules. Reports should be submitted honestly and used for legitimate concerns.",
                  },
                ].map((r) => (
                  <div
                    key={r.num}
                    className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                          {tx(r.num)}
                        </span>
                        <span>{tx(r.title)}</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{tx(r.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-emerald-200 uppercase tracking-wider">
                    {tx("Agreement to the Rules")}
                  </h5>
                  <p className="text-xs text-emerald-100/90 leading-snug">
                    {tx("By submitting a product listing, you confirm that you have read and agree to follow the Kaani Web Marketplace Rules.")}
                  </p>
                </div>
                <Button
                  onClick={openCreate}
                  className="bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-xl px-4 py-2 shrink-0 shadow-xs"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  {tx("List Your Harvest")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Market;
