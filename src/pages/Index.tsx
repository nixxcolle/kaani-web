import { useText } from "@/lib/translate";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Leaf, 
  Scale, 
  CheckCircle, 
  FileText, 
  HelpCircle,
  AlertTriangle,
  Compass,
  ChevronRight,
  ShieldCheck,
  Sprout,
  Waves,
  Store,
  ArrowRight
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/images/Catbalogan.png";

const heroButtonClass = 'h-14 w-full px-4 text-sm lg:text-base font-bold rounded-2xl border-2 shadow-elevated transition-colors flex items-center justify-center gap-2';

const Index = () => {
  const tx = useText();
  const features = [
    {
      icon: Store,
      title: "Kaani Market",
      description: "Direct marketplace connecting local farmers and fisherfolk with consumers to promote and sell fresh harvests.",
      href: "/market",
      tag: "Direct Farm-to-Table",
      color: "text-emerald-800 bg-emerald-100/80 border-emerald-300"
    },
    {
      icon: BookOpen,
      title: "Learning Hub",
      description: "Organized modules, tutorials, and practical guides for farmers, fishers, and students.",
      href: "/learning",
      tag: "Educational Modules",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Eco-friendly innovations, success stories, and modern agricultural solutions.",
      href: "/sustainability",
      tag: "Eco Innovations",
      color: "text-teal-700 bg-teal-50 border-teal-200"
    },
    {
      icon: Scale,
      title: "Legal Guide",
      description: "Simplified legal guidance, permits, regulations, and compliance checklists.",
      href: "/legal",
      tag: "Laws & Compliance",
      color: "text-purple-700 bg-purple-50 border-purple-200"
    }
  ];

  const benefits = [
    "Complex laws made simple and accessible",
    "Practical guides for real-world applications",
    "Interactive learning with modules and tutorials",
    "Community connection and knowledge sharing",
    "Up-to-date regulatory information",
    "Sustainable farming and fishing practices"
  ];

  const problems = [
    {
      title: "Complex Legal Framework",
      description: "Agricultural and fisheries laws (such as RA 8550 & RA 10654) are scattered, technical, and hard to understand for smallholders.",
      icon: AlertTriangle
    },
    {
      title: "Knowledge Gaps",
      description: "Learning materials and modern agricultural research are often too technical and not accessible in rural areas.",
      icon: HelpCircle
    },
    {
      title: "Sustainability Issues",
      description: "Limited access to modern, eco-friendly farming and fishing solutions leads to depleted fisheries and degraded soil.",
      icon: Compass
    }
  ];

  const statMetrics = [
    { number: "100%", label: "Free Open-Access Education", icon: Sprout },
    { number: "15 km", label: "Municipal Coastal Coverage", icon: Waves },
    { number: "4 Core", label: "Pillars: Crops, Fish, Law & Tech", icon: BookOpen },
    { number: "24/7", label: "Accessible on Mobile & Desktop", icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="home-hero relative overflow-hidden min-h-[560px] md:min-h-[660px] flex items-center justify-center text-white">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />

        {/* Subtle Darkening Gradients for optimal readability while keeping the scenery vivid */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-950/75 to-emerald-950/85"
          aria-hidden="true" 
        />
        <div 
          className="absolute inset-0 bg-emerald-950/25 mix-blend-multiply" 
          aria-hidden="true" 
        />

        {/* Hero Content */}
        <div className="relative container px-5 py-20 md:py-28 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-7">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-emerald-100 text-xs sm:text-sm font-semibold shadow-sm">
              <Sprout className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>{tx("Samar State University • Agriculture & Fisheries Innovation")}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight text-white leading-tight drop-shadow-sm">{tx("Empowering Agriculture & Fisheries")}</h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-emerald-50/95 font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-sm">{tx("Simplifying laws, sharing practical guides, and connecting communities to maximize harvests and sustainable practices.")}</p>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch max-w-sm md:max-w-3xl mx-auto pt-3">
              <Button size="lg" className={`${heroButtonClass} border-emerald-700 bg-[#0d533a] hover:bg-[#083a28] text-white`} asChild>
                <Link to="/market"><Store className="h-4 w-4" /><span>{tx("Kaani Market")}</span><ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" className={`${heroButtonClass} border-white bg-white hover:bg-emerald-50 text-emerald-950`} asChild>
                <Link to="/learning"><BookOpen className="h-4 w-4" /><span>{tx("Learning Hub")}</span><ChevronRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" className={`${heroButtonClass} border-white bg-white hover:bg-emerald-50 text-emerald-950`} asChild>
                <Link to="/legal"><Scale className="h-4 w-4" /><span>{tx("Legal Guidance")}</span><ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Metrics Bar */}
      <section className="bg-white border-b border-emerald-100/80 shadow-xs py-6 md:py-8 relative z-20">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {statMetrics.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/50 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-kaani-primary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-black font-heading text-kaani-dark leading-tight">
                      {tx(item.number)}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {tx(item.label)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Addressing Critical Challenges (Problem & Solution) */}
      <section className="py-16 md:py-24 bg-gradient-section">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-kaani-primary bg-emerald-100/80 px-3.5 py-1.5 rounded-full border border-emerald-200">{tx("Transforming Challenges into Opportunities")}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-kaani-dark">{tx("Addressing Critical Challenges")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{tx("We tackle the complex issues facing agriculture and fisheries communities through accessible education and practical solutions.")}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* The Problems We Solve */}
            <Card className="rounded-3xl border border-rose-100/80 bg-white shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="h-2 bg-rose-500"></div>
              <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
                <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>{tx("Current Hurdles")}</div>
                <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-slate-900">{tx("The Problems We Solve")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">{tx("Key barriers identified by agricultural and coastal stakeholders.")}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 pb-8 space-y-4 flex-1">
                {problems.map((prob, idx) => {
                  const Icon = prob.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-rose-50/40 border border-rose-100/60">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{tx(prob.title)}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tx(prob.description)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Our Solution */}
            <Card className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/30 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="h-2 bg-emerald-600"></div>
              <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />{tx("Our Approach")}</div>
                <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-slate-900">{tx("Our Solution")}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">{tx("Actionable, open-access education tailored for field and coastal use.")}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 pb-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-100/80 shadow-xs"
                    >
                      <div className="w-5 h-5 rounded-md bg-emerald-100 text-kaani-primary flex items-center justify-center shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{tx(benefit)}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button 
                    className="w-full bg-kaani-primary hover:bg-kaani-dark text-white font-bold py-4 rounded-xl shadow-xs"
                    asChild
                  >
                    <Link to="/learning" className="flex items-center justify-center gap-2 text-sm">
                      <span>{tx("Explore Learning Modules")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comprehensive Platform Features */}
      <section className="py-16 md:py-24 bg-white border-t border-emerald-100/70">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-kaani-primary bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">{tx("Core Platform Pillars")}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-kaani-dark">{tx("Comprehensive Platform Features")}</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{tx("Everything you need to succeed in modern agriculture and fisheries, all in one place.")}</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="rounded-3xl border border-slate-100 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 bg-white overflow-hidden"
                >
                  <CardHeader className="p-7 pb-4">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform duration-200 ${feature.color}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <Badge variant="outline" className="text-[11px] uppercase font-bold tracking-wider border-slate-200 text-muted-foreground">
                        {tx(feature.tag)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold font-heading text-slate-900 group-hover:text-kaani-primary transition-colors">
                      {tx(feature.title)}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {tx(feature.description)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-7 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-emerald-200 text-kaani-primary hover:bg-emerald-50 hover:text-kaani-dark rounded-xl justify-between font-bold text-sm py-5 transition-all group-hover:border-kaani-primary"
                      asChild
                    >
                      <Link to={feature.href} className="flex items-center justify-between w-full">
                        <span>{tx("Explore")}</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
