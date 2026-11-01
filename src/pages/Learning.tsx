import { useText } from "@/lib/translate";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  PlayCircle, 
  Users, 
  Award, 
  Search, 
  Clock, 
  ArrowRight, 
  Fish, 
  Sprout, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ChevronRight,
  Languages
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LearningModule } from "@/lib/data";
import { fetchLearningModules } from "@/lib/modules";
import { useLanguage } from "@/lib/language-context";

const Learning = () => {
  const tx = useText();
  const { language, toggleLanguage, isFilipino, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [modules, setModules] = useState<LearningModule[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [reload, setReload] = useState(0);

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

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Modules",
      description: "Comprehensive step-by-step guides with practical field examples and case studies."
    },
    {
      icon: PlayCircle,
      title: "Practical Blueprints",
      description: "Detailed schematics demonstrating real-world agricultural and RAS applications."
    },
    {
      icon: Users,
      title: "Community Wisdom",
      description: "Local knowledge from experienced Filipino farmers, fisherfolk, and researchers."
    },
    {
      icon: Award,
      title: "Skills Progression",
      description: "Track your mastery across crops, fisheries, environmental laws, and agri-tech."
    }
  ];

  const learningPaths = [
    {
      role: "For Fisherfolk & Coastal Communities",
      icon: Fish,
      badge: "Fisheries Focus",
      color: "bg-sky-50/70 border-sky-200/80 text-sky-900",
      accent: "text-sky-600",
      topics: [
        "Fish physiological adaptations and locomotion",
        "Water quality parameters: DO, Ammonia, and pH",
        "Philippine Fisheries Code (RA 8550/10654) compliance",
        "Mangrove preservation and nursery reef protection"
      ],
      linkText: "Explore Fisheries Modules",
      categoryParam: "Fisheries & Marine"
    },
    {
      role: "For Smallholder Crop Farmers",
      icon: Sprout,
      badge: "Agriculture Focus",
      color: "bg-emerald-50/70 border-emerald-200/80 text-emerald-900",
      accent: "text-emerald-600",
      topics: [
        "African Nightcrawler vermicomposting setups",
        "Solar-powered drip irrigation blueprints",
        "Integrated Pest Management (IPM) techniques",
        "Organic soil organic matter restoration"
      ],
      linkText: "Explore Agriculture Modules",
      categoryParam: "Sustainable Crops"
    },
    {
      role: "For Students & Agri-Entrepreneurs",
      icon: GraduationCap,
      badge: "Academic & Tech",
      color: "bg-purple-50/70 border-purple-200/80 text-purple-900",
      accent: "text-purple-600",
      topics: [
        "Environmental Compliance Certificates (ECC) via DENR",
        "Hydroponic & vertical farming unit economics",
        "Agricultural precision drone imaging",
        "Field research methods and data collection"
      ],
      linkText: "Explore Agri-Tech & Law",
      categoryParam: "Agri-Tech"
    }
  ];

  const categories = useMemo(() => {
    const cats = Array.from(new Set(modules.map(m => m.category).filter((category): category is NonNullable<LearningModule['category']> => Boolean(category))));
    return ["All", ...cats];
  }, [modules]);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch = 
        `${module.title} ${tx(module.title)}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${module.description} ${tx(module.description)}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || module.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [modules, searchQuery, selectedCategory, tx]);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-xs">{tx("Beginner")}</Badge>;
      case "Intermediate":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-xs">{tx("Intermediate")}</Badge>;
      case "Advanced":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 text-xs">{tx("Advanced")}</Badge>;
      default:
        return <Badge variant="outline">{tx(difficulty)}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-14 md:py-20 bg-gradient-section border-b border-emerald-100/60">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-kaani-primary text-xs md:text-sm font-bold border border-emerald-200">
                <BookOpen className="h-4 w-4" />
                <span>{tx("Comprehensive Knowledge Center")}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="h-8 rounded-full border-emerald-300 bg-white/90 hover:bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                title={tx("Isalin sa Filipino / Switch to English")}
              >
                <Languages className="h-3.5 w-3.5 text-emerald-700" />
                <span>{isFilipino ? "Switch to English" : "Isalin sa Filipino"}</span>
              </Button>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading text-kaani-dark tracking-tight">
              {tx("Learning Hub")}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {tx("Master agriculture and fisheries through practical modules, technical blueprints, and community-driven learning resources.")}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto pt-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tx("Search courses, topics, or skills (e.g. soil, fish, RAS)...")} 
                className="pl-11 pr-4 py-6 rounded-2xl border-emerald-200 bg-white shadow-sm text-sm focus-visible:ring-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-kaani-primary text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"
                  }`}
                >
                  {tx(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Learning Platform */}
      <section className="py-16 bg-white border-b border-emerald-100/60">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-kaani-primary bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">{tx("Open Educational Resources")}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-kaani-dark">{tx("Why Choose Our Learning Platform?")}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="text-center rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all duration-300 p-6 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <CardHeader className="p-0">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-kaani-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200 border border-emerald-100">
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-lg font-bold font-heading text-kaani-dark">{tx(feature.title)}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {tx(feature.description)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Learning Modules */}
      <section className="py-16 md:py-20 bg-gradient-section">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kaani-primary bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
              <Layers className="h-3.5 w-3.5" />
              <span>{tx("Modular Curriculum")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-kaani-dark">{tx("Featured Learning Modules")}</h2>
            <p className="text-sm md:text-base text-muted-foreground">{tx("Select a module to access step-by-step instructions, key takeaways, and field checklists.")}</p>
          </div>

          {loading && <p role="status" className="text-center mb-6 text-muted-foreground">{tx("Loading database modules…")}</p>}
          {fetchError && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 mb-6 text-center space-y-3">
            <p>{tx("Database modules could not be loaded. Check your connection or ask the administrator to check module read permissions.")}</p>
            <Button variant="outline" onClick={() => setReload(value => value + 1)} disabled={loading}>{tx("Retry")}</Button>
          </div>}
          {!loading && !fetchError && filteredModules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl max-w-md mx-auto border border-dashed border-slate-200 p-8">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="font-bold text-slate-700">{tx("No modules match your query")}</p>
              <p className="text-xs text-muted-foreground mt-1">{tx("Try resetting the filter or searching for another keyword.")}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 rounded-xl text-xs"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >{tx("Clear Search")}</Button>
            </div>
          ) : (
            <div className={`grid gap-6 mx-auto ${filteredModules.length === 1 ? "max-w-md" : filteredModules.length === 2 ? "md:grid-cols-2 max-w-4xl" : "md:grid-cols-2 lg:grid-cols-3 max-w-6xl"}`}>
              {filteredModules.map((module) => (
                <Card 
                  key={module.id} 
                  className="rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 bg-white overflow-hidden"
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      {module.category && <Badge variant="outline" className="text-xs font-semibold border-emerald-200 text-kaani-primary bg-emerald-50/50">
                        {tx(module.category)}
                      </Badge>}
                      {tx(module.difficulty && getDifficultyBadge(module.difficulty))}
                    </div>
                    <CardTitle className="text-xl font-bold font-heading text-slate-900 group-hover:text-kaani-primary transition-colors">
                      {tx(module.title)}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {tx(module.description)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-kaani-primary" />
                        {tx((module.file_name || module.file_data) ? "Official PDF Guide" : "Interactive Guide")}
                      </span>
                      {module.readTimeMinutes && <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-kaani-primary" />
                        {tx(module.readTimeMinutes)}{tx(" min read")}</span>}
                    </div>

                    <Button 
                      className="w-full bg-kaani-primary hover:bg-kaani-dark text-white font-bold py-5 rounded-xl shadow-xs transition-all group-hover:shadow-md"
                      asChild
                    >
                      <Link to="/modules">
                        <span>{tx("Start Learning")}</span>
                        <ChevronRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tailored Learning Pathways */}
      <section className="py-16 bg-white border-t border-emerald-100/70">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-kaani-primary bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">{tx("Curated Roadmaps")}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-kaani-dark">{tx("Tailored Learning Pathways")}</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">{tx("Access curated topics matched to your specific role in agriculture or coastal management.")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {learningPaths.map((path, idx) => {
                const Icon = path.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-3xl border p-6 flex flex-col justify-between shadow-xs hover:shadow-card transition-all ${path.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                          <Icon className={`h-6 w-6 ${path.accent}`} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                          {tx(path.badge)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-heading mb-3">{tx(path.role)}</h3>

                      <ul className="space-y-2.5 text-xs md:text-sm mb-6">
                        {path.topics.map((topic, tidx) => (
                          <li key={tidx} className="flex items-start gap-2">
                            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${path.accent}`} />
                            <span className="opacity-90 leading-snug">{tx(topic)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold text-xs py-5"
                      asChild
                    >
                      <Link to={`/modules?category=${encodeURIComponent(path.categoryParam)}`}>
                        <span>{tx(path.linkText)}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-section border-t border-emerald-100/60">
        <div className="container px-4">
          <Card className="max-w-4xl mx-auto rounded-3xl bg-gradient-hero text-white p-8 md:p-12 text-center shadow-elevated">
            <CardContent className="p-0 space-y-4">
              <BookOpen className="h-10 w-10 text-emerald-200 mx-auto" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading">{tx("Ready to Start Your Learning Journey?")}</h2>
              <p className="text-sm sm:text-base text-emerald-50/90 max-w-xl mx-auto leading-relaxed">{tx("Join farmers, municipal fisherfolk, and students across the country who are building resilient harvests through accessible knowledge.")}</p>
              <div className="pt-2">
                <Button 
                  size="lg" 
                  className="bg-white hover:bg-emerald-50 text-kaani-primary font-bold px-8 py-6 rounded-2xl shadow-md text-base"
                  asChild
                >
                  <Link to="/modules">{tx("Browse All Learning Modules ")}<ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Learning;