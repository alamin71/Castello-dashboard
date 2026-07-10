"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { usePolicy } from "@/hooks/queries/usePolicy";
import { useCreatePolicy } from "@/hooks/mutations/useCreatePolicy";
import { useUpdatePolicy } from "@/hooks/mutations/useUpdatePolicy";
import { PolicySlug } from "@/types/policy.types";

type PageTab = "privacy" | "terms" | "about";

const TAB_LABELS: Record<PageTab, string> = {
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  about: "About this app",
};

const TAB_SLUG: Record<PageTab, PolicySlug> = {
  privacy: "privacy-policy",
  terms:   "terms-conditions",
  about:   "about-app",
};

// ─── Toolbar helpers ───────────────────────────────────────────────────────────
function TBtn({ onCmd, title, children }: { onCmd: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onCmd(); }}
      className="p-1.5 rounded transition-colors text-white/60 hover:text-white hover:bg-white/8"
    >
      {children}
    </button>
  );
}

// ─── Per-tab editor (each tab mounts its own instance) ────────────────────────
function PolicyEditor({ tab }: { tab: PageTab }) {
  const slug = TAB_SLUG[tab];
  const editorRef = useRef<HTMLDivElement>(null);

  const [alignOpen, setAlignOpen] = useState(false);
  const [fontOpen, setFontOpen]   = useState(false);
  const [sizeOpen, setSizeOpen]   = useState(false);
  const [currentFont, setCurrentFont] = useState("Inter");
  const [currentSize, setCurrentSize] = useState("16");
  const [toast, setToast] = useState("");

  const { data: policy, isLoading } = usePolicy(slug);
  const { mutate: createPolicy, isPending: isCreating } = useCreatePolicy(slug);
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdatePolicy(slug);
  const isSaving = isCreating || isUpdating;

  // Populate editor once API data arrives
  useEffect(() => {
    if (editorRef.current && policy?.content) {
      editorRef.current.innerHTML = policy.content;
    }
  }, [policy]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val ?? "");
    editorRef.current?.focus();
  };

  const applyFont = (font: string) => {
    setCurrentFont(font);
    exec("fontName", font);
    setFontOpen(false);
  };

  const applySize = (size: string) => {
    setCurrentSize(size);
    const sizeMap: Record<string, string> = { "12": "1", "14": "2", "16": "3", "18": "4", "20": "5", "24": "6", "32": "7" };
    exec("fontSize", sizeMap[size] ?? "3");
    setSizeOpen(false);
  };

  const handleSave = () => {
    const content = editorRef.current?.innerHTML ?? "";
    const onSuccess = () => {
      setToast("Saved successfully!");
      setTimeout(() => setToast(""), 3000);
    };

    if (policy) {
      updatePolicy({ content }, { onSuccess });
    } else {
      createPolicy({ title: TAB_LABELS[tab], content }, { onSuccess });
    }
  };

  const FONTS = ["Inter", "Arial", "Georgia", "Courier New", "Trebuchet MS"];
  const SIZES = ["12", "14", "16", "18", "20", "24", "32"];

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-6">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-4 py-2.5 border-b border-white/10 flex-wrap relative">

          {/* Font family */}
          <span className="text-white/50 text-sm mr-1 font-serif">T</span>
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setFontOpen(v => !v); setSizeOpen(false); setAlignOpen(false); }}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white/70 hover:text-white rounded hover:bg-white/8 transition-colors"
            >
              {currentFont} <ChevronDown size={12} />
            </button>
            {fontOpen && (
              <div className="absolute top-8 left-0 z-50 bg-[#232323] border border-white/10 rounded-xl shadow-xl py-1 min-w-32">
                {FONTS.map((f) => (
                  <button key={f} type="button" onMouseDown={(e) => { e.preventDefault(); applyFont(f); }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors" style={{ fontFamily: f }}>
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          {/* Font size */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setSizeOpen(v => !v); setFontOpen(false); setAlignOpen(false); }}
              className="flex items-center gap-1 px-2 py-1 text-sm text-white/70 hover:text-white rounded hover:bg-white/8 transition-colors"
            >
              {currentSize} <ChevronDown size={12} />
            </button>
            {sizeOpen && (
              <div className="absolute top-8 left-0 z-50 bg-[#232323] border border-white/10 rounded-xl shadow-xl py-1 min-w-16">
                {SIZES.map((s) => (
                  <button key={s} type="button" onMouseDown={(e) => { e.preventDefault(); applySize(s); }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          <TBtn onCmd={() => exec("bold")} title="Bold"><Bold size={14} /></TBtn>
          <TBtn onCmd={() => exec("italic")} title="Italic"><Italic size={14} /></TBtn>
          <TBtn onCmd={() => exec("underline")} title="Underline"><Underline size={14} /></TBtn>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          <TBtn onCmd={() => exec("outdent")} title="Outdent"><Outdent size={14} /></TBtn>
          <TBtn onCmd={() => exec("indent")} title="Indent"><Indent size={14} /></TBtn>

          {/* Align dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setAlignOpen(v => !v); setFontOpen(false); setSizeOpen(false); }}
              className="flex items-center gap-1 p-1.5 text-white/60 hover:text-white hover:bg-white/8 rounded transition-colors"
              title="Text Align"
            >
              <AlignLeft size={14} /><ChevronDown size={11} />
            </button>
            {alignOpen && (
              <div className="absolute top-8 left-0 z-50 bg-[#232323] border border-white/10 rounded-xl shadow-xl py-1">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); setAlignOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors"><AlignLeft size={14} /> Left</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); setAlignOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors"><AlignCenter size={14} /> Center</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); setAlignOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors"><AlignRight size={14} /> Right</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyFull"); setAlignOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors"><AlignJustify size={14} /> Justify</button>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          <button type="button" className="flex items-center gap-1 p-1.5 text-white/60 hover:text-white hover:bg-white/8 rounded transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <ChevronDown size={11} />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          <button type="button" className="flex items-center gap-1 p-1.5 text-white/60 hover:text-white hover:bg-white/8 rounded transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <ChevronDown size={11} />
          </button>
        </div>

        {/* Content editable — fills remaining space, scrolls internally */}
        {isLoading ? (
          <div className="flex-1 p-6 flex items-center justify-center text-white/30 text-sm">Loading…</div>
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onClick={() => { setAlignOpen(false); setFontOpen(false); setSizeOpen(false); }}
            className="flex-1 overflow-y-auto p-6 text-sm text-white/80 outline-none leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_p]:mb-3 [&_strong]:text-white [&_b]:text-white"
          />
        )}
      </div>

      {/* Save button — shrink-0 so it never gets pushed out */}
      <div className="shrink-0 flex justify-end py-4">
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="px-10 py-3 rounded-full bg-[#ff4d00] text-white text-sm font-medium hover:bg-[#e84400] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {(alignOpen || fontOpen || sizeOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setAlignOpen(false); setFontOpen(false); setSizeOpen(false); }} />
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function PagesPage() {
  const [tab, setTab] = useState<PageTab>("privacy");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Sticky header — title + tabs */}
      <div className="shrink-0 px-6 pt-6 bg-[#0f0f0f]">
        <h1 className="text-2xl font-semibold text-white mb-6">Policy Pages</h1>
        <div className="flex border-b border-white/10">
          {(Object.keys(TAB_LABELS) as PageTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-1 pb-3 mr-6 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-[#ff4d00] text-[#ff4d00]"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable editor area */}
      <div className="flex-1 min-h-0 px-6 pt-6 flex flex-col">
        {(Object.keys(TAB_LABELS) as PageTab[]).map((t) => (
          <div key={t} className={`${t === tab ? "flex" : "hidden"} flex-col flex-1 min-h-0`}>
            <PolicyEditor tab={t} />
          </div>
        ))}
      </div>
    </div>
  );
}
