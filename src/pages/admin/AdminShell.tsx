import { Link } from "react-router-dom";
import { signOutAdmin } from "../../lib/supabase";

type Props = {
  title: string;
  subtitle?: string;
  active: "upload" | "albums" | "photos";
  stats: { albums: number; photos: number; published: number };
  children: React.ReactNode;
};

export function AdminShell({ title, subtitle, active, stats, children }: Props) {
  async function handleSignOut() {
    await signOutAdmin();
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white pt-[120px] px-4 md:px-8 pb-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap shadow-2xl shadow-black/20">
          <div>
            <p className="uppercase tracking-[0.25em] text-xs text-white/40 mb-2">Asset manager</p>
            <h1 className="text-3xl md:text-4xl font-semibold">{title}</h1>
            {subtitle ? <p className="text-white/60 mt-2">{subtitle}</p> : null}
          </div>
          <button onClick={() => void handleSignOut()} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
            Sign out
          </button>
        </header>

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 w-fit">
          <Link to="/admin/upload" className={`px-4 py-2 rounded-xl text-sm transition ${active === "upload" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>Upload</Link>
          <Link to="/admin/albums" className={`px-4 py-2 rounded-xl text-sm transition ${active === "albums" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>Albums</Link>
          <Link to="/admin/photos" className={`px-4 py-2 rounded-xl text-sm transition ${active === "photos" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>Photos</Link>
        </nav>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Albums", value: stats.albums },
            { label: "Published", value: stats.published },
            { label: "Photos", value: stats.photos },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
              <p className="text-white/45 text-sm uppercase tracking-[0.2em] mb-2">{item.label}</p>
              <p className="text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </section>

        {children}
      </div>
    </div>
  );
}
