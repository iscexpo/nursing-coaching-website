import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/site-data'

export const alt = SITE.nameBn
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #0056D2 0%, #003a8c 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 32, opacity: 0.85, letterSpacing: 2 }}>
        KHULNA · BANGLADESH
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          marginTop: 16,
          lineHeight: 1.1,
        }}
      >
        {SITE.name}
      </div>
      <div style={{ fontSize: 34, marginTop: 24, opacity: 0.9 }}>
        Nursing Admission Coaching
      </div>
      <div style={{ fontSize: 26, marginTop: 12, opacity: 0.75 }}>
        BNMC · B.Sc Nursing · Post Basic · Job Preparation
      </div>
    </div>,
    { ...size },
  )
}
