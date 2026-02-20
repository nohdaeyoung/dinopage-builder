import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// GET /api/menus - 메뉴 목록 조회 (계층 구조)
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(menus)
  } catch (error) {
    return NextResponse.json(
      { error: "메뉴 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

// POST /api/menus - 메뉴 생성
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, type, pageId, customUrl, parentId } = body

    // 현재 최대 sortOrder 구하기
    const maxOrder = await prisma.menu.aggregate({
      where: { parentId: parentId || null },
      _max: { sortOrder: true },
    })

    const menu = await prisma.menu.create({
      data: {
        name,
        type,
        pageId,
        customUrl,
        parentId: parentId || null,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
      include: {
        children: true,
      },
    })

    return NextResponse.json(menu)
  } catch (error) {
    return NextResponse.json(
      { error: "메뉴 생성에 실패했습니다" },
      { status: 500 }
    )
  }
}