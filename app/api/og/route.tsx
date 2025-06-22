import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Blog Post';
    const category = searchParams.get('category') || 'Hair Artistry';

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
            }}
          />
          
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {category}
            </div>
            
            <div
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.1,
                marginBottom: '40px',
                maxWidth: '1000px',
              }}
            >
              {title}
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                fontSize: '28px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <div>Nycayen Hair Artistry</div>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }} />
              <div>Blog</div>
            </div>
          </div>
          
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '200px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}