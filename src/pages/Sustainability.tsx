import { useText } from "@/lib/translate";
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Leaf, 
  Recycle, 
  Lightbulb, 
  TrendingUp, 
  Star, 
  Calendar, 
  ExternalLink, 
  Droplet, 
  Fish, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Sustainability = () => {
  const tx = useText();
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const innovations = [
    {
      title: "Recirculating Aquaculture Systems (RAS)",
      description: "Closed-loop biofiltration setups that recycle up to 98% of culture water while preventing effluent pollution in coastal waters.",
      category: "Aquaculture & Ocean",
      impact: "High",
      adoption: "Growing",
      icon: Fish,
      metrics: "90% less water consumed",
      url: "https://farmonaut.com/blogs/sustainable-fish-farming-technology-7-eco-innovations",
      brandName: "Farmonaut",
      domain: "farmonaut.com",
      brandTagline: "Satellite & AI-Powered Agritech",
      brandTheme: "from-[#08301c] via-[#0f4a2d] to-[#0a3520]",
      badgeBg: "bg-emerald-950/80 text-emerald-400 border-emerald-700/60",
      accentBorder: "border-emerald-300/40 group-hover:border-emerald-500",
      hoverGlow: "group-hover:shadow-[0_12px_30px_rgba(16,185,129,0.18)]"
    },
    {
      title: "Solar-Powered Precision Drip Irrigation",
      description: "Low-pressure micro-tubing powered by solar PV pumps delivers nutrients and moisture directly to plant roots, eliminating diesel costs.",
      category: "Smart Irrigation",
      impact: "High",
      adoption: "Widespread",
      icon: Droplet,
      metrics: "60% water savings & 0 emissions",
      url: "https://masschallenge.org/articles/agriculture-innovation/",
      brandName: "MassChallenge",
      domain: "masschallenge.org",
      brandTagline: "Global Zero-Equity Startup Accelerator",
      brandTheme: "from-[#1b1c20] via-[#24252a] to-[#151619] border-l-4 border-l-[#ED1C24]",
      badgeBg: "bg-neutral-950/90 text-rose-400 border-rose-800/60",
      accentBorder: "border-rose-200/50 group-hover:border-rose-400",
      hoverGlow: "group-hover:shadow-[0_12px_30px_rgba(237,28,36,0.18)]"
    },
    {
      title: "African Nightcrawler Vermicomposting",
      description: "Biological decomposition of farm waste, banana trunks, and manure into enzyme-rich organic worm castings that restore acidic soil.",
      category: "Circular Bioeconomy",
      impact: "High",
      adoption: "Widespread",
      icon: Recycle,
      metrics: "5x more bioavailable nitrogen",
      url: "https://www.wastex.io/post/what-is-vertical-farming",
      brandName: "WasteX",
      domain: "wastex.io",
      brandTagline: "Climate-Tech & Circular Biochar Solutions",
      brandTheme: "from-[#0a151b] via-[#11242d] to-[#09161d]",
      badgeBg: "bg-slate-950/90 text-teal-300 border-teal-700/60",
      accentBorder: "border-teal-200/50 group-hover:border-teal-400",
      hoverGlow: "group-hover:shadow-[0_12px_30px_rgba(0,229,153,0.18)]"
    },
    {
      title: "Controlled-Environment Vertical Hydroponics",
      description: "Stacked vertical towers utilizing nutrient-film technique for year-round high-value vegetable yields in urban and peri-urban centers.",
      category: "Vertical Farming",
      impact: "Medium",
      adoption: "Emerging",
      icon: Leaf,
      metrics: "10x yield per square meter",
      url: "https://www.wastex.io/post/what-is-vertical-farming",
      brandName: "WasteX Insights",
      domain: "wastex.io",
      brandTagline: "High-Efficiency Controlled Agriculture",
      brandTheme: "from-[#0a151b] via-[#11242d] to-[#09161d]",
      badgeBg: "bg-slate-950/90 text-teal-300 border-teal-700/60",
      accentBorder: "border-teal-200/50 group-hover:border-teal-400",
      hoverGlow: "group-hover:shadow-[0_12px_30px_rgba(0,229,153,0.18)]"
    }
  ];

  const successStories = [
    {
      title: "Agriloops: Circular Shrimp and Vegetable Co-Culture",
      location: "European Coastal Lab",
      description: "Pioneering zero-waste aquaculture that captures shrimp metabolic nutrients to fertilize saline-tolerant greens.",
      url: "https://oceans-and-fisheries.ec.europa.eu/news/agriloops-sustainable-shrimp-and-vegetables-thanks-blueinvest-2025-01-31_en",
      date: "2025",
      tag: "Blue Economy",
      brandName: "European Commission • BlueInvest",
      domain: "ec.europa.eu",
      themeBg: "from-[#002B80] via-[#0039A6] to-[#082260]",
      badgeBg: "bg-blue-950/90 text-amber-300 border-amber-400/50",
      accentBorder: "border-blue-200 group-hover:border-blue-500",
      hoverGlow: "group-hover:shadow-[0_12px_30px_rgba(0,51,153,0.22)]"
    },
    {
      title: "Evangeline's Journey: Sustainable Agriculture in the Philippines",
      location: "Philippines (MEDA Project)",
      description: "How climate-smart agricultural training and organic composting empowered rural women smallholders across Region VIII.",
      url: "https://www.meda.org/news/success-stories/evangelines-journey-environmental-innovation-in-the-philippines-transforms-opportunities-for-women-farmers/",
      date: "2024",
      tag: "Community Impact",
      brandName: "MEDA Global",
      domain: "meda.org",
      themeBg: "from-[#004D59] via-[#006E80] to-[#003C45]",
      badgeBg: "bg-teal-950/90 text-orange-300 border-orange-400/50",
      accentBorder: "border-teal-200 group-hover:border-orange-400",
      hoverGlow: "group-hover:shadow-[0_12px_30px_rgba(255,121,0,0.20)]"
    },
    {
      title: "Fostering Innovation in High-Efficiency Agriculture",
      location: "UNDP Global Initiative",
      description: "Startups driving technology adoption for off-grid precision farming and clean river basin protection.",
      url: "https://www.undp.org/egypt/stories/fostering-innovation-egypts-agriculture-success-stories-startups-driving-change",
      date: "2024",
      tag: "Tech Transfer",
      brandName: "United Nations (UNDP)",
      domain: "undp.org",
      themeBg: "from-[#024B80] via-[#0468B1] to-[#01355C]",
      badgeBg: "bg-sky-950/90 text-sky-300 border-sky-400/50",
      accentBorder: "border-sky-200 group-hover:border-sky-500",
      hoverGlow: "group-hover:shadow-[0_12px_30px_rgba(4,104,177,0.22)]"
    }
  ];

  const filterCategories = ["All", "Aquaculture & Ocean", "Smart Irrigation", "Circular Bioeconomy", "Vertical Farming"];

  const filteredInnovations = selectedFilter === "All"
    ? innovations
    : innovations.filter(i => i.category === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-section">
      <Header />

      {/* Hero Section */}
      <section className="py-14 md:py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-kaani-primary text-xs md:text-sm font-bold border border-emerald-200">
              <Leaf className="h-4 w-4" />
              <span>{tx("Climate-Smart Agriculture & Fisheries")}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading text-kaani-dark tracking-tight">{tx("Sustainability Hub")}</h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{tx("Explore eco-friendly aquaculture, circular soil regeneration, and zero-emission irrigation solutions reshaping livelihoods.")}</p>
          </div>
        </div>
      </section>

      {/* Sustainable Innovations Directory */}
      <section className="py-14 bg-white border-t border-emerald-100">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-kaani-dark">{tx("Featured Sustainable Technologies")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{tx("Proven low-impact innovations ready for practical deployment.")}</p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                      selectedFilter === cat
                        ? "bg-kaani-primary text-white border-kaani-primary shadow-xs"
                        : "bg-white text-muted-foreground border-slate-200 hover:bg-emerald-50"
                    }`}
                  >
                    {tx(cat)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredInnovations.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-3xl border border-slate-200 bg-white shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer ${item.accentBorder} ${item.hoverGlow}`}
                    onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                  >
                    {/* Real Domain & Browser Header Bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-300 text-xs font-mono border-b border-slate-800">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                        <span className="text-slate-400">{tx("https://")}</span>
                        <span className="text-white font-bold tracking-tight truncate">{tx(item.domain)}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-800 shrink-0 font-medium">
                        <ExternalLink className="h-3 w-3" />
                        <span>{tx("External Source")}</span>
                      </span>
                    </div>

                    {/* Authentic Brand Header Banner */}
                    <div className={`p-5 bg-gradient-to-r ${item.brandTheme} text-white flex flex-wrap items-center justify-between gap-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs uppercase font-black tracking-wider text-white">
                              {tx(item.brandName)}
                            </span>
                            <Badge className={`text-[9px] py-0 px-1.5 uppercase font-bold ${item.badgeBg}`}>
                              {tx(item.category)}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-white/70 line-clamp-1 mt-0.5 font-medium">
                            {tx(item.brandTagline)}
                          </p>
                        </div>
                      </div>

                      <Badge className="text-[10px] bg-white text-slate-900 hover:bg-white font-bold shrink-0">
                        {tx(item.impact)}{tx(" Impact")}</Badge>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg md:text-xl font-bold font-heading text-slate-900 group-hover:text-kaani-primary transition-colors leading-snug">
                          {tx(item.title)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tx(item.description)}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{tx("Metric: ")}<strong className="text-emerald-800">{tx(item.metrics)}</strong></span>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-kaani-primary transition-colors">
                      <span className="flex items-center gap-1.5">
                        <span>{tx("Read full article on")}</span>
                        <span className="font-extrabold text-slate-900 group-hover:text-kaani-primary">{tx(item.brandName)}</span>
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Verified Success Stories */}
      <section className="py-14 bg-gradient-section">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-kaani-dark">{tx("Real-World Impact Stories")}</h2>
              <p className="text-sm text-muted-foreground">{tx("Documented initiatives creating lasting transformation in coastal and farming communities.")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {successStories.map((story, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl border border-slate-200 bg-white shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer ${story.accentBorder} ${story.hoverGlow}`}
                  onClick={() => window.open(story.url, "_blank", "noopener,noreferrer")}
                >
                  {/* Domain Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 text-slate-300 text-[11px] font-mono border-b border-slate-800">
                    <span className="text-white font-bold truncate">{tx("https://")}{tx(story.domain)}</span>
                    <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                  </div>

                  {/* Brand Header Banner */}
                  <div className={`p-4 bg-gradient-to-r ${story.themeBg} text-white space-y-1`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-black uppercase tracking-wider text-white">
                        {tx(story.brandName)}
                      </span>
                      <Badge className={`text-[9px] py-0 px-1.5 uppercase font-bold ${story.badgeBg}`}>
                        {tx(story.tag)}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-white/70 flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" />{tx(" Published ")}{tx(story.date)}{tx(" • ")}{tx(story.location)}
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2 flex-1">
                    <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-kaani-primary transition-colors leading-snug">
                      {tx(story.title)}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tx(story.description)}
                    </p>
                  </div>

                  {/* Action Link Footer */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-kaani-primary transition-colors">
                    <span>{tx("Open Case Study ↗")}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Sustainability Action CTA */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-hero text-white text-center space-y-4 shadow-elevated">
              <Leaf className="h-8 w-8 text-emerald-300 mx-auto" />
              <h3 className="text-2xl md:text-3xl font-bold font-heading">{tx("Adopt Climate-Smart Practices in Your Community")}</h3>
              <p className="text-sm md:text-base text-emerald-50/90 max-w-xl mx-auto leading-relaxed">{tx("Explore our comprehensive training materials and field-tested ecological practices to maximize resilience and yield.")}</p>
              <div className="pt-2">
                <Button 
                  size="lg" 
                  className="bg-white hover:bg-emerald-50 text-kaani-primary font-bold rounded-2xl px-8 py-6 shadow-md text-sm md:text-base"
                  asChild
                >
                  <Link to="/learning">{tx("Explore Learning Resources ")}<ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sustainability;
