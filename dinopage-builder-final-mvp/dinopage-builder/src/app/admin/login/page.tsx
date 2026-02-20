"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin",
      })

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다")
      } else {
        window.location.href = result?.url || "/admin"
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">🦖 DinoPage</h1>
          <p className="text-gray-500 mt-2">관리자 로그인</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link href="/admin/register" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-400 text-center">
            소셜 로그인
          </p>
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => signIn("github", { callbackUrl: "/admin" })}
              className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-800"
            >
              GitHub
            </button>
            <button
              onClick={() => signIn("google", { callbackUrl: "/admin" })}
              className="flex-1 bg-white border text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}