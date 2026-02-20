// Vercel API 설정
const VERCEL_API_URL = "https://api.vercel.com"
const TEAM_ID = process.env.VERCEL_TEAM_ID // 팀 프로젝트인 경우 필요

// 공통 헤더
const headers = {
  Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
  "Content-Type": "application/json",
}

// 1. 프로젝트에 도메인 추가
export async function addDomainToProject(domain: string) {
  const url = `${VERCEL_API_URL}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains${
    TEAM_ID ? `?teamId=${TEAM_ID}` : ""
  }`

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: domain }),
  })

  return res.json()
}

// 2. 도메인 삭제
export async function removeDomainFromProject(domain: string) {
  const url = `${VERCEL_API_URL}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}${
    TEAM_ID ? `?teamId=${TEAM_ID}` : ""
  }`

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  })

  return res.json()
}

// 3. 도메인 설정 확인 (DNS 상태 등)
export async function getDomainStatus(domain: string) {
  const url = `${VERCEL_API_URL}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}${
    TEAM_ID ? `?teamId=${TEAM_ID}` : ""
  }`

  const res = await fetch(url, {
    method: "GET",
    headers,
  })

  return res.json()
}

// 4. 도메인 소유권 확인 (Verify)
export async function verifyDomain(domain: string) {
  const url = `${VERCEL_API_URL}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/verify${
    TEAM_ID ? `?teamId=${TEAM_ID}` : ""
  }`

  const res = await fetch(url, {
    method: "POST",
    headers,
  })

  return res.json()
}