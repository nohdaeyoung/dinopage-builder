import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-lg">🦖 DinoPage Builder</h1>
          <div className="flex gap-4">
            <a href="/admin" className="text-sm hover:text-blue-600">대시보드</a>
            <a href="/admin/pages" className="text-sm hover:text-blue-600">페이지</a>
            <a href="/admin/menus" className="text-sm hover:text-blue-600">메뉴</a>
            <a href="/admin/settings" className="text-sm hover:text-blue-600">설정</a>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto">{children}</main>
    </div>
  )
}