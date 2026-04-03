import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: '#734e97',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 22,
          fontWeight: 900,
          fontFamily: 'Arial Black, Arial, sans-serif',
          paddingBottom: 1,
        }}
      >
        d
      </div>
    ),
    { width: 32, height: 32 }
  )
}
