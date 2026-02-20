"use client"

import { useState, useEffect } from "react"

export default function DomainPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [domain, setDomain] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)
  const [inputDomain, setInputDomain] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchDomain()
  }, [])

  const fetchDomain = async () => {
    try {
      const res = await fetch("/api/domain")
      const data = await res.json()
      setDomain(data.domain)
      setStatus(data.status)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: inputDomain }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      await fetchDomain()
      setInputDomain("")
    } catch (error: any) {
      alert(error.message || "도메인 추가 실패")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveDomain = async () => {
    if (!confirm("정말 도메인 연결을 해제하시겠습니까?")) return
    setIsSaving(true)
    try {
      await fetch("/api/domain", { method: "DELETE" })
      setDomain(null)
      setStatus(null)
    } catch (error) {
      alert("도메인 삭제 실패")
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerify = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/domain", { method: "PUT" })
      await fetchDomain()
      alert("도메인 상태를 갱신했습니다")
    } catch (error) {
      alert("검증 실패")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="p-8">로딩 중...</div>

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">도메인 설정</h1>

      {!domain ? (
        // 도메인 없을 때: 추가 폼
        <div className="bg-white p-8 rounded-lg border shadow-sm text-center">
          <h2 className="text-lg font-semibold mb-2">개인 도메인 연결</h2>
          <p className="text-gray-500 mb-6">
            사용 중인 도메인(예: example.com)을 연결하세요.
          </p>
          <form onSubmit={handleAddDomain} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              placeholder="example.com"
              className="flex-1 px-4 py-2 border rounded-lg"
              value={inputDomain}
              onChange={(e) => setInputDomain(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSaving}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? "추가 중..." : "추가"}
            </button>
          </form>
        </div>
      ) : (
        // 도메인 있을 때: 상태 표시
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{domain}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  status?.verified ? "bg-green-500" : "bg-yellow-500"
                }`} />
                <span className="text-sm text-gray-600">
                  {status?.verified ? "연결됨 (SSL 활성)" : "DNS 설정 대기 중"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleVerify}
                disabled={isSaving}
                className="bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                🔄 새로고침
              </button>
              <button
                onClick={handleRemoveDomain}
                disabled={isSaving}
                className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-sm hover:bg-red-100"
              >
                연결 해제
              </button>
            </div>
          </div>

          {/* DNS 설정 가이드 */}
          {!status?.verified && (
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ DNS 설정이 필요합니다</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  도메인 구입처(가비아, 호스팅케이알 등)에서 아래 DNS 레코드를 추가해주세요.
                </p>
                
                <div className="bg-white rounded border p-4 text-sm font-mono">
                  <div className="grid grid-cols-3 gap-4 mb-2 pb-2 border-b text-gray-500">
                    <div>Type</div>
                    <div>Name</div>
                    <div>Value</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>A</div>
                    <div>@</div>
                    <div>76.76.21.21</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>CNAME</div>
                    <div>www</div>
                    <div>cname.vercel-dns.com</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}