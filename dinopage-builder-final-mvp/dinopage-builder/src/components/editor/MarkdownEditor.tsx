"use client"

import { useEffect, useRef, useState } from "react"
import { Editor } from "@toast-ui/react-editor"
import "@toast-ui/editor/dist/toastui-editor.css"

interface MarkdownEditorProps {
  initialValue?: string
  onChange: (markdown: string, html: string) => void
}

export function MarkdownEditor({ initialValue = "", onChange }: MarkdownEditorProps) {
  const editorRef = useRef<Editor>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = () => {
    if (editorRef.current) {
      const editorInstance = editorRef.current.getInstance()
      const markdown = editorInstance.getMarkdown()
      const html = editorInstance.getHTML()
      onChange(markdown, html)
    }
  }

  if (!mounted) {
    return <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" />
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        ref={editorRef}
        initialValue={initialValue}
        initialEditType="markdown"
        previewStyle="vertical"
        height="400px"
        useCommandShortcut={true}
        onChange={handleChange}
        toolbarItems={[
          ["heading", "bold", "italic", "strike"],
          ["hr", "quote"],
          ["ul", "ol", "task", "indent", "outdent"],
          ["table", "image", "link"],
          ["code", "codeblock"],
        ]}
        language="ko-KR"
      />
    </div>
  )
}