import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // 입력값 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    // 이메일 중복 검사
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        // Note: NextAuth credentials provider는 별도로 비밀번호를 저장하지 않음
        // 실제 구현시 Credentials provider를 확장하거나 별도 로직 필요
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}