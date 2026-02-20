"use client"

import { useState, useEffect } from "react"
import { MarkdownEditor } from "@/components/editor/MarkdownEditor"

interface SocialLink {
  platform: string
  url: string
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_title: "",
    site_description: "",
    footer_content: "",
    social_links: "[]", // JSON string
  })

  // 소셜 링크 파싱
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings((prev) => ({ ...prev, ...data }))
      
      if (data.social_links) {
        setSocialLinks(JSON.parse(data.social_links))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...settings,
        social_links: JSON.stringify(socialLinks),
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("저장 실패")
      alert("설정이 저장되었습니다")
    } catch (error) {
      alert("저장 중 오류가 발생했습니다")
    } finally {
      setIsSaving(false)
    }
  }

  // 소셜 링크 관리
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "instagram", url: "" }])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...socialLinks]
    newLinks[index][field] = value
    setSocialLinks(newLinks)
  }

  if (isLoading) return <div className="p-8">로딩 중...</div>

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">사이트 설정</h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 기본 정보 */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이트 제목
              </label>
              <input
                type="text"
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="내 홈페이지"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이트 설명
              </label>
              <input
                type="text"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="간단한 소개글"
              />
            </div>
          </div>
        </div>

        {/* 소셜 미디어 */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">소셜 미디어 링크</h2>
            <button
              type="button"
              onClick={addSocialLink}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 추가하기
            </button>
          </div>
          
          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-3">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                  className="w-32 px-3 py-2 border rounded-lg"
                >
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  🗑️
                </button>
              </div>
            ))}
            {socialLinks.length === 0 && (
              <p className="text-gray-500 text-sm">등록된 소셜 링크가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 푸터 설정 */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">푸터(Footer) 내용</h2>
          <MarkdownEditor
            initialValue={settings.footer_content}
            onChange={(markdown) => setSettings({ ...settings, footer_content: markdown })}
          />
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "설정 저장하기"}
          </button>
        </div>
      </form>
    </div>
  )
}