"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MarkdownEditor } from "@/components/editor/MarkdownEditor"

export default function NewPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    metaDescription: "",
    content: "",
    contentHtml: "",
    template: "default",
    isPublished: false,
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }))
  }

  const handleEditorChange = (markdown: string, html: string) => {
    setFormData((prev) => ({
      ...prev,
      content: markdown,
      contentHtml: html,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "페이지 생성에 실패했습니다")
      }

      router.push("/admin")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
          ← 대시보드
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">새 페이지 만들기</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg border p-6 mb-6">
          {/* 제목 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              페이지 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="페이지 제목을 입력하세요"
              required
            />
          </div>

          {/* 슬러그 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL 슬러그 *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="page-url"
                required
                pattern="[a-z0-9-]+"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              영문, 숫자, 하이픈(-)만 사용 가능합니다
            </p>
          </div>

          {/* 메타 설명 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메타 설명 (SEO)
            </label>
            <input
              type="text"
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="검색 결과에 표시될 설명을 입력하세요"
              maxLength={160}
            />
          </div>

          {/* 템플릿 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              템플릿
            </label>
            <select
              value={formData.template}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, template: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">기본</option>
              <option value="full-width">전체 너비</option>
              <option value="sidebar">사이드바</option>
            </select>
          </div>

          {/* 공개 여부 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
              페이지 공개하기
            </label>
          </div>
        </div>

        {/* 콘텐츠 에디터 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            페이지 콘텐츠 (마크다운)
          </label>
          <MarkdownEditor
            initialValue={formData.content}
            onChange={handleEditorChange}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "저장 중..." : "페이지 만들기"}
          </button>
          <Link
            href="/admin"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}