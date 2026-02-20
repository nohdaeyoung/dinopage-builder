import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function AdminDashboard() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    take: 10,
  })

  const totalPages = await prisma.page.count()
  const publishedPages = await prisma.page.count({ where: { isPublished: true } })
  const homepage = await prisma.page.findFirst({ where: { isHomepage: true } })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-500 text-sm">전체 페이지</p>
          <p className="text-3xl font-bold">{totalPages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-500 text-sm">공개 페이지</p>
          <p className="text-3xl font-bold">{publishedPages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-500 text-sm">메인 페이지</p>
          <p className="text-3xl font-bold">{homepage ? "1" : "0"}</p>
        </div>
      </div>

      {/* 페이지 목록 */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">최근 페이지</h2>
          <Link
            href="/admin/pages/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + 새 페이지 만들기
          </Link>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">페이지명</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">URL</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">생성일</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">수정일</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">상태</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t">
                <td className="p-4">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {page.title}
                    {page.isHomepage && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        메인
                      </span>
                    )}
                  </Link>
                </td>
                <td className="p-4 text-sm text-gray-500">/{page.slug}</td>
                <td className="p-4 text-sm text-gray-500">
                  {page.createdAt.toLocaleDateString("ko-KR")}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {page.updatedAt.toLocaleDateString("ko-KR")}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      page.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {page.isPublished ? "공개" : "비공개"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}