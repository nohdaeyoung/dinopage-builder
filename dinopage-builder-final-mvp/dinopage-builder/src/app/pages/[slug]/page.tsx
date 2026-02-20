import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

interface PageProps {
  params: { slug: string }
}

export default async function PublicPage({ params }: PageProps) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  })

  if (!page || !page.isPublished) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="text-lg font-bold">
            My Website
          </a>
        </div>
      </header>

      {/* 페이지 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        {page.metaDescription && (
          <p className="text-gray-600 mb-8 text-lg">{page.metaDescription}</p>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.contentHtml || "" }}
        />
      </main>

      {/* 푸터 */}
      <footer className="border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
          © 2026 All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })

  return pages.map((page) => ({
    slug: page.slug,
  }))
}