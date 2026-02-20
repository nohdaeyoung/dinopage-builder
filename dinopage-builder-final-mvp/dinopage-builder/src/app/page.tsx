import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function Home() {
  // 메인 페이지 찾기
  const homepage = await prisma.page.findFirst({
    where: { isHomepage: true, isPublished: true },
  })

  if (homepage) {
    redirect(`/pages/${homepage.slug}`)
  }

  // 메인 페이지가 없으면 첫 번째 공개 페이지로
  const firstPage = await prisma.page.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  })

  if (firstPage) {
    redirect(`/pages/${firstPage.slug}`)
  }

  // 페이지가 하나도 없으면 관리자 안내
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">🦖 DinoPage Builder</h1>
        <p className="text-gray-600 mb-6">아직 페이지가 없습니다.</p>
        <a
          href="/admin"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          관리자 페이지로 이동
        </a>
      </div>
    </div>
  )
}