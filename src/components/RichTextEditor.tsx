"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, List, ListOrdered, Heading2, Image as ImageIcon,
  Link as LinkIcon, Undo2, Redo2
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "เขียนเนื้อหา..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("URL รูปภาพ:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-2 hover:bg-gray-200 rounded" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="p-2 hover:bg-gray-200 rounded" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <div className="border-l border-gray-300"></div>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="p-2 hover:bg-gray-200 rounded" title="Heading">
          <Heading2 className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 hover:bg-gray-200 rounded" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-2 hover:bg-gray-200 rounded" title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="border-l border-gray-300"></div>
        <button onClick={addImage} className="p-2 hover:bg-gray-200 rounded" title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button onClick={() => {
          const url = window.prompt("URL ลิงค์:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} className="p-2 hover:bg-gray-200 rounded" title="Add Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="border-l border-gray-300"></div>
        <button onClick={() => editor.chain().focus().undo().run()} className="p-2 hover:bg-gray-200 rounded" title="Undo">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className="p-2 hover:bg-gray-200 rounded" title="Redo">
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-64 focus:outline-none [&_.ProseMirror]:focus:outline-none"
      />
    </div>
  );
}
