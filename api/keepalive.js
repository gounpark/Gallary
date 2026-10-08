// Vercel Cron이 하루 한 번 호출 (vercel.json "crons" 참고).
// Supabase 무료 플랜의 7일 비활성 정지를 막기 위해 실제 DB 쓰기를 한 번 한다.
// GitHub Actions 스케줄은 저장소에 60일간 커밋이 없으면 꺼지기 때문에, 꺼지지 않는 백업 경로.

export async function GET(request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('keepalive: Supabase env vars missing')
    return Response.json({ ok: false, error: 'missing env' }, { status: 500 })
  }

  // share_links에 id='__keepalive__' 행 하나만 계속 덮어쓴다(앱 화면에는 나타나지 않음).
  const res = await fetch(`${url}/rest/v1/share_links?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: '__keepalive__',
      type: 'keepalive',
      target_id: '__keepalive__',
      label: 'vercel cron keepalive',
      created_at: new Date().toISOString(),
    }),
  })

  const body = res.ok ? '' : await res.text()
  if (!res.ok) console.error(`keepalive: Supabase ${res.status} ${body}`)
  return Response.json({ ok: res.ok, status: res.status }, { status: res.ok ? 200 : 502 })
}
