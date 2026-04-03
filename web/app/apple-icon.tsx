import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: '#734e97',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 124,
          fontWeight: 900,
          fontFamily: 'Arial Black, Arial, sans-serif',
          paddingBottom: 6,
        }}
      >
        d
      </div>
    ),
    { width: 180, height: 180 }
  )
}
