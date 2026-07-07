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
} from "lucide-react";

type PageTab = "privacy" | "terms" | "about";

const TAB_LABELS: Record<PageTab, string> = {
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  about: "About this app",
};

const INITIAL_CONTENT: Record<PageTab, string> = {
  privacy: `<p><strong>Effective Date: January 2026</strong></p><p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our application.</p><p><strong>Information We Collect</strong></p><p>When you use our app, we may collect certain information such as:</p><ul><li>Your name, email address, and profile information</li><li>Content you create, including posts, photos, videos, and comments</li><li>Location data when you choose to tag a food place</li><li>Device information and usage activity to improve app performance</li></ul><p><strong>How We Use Your Information</strong></p><p>We use the collected information to:</p><ul><li>Provide and improve our services</li><li>Allow users to create and share content</li><li>Show relevant food locations and posts</li><li>Send notifications about likes, comments, and updates</li><li>Maintain the security of the platform</li></ul>`,
  terms: `<p><strong>Effective Date: January 2026</strong></p><p>By using this application, you agree to the following terms and conditions.</p><p><strong>User Accounts</strong></p><p>Users are responsible for maintaining the confidentiality of their account information. You must not share your login credentials with others.</p><p><strong>User Content</strong></p><p>Users may post photos, videos, reviews, and comments related to food experiences. By posting content, you confirm that:</p><ul><li>The content does not violate any laws</li><li>The content does not contain harmful, offensive, or misleading information</li><li>You own or have permission to share the content</li></ul><p><strong>Prohibited Activities</strong></p><p>Users must not:</p><ul><li>Post inappropriate or harmful content</li><li>Harass or abuse other users</li><li>Use the app for spam or fraudulent purposes</li></ul>`,
  about: `<p>This app is designed for food lovers and food explorers who enjoy discovering and sharing great food experiences.</p><p>Users can share food photos, reviews, and recommendations while discovering restaurants, cafés, street food, and hidden gems through an interactive map and community-driven content.</p><p>Our goal is to create a friendly space where people can explore new food places, share honest experiences, and connect with others who love food.</p><p>Whether you're looking for trending restaurants, street food spots, or honest food reviews, this app helps you discover the best places around you.</p>`,
};

// ─── Toolbar helpers ───────────────────────────────────────────────────────────
function TBtn({
  onCmd,
  title,
  active,
  children,
}: {
  onCmd: () => void;
  title?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onCmd();
      }}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/8"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function PagesPage() {
  const [tab, setTab] = useState<PageTab>("privacy");
  const [alignOpen, setAlignOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState("Inter");
  const [currentSize, setCurrentSize] = useState("16");

  const editorRef = useRef<HTMLDivElement>(null);
  const savedContent = useRef<Record<PageTab, string>>({ ...INITIAL_CONTENT });

  // Load content when tab changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = savedContent.current[tab];
    }
  }, [tab]);

  const switchTab = (next: PageTab) => {
    if (editorRef.current) {
      savedContent.current[tab] = editorRef.current.innerHTML;
    }
    setTab(next);
    setAlignOpen(false);
    setFontOpen(false);
    setSizeOpen(false);
  };

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
    // execCommand fontSize uses 1–7, map our px sizes
    const sizeMap: Record<string, string> = { "12": "1", "14": "2", "16": "3", "18": "4", "20": "5", "24": "6", "32": "7" };
    exec("fontSize", sizeMap[size] ?? "3");
    setSizeOpen(false);
  };

  const FONTS = ["Inter", "Arial", "Georgia", "Courier New", "Trebuchet MS"];
  const SIZES = ["12", "14", "16", "18", "20", "24", "32"];

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold text-white mb-6">Policy Pages</h1>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        {(Object.keys(TAB_LABELS) as PageTab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
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

      {/* Editor card */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-visible">
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
                  <button
                    key={f}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFont(f); }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors"
                    style={{ fontFamily: f }}
                  >
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
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applySize(s); }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/8 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          {/* Bold / Italic / Underline */}
          <TBtn onCmd={() => exec("bold")} title="Bold"><Bold size={14} /></TBtn>
          <TBtn onCmd={() => exec("italic")} title="Italic"><Italic size={14} /></TBtn>
          <TBtn onCmd={() => exec("underline")} title="Underline"><Underline size={14} /></TBtn>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          {/* Indent / Outdent */}
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
              <AlignLeft size={14} />
              <ChevronDown size={11} />
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

          {/* Line height (display only) */}
          <button type="button" className="flex items-center gap-1 p-1.5 text-white/60 hover:text-white hover:bg-white/8 rounded transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <ChevronDown size={11} />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          {/* More options (display only) */}
          <button type="button" className="flex items-center gap-1 p-1.5 text-white/60 hover:text-white hover:bg-white/8 rounded transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <ChevronDown size={11} />
          </button>
        </div>

        {/* Content editable area */}
        <div
          key={tab}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onClick={() => { setAlignOpen(false); setFontOpen(false); setSizeOpen(false); }}
          className="min-h-96 p-6 text-sm text-white/80 outline-none leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_p]:mb-3 [&_strong]:text-white [&_b]:text-white"
        />
      </div>

      {/* Save Changes */}
      <div className="flex justify-end mt-6">
        <button className="px-10 py-3 rounded-full bg-[#ff4d00] text-white text-sm font-medium hover:bg-[#e84400] transition-colors">
          Save Changes
        </button>
      </div>

      {/* Close dropdowns on outside click */}
      {(alignOpen || fontOpen || sizeOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setAlignOpen(false); setFontOpen(false); setSizeOpen(false); }} />
      )}
    </div>
  );
}
