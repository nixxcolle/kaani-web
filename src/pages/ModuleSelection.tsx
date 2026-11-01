import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useText } from "@/lib/translate";
import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Sprout, 
  Fish, 
  Scale, 
  Cpu, 
  BookOpen, 
  Clock, 
  X, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  FileText,
  ExternalLink,
  Languages
} from "@/components/icons";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { fetchLearningModules } from "@/lib/modules";
import { LearningModule } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/LanguageSelector";

const ModuleSelection = () => {
  const tx = useText();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setSelectedCategory(categoryParam && modules.some(module => module.category === categoryParam) ? categoryParam : "All");
  }, [searchParams, modules]);

  useEffect(() => {
    const refresh = () => setReload(value => value + 1);
    window.addEventListener('auth-change', refresh);
    return () => window.removeEventListener('auth-change', refresh);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setModules([]);
    setLoading(true);
    setFetchError(false);
    fetchLearningModules().then(data => {
      if (!cancelled) setModules(data);
    }).catch(() => {
      if (!cancelled) setFetchError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [reload]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(modules.map(m => m.category).filter((category): category is NonNullable<LearningModule['category']> => Boolean(category))));
    return ["All", ...cats];
  }, [modules]);

  const filteredModules = useMemo(() => {
    let result = modules;

    if (selectedCategory !== "All") {
      result = result.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(m =>
        `${m.title} ${m.description} ${m.category} ${tx(m.title)} ${tx(m.description)} ${tx(m.category)}`.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, selectedCategory, modules, tx]);

  const handleOpenModule = (mod: LearningModule) => {
    setActiveModule(mod);
  };

  const handleOpenModuleGuide = (mod: LearningModule) => {
    // Database uploads may not exist among the bundled local assets.
    if (mod.file_data) {
      try {
        let base64Data = mod.file_data;
        if (base64Data.includes(",")) {
          base64Data = base64Data.split(",")[1];
        }
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      } catch (e) {
        console.warn("Error decoding PDF blob:", e);
      }
    }

    // Built-in lessons can reference bundled PDFs.
    if (mod.file_name) {
      const docUrl = `${import.meta.env.BASE_URL}assets/docs/${encodeURIComponent(mod.file_name)}`;
      window.open(docUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Text-only lessons remain available in the reader.
    setActiveModule(mod);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Fisheries & Marine":
        return <Fish className="h-6 w-6 text-sky-600" />;
      case "Sustainable Crops":
        return <Sprout className="h-6 w-6 text-emerald-600" />;
      case "Policy & Law":
        return <Scale className="h-6 w-6 text-purple-600" />;
      case "Agri-Tech":
        return <Cpu className="h-6 w-6 text-amber-600" />;
      default:
        return <BookOpen className="h-6 w-6 text-emerald-600" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-section text-kaani-dark">
        <Header />

        <main className="container px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Top Breadcrumb & Return */}
            <div className="flex items-center justify-between">
              <Link 
                to="/learning" 
                className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-muted-foreground hover:text-kaani-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{tx("Back to Learning Hub")}</span>
              </Link>
            </div>

            {/* Header Banner */}
            <div className="rounded-3xl bg-white shadow-elevated border border-emerald-100 p-6 md:p-10 text-center space-y-4 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-kaani-primary text-xs md:text-sm font-bold border border-emerald-200">
                <BookOpen className="h-4 w-4" />
                <span>{tx("Curated Knowledge Library")}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-kaani-dark tracking-tight">{tx("Practical Training Modules")}</h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">{tx("Step-by-step guides, biological threshold tables, and statutory checklists. Click on any module to read online or download for offline field use.")}</p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto pt-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tx("Search by topic, crop, fish species, or law (e.g., RAS, Tilapia, Soil)...")}
                    className="h-13 rounded-2xl border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm md:text-base focus-visible:ring-2 focus-visible:ring-kaani-primary"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all border ${
                      selectedCategory === cat
                        ? "bg-kaani-primary text-white border-kaani-primary shadow-xs"
                        : "bg-white text-muted-foreground border-slate-200 hover:bg-emerald-50 hover:text-kaani-dark"
                    }`}
                  >
                    {tx(cat)}
                  </button>
                ))}
              </div>
            </div>

            {loading && <p role="status" className="text-center text-muted-foreground">{tx("Loading database modules…")}</p>}
            {fetchError && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center space-y-3">
              <p>{tx("Database modules could not be loaded. Check your connection or ask the administrator to check module read permissions.")}</p>
              <Button variant="outline" onClick={() => setReload(value => value + 1)} disabled={loading}>{tx("Retry")}</Button>
            </div>}
            {/* Modules Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {filteredModules.map((module) => (
                <Card
                  key={module.id}
                  onClick={() => handleOpenModule(module)}
                  className="rounded-3xl border border-slate-100 bg-white shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between p-6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {tx(getCategoryIcon(module.category || ''))}
                      </div>
                      <div className="flex items-center gap-2">
                        {module.category && <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-200 text-muted-foreground">
                          {tx(module.category)}
                        </Badge>}
                        {module.difficulty && <Badge className="text-[10px]" variant="secondary">
                          {tx(module.difficulty)}
                        </Badge>}
                      </div>
                    </div>

                    <CardTitle className="text-xl font-bold font-heading text-slate-900 group-hover:text-kaani-primary transition-colors">
                      {tx(module.title)}
                    </CardTitle>

                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {tx(module.description)}
                    </CardDescription>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    {module.readTimeMinutes && <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {tx(module.readTimeMinutes)}{tx(" min read")}</span>}

                    <button type="button" onClick={(event) => { event.stopPropagation(); handleOpenModule(module); }} className="text-xs font-bold text-kaani-primary hover:underline flex items-center gap-1">{tx("Read Module →")}</button>
                  </div>
                </Card>
              ))}
            </div>

            {!loading && !fetchError && filteredModules.length === 0 && (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">{tx("No modules found")}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{tx("We couldn't find any modules matching \"")}{tx(searchQuery)}{tx("\". Try selecting another category.")}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="rounded-xl text-xs font-bold"
                >{tx("Reset Filters")}</Button>
              </div>
            )}

          </div>
        </main>

        {/* ============================================================ */}
        {/* INTERACTIVE FULL-SCREEN / MODAL READER FOR MODULES */}
        {/* ============================================================ */}
        {activeModule && (
          <Dialog open onOpenChange={(open) => { if (!open) setActiveModule(null); }}>
            <DialogContent className="bg-white rounded-3xl max-w-3xl w-[calc(100%-2rem)] max-h-[90dvh] flex flex-col p-0 gap-0 shadow-elevated border border-emerald-100 overflow-hidden">
              <DialogDescription className="sr-only">{tx(activeModule.description)}</DialogDescription>
              
              {/* Modal Header */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-50 to-sky-50 border-b border-emerald-100 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {activeModule.category && <Badge variant="outline" className="text-xs border-emerald-300 bg-white font-bold text-emerald-800">
                      {tx(activeModule.category)}
                    </Badge>}
                    {activeModule.readTimeMinutes && <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {tx(activeModule.readTimeMinutes)}{tx(" min read")}</span>}
                    <LanguageSelector />
                  </div>
                  <DialogTitle className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900">
                    {tx(activeModule.title)}
                  </DialogTitle>
                </div>
              </div>

              {/* Modal Body / Scrollable Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 leading-relaxed text-sm md:text-base">
                
                {/* Learning Objectives Callout */}
                {(() => {
                  const objectives = activeModule.objectives;
                  if (!objectives || objectives.length === 0) return null;
                  return (
                    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {tx("Key Learning Objectives")}
                      </h4>
                      <ul className="space-y-2 text-xs md:text-sm text-emerald-950">
                        {objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold text-emerald-600">{tx("•")}</span>
                            <span>{tx(obj)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Formatted Content Sections */}
                {(() => {
                  const sections = activeModule.contentSections;
                  return sections?.map((sec, i) => (
                    <div key={i} className="space-y-3 pt-2">
                      <h3 className="text-lg md:text-xl font-bold font-heading text-slate-900">
                        {tx(sec.heading)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {tx(sec.body)}
                      </p>
                      {sec.keyTakeaway && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                          <strong>{tx("Practical Takeaway:")}</strong> {tx(sec.keyTakeaway)}
                        </div>
                      )}
                    </div>
                  ));
                })()}

              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {(activeModule.file_data || activeModule.file_name) && <Button
                  variant="outline"
                  onClick={() => handleOpenModuleGuide(activeModule)}
                  className="rounded-xl flex items-center gap-2 text-xs font-bold border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 hover:text-emerald-950 transition-colors shadow-xs"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span>{tx("Original PDF (English)")}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
                </Button>}

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveModule(null)}
                    className="text-xs font-semibold"
                  >{tx("Close")}</Button>
                  <Button
                    className="bg-kaani-primary hover:bg-kaani-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    asChild
                  >
                    <Link to="/quiz?start=true">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />{tx("Take Quiz on this Topic")}</Link>
                  </Button>
                </div>
              </div>

            </DialogContent>
          </Dialog>
        )}

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ModuleSelection;
