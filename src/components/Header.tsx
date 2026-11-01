import { useText } from "@/lib/translate";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Store, 
  BookOpen, 
  Scale, 
  Leaf, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  ShoppingBag,
  ExternalLink,
  Languages
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/lib/language-context";
import { logout, getCurrentUser } from "@/lib/auth";

interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  is_guest?: boolean;
}

const Header = () => {
  const tx = useText();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const readUser = async () => {
      const current = await getCurrentUser();
      if (mounted) setUser(current);
    };

    readUser();
    window.addEventListener("storage", readUser);
    window.addEventListener("auth-change", readUser);
    return () => {
      mounted = false;
      window.removeEventListener("storage", readUser);
      window.removeEventListener("auth-change", readUser);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { name: t("nav.home", "Home"), href: "/", icon: Home },
    { name: t("nav.market", "Kaani Market"), href: "/market", icon: Store, isMarket: true },
    { name: t("nav.learning", "Learning Hub"), href: "/learning", icon: BookOpen },
    { name: t("nav.legal", "Legal Information"), href: "/legal", icon: Scale },
    { name: t("nav.sustainability", "Sustainability"), href: "/sustainability", icon: Leaf },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100/90 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] transition-all">
      <div className="container mx-auto flex h-[76px] items-center justify-between px-4 lg:px-8">
        {/* Brand Identity / Logo on Left */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-xl"
          aria-label={tx("Kaani Web Home")}
        >
          {/* Shared brand image */}
          <img src={`${import.meta.env.BASE_URL}assets/images/newlogo.png`} alt="" width={200} height={179} className="h-11 w-11 shrink-0 object-contain rounded-xl bg-white p-0.5" />
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-emerald-900 uppercase font-heading leading-tight group-hover:text-emerald-700 transition-colors">{tx("Kaani ")}<span className="text-emerald-600 font-black">{tx("Web")}</span>
            </span>
            <span className="hidden sm:block text-[11px] font-semibold tracking-wider text-emerald-800/80 leading-none">{tx("Learn • Sell • Grow • Innovate")}</span>
          </div>
        </Link>

        {/* Right side navigation buttons for Desktop */}
        <div className="hidden xl:flex items-center space-x-1">
          {/* Main Sections Navigation */}
          <nav className="flex items-center space-x-1 xl:space-x-1.5" aria-label={tx("Main Navigation")}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    active
                      ? "bg-emerald-800 text-white shadow-sm shadow-emerald-900/20 ring-1 ring-emerald-700 font-bold"
                      : "text-slate-700 hover:text-emerald-900 hover:bg-emerald-50/80"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-emerald-200" : "text-emerald-700"}`} />
                  <span>{tx(item.name)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Search Button */}
          <div className="relative pl-1">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors"
              title={tx("Search Products & Guides")}
              aria-label={tx("Search")}
            >
              <Search className="h-4.5 w-4.5 text-slate-700" />
            </button>

            {/* Quick Search Popover */}
            {isSearchOpen && (
              <div className="absolute right-0 top-12 w-80 p-3 bg-white rounded-2xl shadow-xl border border-emerald-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                    <input
                      type="text"
                      placeholder={tx("Search market or guides...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-9 pr-3 py-1.5 text-sm bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <Button type="submit" size="sm" className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-3 text-xs">{tx("Go")}</Button>
                </form>
              </div>
            )}
          </div>

          <LanguageSelector />

          {/* Auth Actions (Login & Register) */}
          <div className="flex items-center space-x-2 pl-2 border-l border-emerald-100 ml-1">
            {user ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full pl-2 pr-2.5 py-1">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                </div>
                <span className="text-xs font-bold text-emerald-950 max-w-[100px] truncate">
                  {tx(user.name || "Learner")}
                </span>
                <button
                  onClick={handleLogout}
                  title={tx("Sign out")}
                  className="p-1 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label={tx("Logout")}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="px-3.5 py-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl border border-transparent transition-colors"
                >
                  {tx(t("nav.login", "Login"))}
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-4 py-1.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs hover:shadow-md rounded-xl transition-all active:scale-95"
                >
                  {tx(t("nav.register", "Register"))}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSelector compact />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            className="p-2 text-emerald-900 rounded-xl hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600"
            aria-label={tx("Toggle navigation menu")}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="xl:hidden border-t border-emerald-100 bg-white/98 backdrop-blur-md px-5 py-5 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
            <input
              type="text"
              placeholder={tx("Search products, guides, laws...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 text-sm bg-emerald-50/60 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 h-7 bg-emerald-800 text-white rounded-lg px-2.5 text-xs font-semibold"
            >{tx("Search")}</Button>
          </form>

          {/* Navigation Links */}
          <nav className="space-y-1.5" id="mobile-navigation" aria-label={tx("Mobile Navigation")}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    active
                      ? "bg-emerald-800 text-white font-bold shadow-xs"
                      : "text-slate-700 hover:text-emerald-950 hover:bg-emerald-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${active ? "text-emerald-200" : "text-emerald-700"}`} />
                    <span>{tx(item.name)}</span>
                  </div>
                  {item.isMarket && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      active ? "bg-emerald-700 text-emerald-100" : "bg-emerald-100 text-emerald-800"
                    }`}>{tx("Fresh")}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex justify-center"><LanguageSelector /></div>

          {/* Mobile Auth and Action Section */}
          <div className="pt-4 border-t border-emerald-100">
            {user ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">{tx(user.name)}</p>
                    <p className="text-xs text-emerald-700">{tx(user.is_guest ? "Guest Learner" : "Verified Member")}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />{tx("Logout")}</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl border-emerald-300 text-emerald-900 font-bold"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/auth">{tx("Login")}</Link>
                </Button>
                <Button
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-xs"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/auth?mode=signup">{tx("Register")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;