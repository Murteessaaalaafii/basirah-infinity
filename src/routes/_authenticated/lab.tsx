import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import { waitForAuth, isAdmin as checkAdmin, fetchLabAssets, deleteDocById } from "@/integrations/firebase/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateLabImage } from "@/lib/lab.functions";
import { Sparkles, Wand2, Download, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/lab")({
  head: () => ({
    meta: [
      { title: "Creative Lab — Basirah Infinity | Murtesa Alafi" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow, noarchive" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const user = await waitForAuth();
    if (!user) throw redirect({ to: "/login" });
    const admin = await checkAdmin(user.uid);
    if (!admin) throw redirect({ to: "/dashboard" });
  },
  component: LabPage,
});

const KINDS = [
  { id: "logo", label: "Logo", hint: "Vector-style brand mark" },
  { id: "brand", label: "Brand kit", hint: "Logo + palette + type board" },
  { id: "graphic", label: "Graphic", hint: "Hero / social / banner" },
  { id: "icon", label: "Icon", hint: "App or product icon" },
  { id: "poster", label: "Poster", hint: "Editorial poster design" },
] as const;

function LabPage() {
  const generate = useServerFn(generateLabImage);
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("logo");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  async function load() {
    const data = await fetchLabAssets();
    setAssets(data);
  }
  useEffect(() => {
    load();
  }, []);

  async function onGenerate(sourceImage?: string) {
    if (!prompt.trim()) return toast.error("Describe what to create");
    setLoading(true);
    try {
      const res = await generate({ data: { kind, prompt, sourceImage } });
      setActivePreview(res.imageUrl);
      toast.success("Generated & saved to library");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteDocById("lab_assets", id);
      toast.success("Deleted");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function download(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.png`;
    a.click();
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] tracking-widest text-neon-cyan">
            <Sparkles className="h-3 w-3" /> CREATIVE LAB · ADMIN ONLY
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            AI Brand <span className="text-gradient-brand">Lab</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Generate logos, brand kits, graphics, icons and posters with Murtesa Alafi's
            multimodal AI. Edit existing assets, download, or save to the library.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Composer */}
          <div className="premium-border rounded-2xl p-6">
            <Tabs value={kind} onValueChange={(v) => setKind(v as any)}>
              <TabsList className="glass flex-wrap">
                {KINDS.map((k) => (
                  <TabsTrigger key={k.id} value={k.id}>
                    {k.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {KINDS.map((k) => (
                <TabsContent key={k.id} value={k.id} className="mt-3">
                  <p className="text-xs text-muted-foreground">{k.hint}</p>
                </TabsContent>
              ))}
            </Tabs>
            <div className="mt-4 space-y-3">
              <Label htmlFor="lab-prompt">Prompt</Label>
              <Textarea
                id="lab-prompt"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "Murtesa Alafi Website — N monogram, cyan-to-violet gradient, geometric, premium, on white"'
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onGenerate()} disabled={loading}>
                  <Wand2 className="h-4 w-4" />
                  {loading ? "Generating…" : "Generate"}
                </Button>
                {activePreview && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onGenerate(activePreview)}
                      disabled={loading}
                    >
                      <Sparkles className="h-4 w-4" /> Edit selected
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => download(activePreview, `basirah-${kind}`)}
                    >
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-3">
                {[
                  "Liquid glass logo, holographic shimmer",
                  "Editorial poster, 'BASIRAH INFINITY' typography",
                  "Brand board, cyan/violet/black palette",
                  "App icon, abstract neural B",
                  "Hero graphic, futuristic city skyline",
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="liquid-btn-ghost rounded-full px-3 py-1 text-[11px]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="premium-border flex items-center justify-center rounded-2xl p-6">
            {activePreview ? (
              <img
                src={activePreview}
                alt="Generated"
                className="max-h-[480px] w-auto rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
                <ImageIcon className="h-12 w-12" />
                <p className="text-sm">Your AI generation will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold">Library</h2>
          <p className="text-xs text-muted-foreground">Recent lab generations.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {assets.map((a) => (
              <div
                key={a.id}
                className="liquid-glass group relative overflow-hidden rounded-2xl"
              >
                <img src={a.image_data} alt={a.prompt} className="aspect-square w-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-black/80 via-black/0 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="line-clamp-2 text-[11px] text-white/90">{a.prompt}</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setActivePreview(a.image_data)}>
                      Open
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => download(a.image_data, `basirah-${a.kind}`)}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] uppercase text-white backdrop-blur">
                  {a.kind}
                </span>
              </div>
            ))}
            {!assets.length && (
              <p className="col-span-full p-6 text-center text-sm text-muted-foreground">
                Library is empty — generate your first asset above.
              </p>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
