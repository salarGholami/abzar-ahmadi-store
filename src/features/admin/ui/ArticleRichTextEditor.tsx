"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { AlignCenter, AlignRight, Bold, Code, Heading2, Heading3, Highlighter, Italic, Link2, List, ListOrdered, Palette, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2 } from "lucide-react";

const tools = [
  { label: "ضخیم", icon: Bold, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleBold().run(), active: "bold" },
  { label: "مورب", icon: Italic, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleItalic().run(), active: "italic" },
  { label: "زیرخط", icon: UnderlineIcon, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleUnderline().run(), active: "underline" },
  { label: "خط‌خورده", icon: Strikethrough, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleStrike().run(), active: "strike" },
  { label: "تیتر ۲", icon: Heading2, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: "heading2" },
  { label: "تیتر ۳", icon: Heading3, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: "heading3" },
  { label: "لیست", icon: List, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleBulletList().run(), active: "bulletList" },
  { label: "شماره‌ای", icon: ListOrdered, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleOrderedList().run(), active: "orderedList" },
  { label: "نقل‌قول", icon: Quote, run: (editor: NonNullable<ReturnType<typeof useEditor>>) => editor.chain().focus().toggleBlockquote().run(), active: "blockquote" },
];

export default function ArticleRichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
    ],
    content: value || "<p></p>",
    editorProps: { attributes: { dir: "rtl", class: "article-editor-content focus:outline-none" } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return <div className="min-h-72 animate-pulse rounded-xl bg-[var(--surface-2)]" />;

  const actionButton = (label: string, Icon: typeof Bold, onClick: () => void, active = false) => (
    <button key={label} type="button" title={label} aria-label={label} onClick={onClick} className={`inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2 text-xs transition ${active ? "bg-[var(--primary)] text-[#10242a]" : "text-[var(--text)] hover:bg-[var(--surface-2)]"}`}><Icon size={16}/><span className="hidden 2xl:inline">{label}</span></button>
  );

  return <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] p-2">
      {tools.map(({ label, icon: Icon, run, active }) => actionButton(label, Icon, () => run(editor), active === "heading2" ? editor.isActive("heading", { level: 2 }) : active === "heading3" ? editor.isActive("heading", { level: 3 }) : editor.isActive(active)))}
      <span className="mx-1 h-6 w-px bg-[var(--border)]" />
      {actionButton("بازگشت", Undo2, () => editor.chain().focus().undo().run())}
      {actionButton("تکرار", Redo2, () => editor.chain().focus().redo().run())}
      {actionButton("وسط‌چین", AlignCenter, () => editor.chain().focus().updateAttributes("paragraph", { style: "text-align: center" }).run())}
      {actionButton("راست‌چین", AlignRight, () => editor.chain().focus().updateAttributes("paragraph", { style: "text-align: right" }).run())}
      {actionButton("هایلایت", Highlighter, () => editor.chain().focus().toggleHighlight({ color: "#fff0a8" }).run(), editor.isActive("highlight"))}
      <label title="رنگ متن" className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs hover:bg-[var(--surface-2)]"><Palette size={16}/><input aria-label="رنگ متن انتخاب‌شده" type="color" defaultValue="#00adb5" className="size-5 cursor-pointer border-0 bg-transparent p-0" onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} /></label>
      <label title="رنگ پس‌زمینه متن" className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs hover:bg-[var(--surface-2)]"><Highlighter size={16}/><input aria-label="رنگ هایلایت" type="color" defaultValue="#fff0a8" className="size-5 cursor-pointer border-0 bg-transparent p-0" onChange={(event) => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()} /></label>
      {actionButton("لینک", Link2, () => { const previous = editor.getAttributes("link").href as string | undefined; const href = window.prompt("آدرس کامل لینک را وارد کنید", previous || "https://"); if (href === null) return; if (!href.trim()) editor.chain().focus().unsetLink().run(); else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run(); }, editor.isActive("link"))}
      {actionButton("کد", Code, () => editor.chain().focus().toggleCode().run(), editor.isActive("code"))}
    </div>
    <EditorContent editor={editor} />
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] px-4 py-2 text-[10px] text-[var(--muted)]"><span>ویرایشگر بلوکی با فرمت‌بندی متن، رنگ، لینک، تیتر، فهرست و نقل‌قول</span><span>{editor.getText().length.toLocaleString("fa-IR")} نویسه</span></div>
  </div>;
}
