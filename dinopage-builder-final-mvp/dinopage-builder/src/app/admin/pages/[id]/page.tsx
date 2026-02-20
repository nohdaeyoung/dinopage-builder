"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MarkdownEditor } from "@/components/editor/MarkdownEditor"

interface PageData {
  id: string
  title: string
  slug: string
  metaDescription: string | null
  content: string | null
  template: string
  isPublished: boolean
  isHomepage: boolean
}

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<PageData | null>(null)

  useEffect(() => {
    fetchPage()
  }, [])

  const fetchPage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/pages/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "페이지를 불러오는데 실패했습니다")
      }

      setFormData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditorChange = (markdown: string, html: string) => {
    if (formData) {
      setFormData({ ...formData, content: markdown })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/pages/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          metaDescription: formData.metaDescription,
          content: formData.content,
          template: formData.template,
          isPublished: formData.isPublished,
          isHomepage: formData.isHomepage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "페이지 수정에 실패했습니다")
      }

      router.push("/admin")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("정말로 이 페이지를 삭제하시겠습니까?")) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/pages/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "페이지 삭제에 실패했습니다")
      }

      router.push("/admin")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">페이지를 찾을 수 없습니다</p>
          <Link href="/admin" className="text-blue-600 hover:underline mt-2 inline-block">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            ← 대시보드
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold">페이지 수정</h1>
        </div>
        <div className="flex gap-2">
          <a
            href={`/pages/${formData.slug}`}
            target="_blank"
            className="text-gray-600 hover:text-gray-800 px-4 py-2 border rounded-lg"
          >
            미리보기 ↗
          </a>
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="text-red-600 hover:text-red-800 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50"
          >
            삭제
          </button>
        </div>
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
              onChange={(e) =>
                setFormData((prev) => prev && { ...prev, title: e.target.value })
              }
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
                  setFormData((prev) => prev && { ...prev, slug: e.target.value })
                }
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="page-url"
                required
                pattern="[a-z0-9-]+"
              />
            </div>
          </div>

          {/* 메타 설명 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메타 설명 (SEO)
            </label>
            <input
              type="text"
              value={formData.metaDescription || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev && { ...prev, metaDescription: e.target.value }
                )
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
                setFormData((prev) =>
                  prev && { ...prev, template: e.target.value }
                )
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">기본</option>
              <option value="full-width">전체 너비</option>
              <option value="sidebar">사이드바</option>
            </select>
          </div>

          {/* 체크박스 그룹 */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData(
                    (prev) => prev && { ...prev, isPublished: e.target.checked }
                  )
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                페이지 공개하기
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isHomepage"
                checked={formData.isHomepage}
                onChange={(e) =>
                  setFormData(
                    (prev) => prev && { ...prev, isHomepage: e.target.checked }
                  )
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isHomepage" className="text-sm font-medium text-gray-700">
                메인 페이지로 설정
              </label>
            </div>
          </div>
        </div>

        {/* 콘텐츠 에디터 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            페이지 콘텐츠 (마크다운)
          </label>
          <MarkdownEditor
            initialValue={formData.content || ""}
            onChange={handleEditorChange}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "저장 중..." : "변경사항 저장"}
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