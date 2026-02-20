"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Page {
  id: string
  title: string
  slug: string
}

export default function NewMenu() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "PAGE", // PAGE or CUSTOM
    pageId: "",
    customUrl: "",
  })

  useEffect(() => {
    // 연결할 페이지 목록 불러오기
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => setPages(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("메뉴 생성 실패")
      
      router.push("/admin/menus")
      router.refresh()
    } catch (error) {
      alert("메뉴를 만들지 못했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/menus" className="text-gray-500 hover:text-gray-700">
          ← 메뉴 설정
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">새 메뉴 추가</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-6">
        {/* 메뉴 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메뉴 이름
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="예: 회사 소개"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* 연결 타입 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연결 대상
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="PAGE"
                checked={formData.type === "PAGE"}
                onChange={(e) => setFormData({ ...formData, type: "PAGE" })}
                className="w-4 h-4 text-blue-600"
              />
              <span>페이지 연결</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="CUSTOM"
                checked={formData.type === "CUSTOM"}
                onChange={(e) => setFormData({ ...formData, type: "CUSTOM" })}
                className="w-4 h-4 text-blue-600"
              />
              <span>직접 입력 (외부 링크)</span>
            </label>
          </div>
        </div>

        {/* 페이지 선택 (PAGE 타입일 때) */}
        {formData.type === "PAGE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연결할 페이지
            </label>
            <select
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.pageId}
              onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
            >
              <option value="">페이지를 선택하세요</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title} (/{page.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* URL 입력 (CUSTOM 타입일 때) */}
        {formData.type === "CUSTOM" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL 입력
            </label>
            <input
              type="url"
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="https://example.com"
              value={formData.customUrl}
              onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
            />
          </div>
        )}

        {/* 버튼 */}
        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "추가 중..." : "메뉴 추가하기"}
          </button>
          <Link
            href="/admin/menus"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}