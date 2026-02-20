import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// GET /api/pages/[id] - 페이지 상세 조회
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
    })

    if (!page) {
      return NextResponse.json(
        { error: "페이지를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    return NextResponse.json(
      { error: "페이지를 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

// PUT /api/pages/[id] - 페이지 수정
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, slug, metaDescription, content, isPublished, isHomepage } = body

    // 슬러그 중복 검사 (자신 제외)
    if (slug) {
      const existing = await prisma.page.findFirst({
        where: { slug, id: { not: params.id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: "이미 존재하는 URL입니다" },
          { status: 400 }
        )
      }
    }

    // 메인 페이지 설정 시 다른 페이지 해제
    if (isHomepage) {
      await prisma.page.updateMany({
        where: { isHomepage: true },
        data: { isHomepage: false },
      })
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        metaDescription,
        content,
        contentHtml: content,
        isPublished,
        isHomepage,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    return NextResponse.json(
      { error: "페이지 수정에 실패했습니다" },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id] - 페이지 삭제
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.page.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "페이지 삭제에 실패했습니다" },
      { status: 500 }
    )
  }
}