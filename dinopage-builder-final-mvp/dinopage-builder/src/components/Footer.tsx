import { prisma } from "@/lib/db"
import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react"

// 아이콘 매핑
const iconMap: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
}

export default async function Footer() {
  const settings = await prisma.setting.findMany()
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string | null>)

  const socialLinks = settingsMap.social_links 
    ? JSON.parse(settingsMap.social_links) 
    : []

  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* 푸터 콘텐츠 (간단한 텍스트 렌더링) */}
          <div className="text-sm text-gray-600">
            {settingsMap.footer_content || "© 2026 All rights reserved."}
          </div>

          {/* 소셜 아이콘 */}
          <div className="flex gap-4">
            {socialLinks.map((link: any, index: number) => {
              const Icon = iconMap[link.platform]
              if (!Icon) return null
              
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <Icon size={20} />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}