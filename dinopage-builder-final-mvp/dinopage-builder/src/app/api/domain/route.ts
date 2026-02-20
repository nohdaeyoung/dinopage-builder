import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { addDomainToProject, removeDomainFromProject, getDomainStatus, verifyDomain } from "@/lib/vercel"

// GET /api/domain - 도메인 상태 조회
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "custom_domain" },
    })

    if (!setting?.value) {
      return NextResponse.json({ domain: null })
    }

    // Vercel에서 최신 상태 조회
    const status = await getDomainStatus(setting.value)
    return NextResponse.json({ domain: setting.value, status })
  } catch (error) {
    return NextResponse.json(
      { error: "도메인 정보를 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

// POST /api/domain - 도메인 추가
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { domain } = await req.json()

    // 1. Vercel 프로젝트에 추가
    const vercelRes = await addDomainToProject(domain)
    if (vercelRes.error) {
      return NextResponse.json({ error: vercelRes.error.message }, { status: 400 })
    }

    // 2. DB에 저장
    await prisma.setting.upsert({
      where: { key: "custom_domain" },
      update: { value: domain },
      create: { key: "custom_domain", value: domain },
    })

    return NextResponse.json(vercelRes)
  } catch (error) {
    return NextResponse.json(
      { error: "도메인 추가에 실패했습니다" },
      { status: 500 }
    )
  }
}

// DELETE /api/domain - 도메인 삭제
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const setting = await prisma.setting.findUnique({
      where: { key: "custom_domain" },
    })

    if (setting?.value) {
      // Vercel에서 삭제
      await removeDomainFromProject(setting.value)
      // DB에서 삭제
      await prisma.setting.delete({ where: { key: "custom_domain" } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "도메인 삭제에 실패했습니다" },
      { status: 500 }
    )
  }
}

// PUT /api/domain - 도메인 재검증 (Verify)
export async function PUT() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "custom_domain" },
    })

    if (!setting?.value) {
      return NextResponse.json({ error: "설정된 도메인이 없습니다" }, { status: 404 })
    }

    const status = await verifyDomain(setting.value)
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      { error: "도메인 검증에 실패했습니다" },
      { status: 500 }
    )
  }
}