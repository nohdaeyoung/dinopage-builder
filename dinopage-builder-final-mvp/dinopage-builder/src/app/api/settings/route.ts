import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// GET /api/settings - 모든 설정 조회
export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    // 배열을 객체로 변환 ({ key: value })
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string | null>)

    return NextResponse.json(settingsMap)
  } catch (error) {
    return NextResponse.json(
      { error: "설정을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

// POST /api/settings - 설정 저장 (일괄 업데이트)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    // body: { site_title: "...", footer_content: "...", ... }

    // 트랜잭션으로 여러 설정 upsert (없으면 생성, 있으면 수정)
    await prisma.$transaction(
      Object.entries(body).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "설정 저장에 실패했습니다" },
      { status: 500 }
    )
  }
}