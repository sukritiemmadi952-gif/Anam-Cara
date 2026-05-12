import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";

function NavItem({ to, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      data-testid={`nav-link-${to.replace(/\//g, "") || "home"}`}
      className={({ isActive }) =>
        `text-sm transition-colors px-3 py-2 rounded-full ${
          isActive ? "text-slate-900 bg-slate-100" : "text-slate-600 hover:text-slate-900"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  const hideChromeOnAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="App relative">
      <div className="ambient-bg" />

      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-100/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" data-testid="brand-link">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-100">
              <span className="absolute inset-0 rounded-full bg-rose-100 breathe" />
              <Heart className="h-4 w-4 text-rose-500 relative" strokeWidth={1.6} />
            </span>
            <div className="leading-tight">
              <div className="font-soul text-2xl text-slate-800 -mb-1">Anam Cara</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">soul friend</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" end>Home</NavItem>
            <NavItem to="/modes">Reflect</NavItem>
            <NavItem to="/wall">Wall</NavItem>
            <NavItem to="/about">About</NavItem>
            <Link
              to="/modes"
              data-testid="nav-cta-start"
              className="ml-2 inline-flex items-center rounded-full bg-slate-900 text-white text-sm px-4 py-2 hover:bg-slate-700 transition"
            >
              Begin gently
            </Link>
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 rounded-full hover:bg-slate-100"
            data-testid="nav-menu-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-5 py-3 flex flex-col gap-1">
              <NavItem to="/" end>Home</NavItem>
              <NavItem to="/modes">Reflect</NavItem>
              <NavItem to="/wall">Wall</NavItem>
              <NavItem to="/about">About</NavItem>
            </div>
          </div>
        )}
      </header>

      <main className={hideChromeOnAdmin ? "" : ""}>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-slate-100 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="font-soul text-2xl text-slate-800">Anam Cara</div>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              A guided emotional reflection space. A safe friend sitting beside you,
              quietly, while you process your thoughts.
            </p>
          </div>
          <div className="md:col-span-2 rounded-3xl bg-rose-50/60 border border-rose-100 p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-rose-700/80 mb-2">
              A gentle reminder
            </div>
            <p className="text-sm text-slate-700 leading-relaxed" data-testid="footer-disclaimer">
              Anam Cara is <strong>not</strong> therapy, diagnosis, clinical treatment, or crisis
              support. <strong>This platform is not a replacement for professional mental
              health care.</strong> If you are in crisis, please reach out to a trusted adult or
              a local helpline.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} Anam Cara — made gently.</div>
            <Link to="/admin/login" data-testid="footer-admin-link" className="hover:text-slate-700">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
