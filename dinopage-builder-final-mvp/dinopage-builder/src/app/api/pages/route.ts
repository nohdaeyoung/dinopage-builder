import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// GET /api/pages - 페이지 목록 조회
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(pages)
  } catch (error) {
    return NextResponse.json(
      { error: "페이지 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

// POST /api/pages - 페이지 생성
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, slug, metaDescription, content, template } = body

    // 슬러그 중복 검사
    const existing = await prisma.page.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "이미 존재하는 URL입니다" },
        { status: 400 }
      )
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        metaDescription,
        content,
        contentHtml: content, // TODO: 마크다운 → HTML 변환
        template: template || "default",
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    return NextResponse.json(
      { error: "페이지 생성에 실패했습니다" },
      { status: 500 }
    )
  }
}