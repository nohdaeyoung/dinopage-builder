import Link from "next/link"
import { prisma } from "@/lib/db"

export default async function Header() {
  // 활성화된 메뉴 가져오기 (정렬 순서대로)
  const menus = await prisma.menu.findMany({
    where: { isActive: true, parentId: null },
    include: {
      page: { select: { slug: true } }, // 연결된 페이지 슬러그 가져오기
    },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          🦖 My Website
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex gap-6">
          {menus.map((menu) => {
            // 링크 URL 결정 (페이지 연결 vs 커스텀 URL)
            const href = menu.type === "PAGE" && menu.page 
              ? `/pages/${menu.page.slug}` 
              : menu.customUrl || "#"

            return (
              <Link
                key={menu.id}
                href={href}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                target={menu.type === "CUSTOM" ? "_blank" : undefined}
              >
                {menu.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}