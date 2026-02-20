import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// PUT /api/menus/[id] - 메뉴 수정
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
    const { name, type, pageId, customUrl, isActive, sortOrder } = body

    const menu = await prisma.menu.update({
      where: { id: params.id },
      data: {
        name,
        type,
        pageId,
        customUrl,
        isActive,
        sortOrder,
      },
    })

    return NextResponse.json(menu)
  } catch (error) {
    return NextResponse.json(
      { error: "메뉴 수정에 실패했습니다" },
      { status: 500 }
    )
  }
}

// DELETE /api/menus/[id] - 메뉴 삭제
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.menu.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "메뉴 삭제에 실패했습니다" },
      { status: 500 }
    )
  }
}