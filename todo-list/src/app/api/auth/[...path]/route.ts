import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params);
}

async function proxyRequest(
    request: NextRequest,
    paramsPromise: Promise<{ path: string[] }>
) {
    const { path } = await paramsPromise;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const targetUrl = `${BACKEND_URL}/api/auth/${pathString}${url.search}`;

    // Get request body if present
    let body: BodyInit | null = null;
    const contentType = request.headers.get('content-type');

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        if (contentType?.includes('application/json')) {
            body = await request.text();
        } else if (contentType?.includes('multipart/form-data')) {
            body = await request.arrayBuffer();
        } else {
            body = await request.text();
        }
    }

    // Forward headers, excluding host
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    // Forward cookies from request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
        headers.set('cookie', cookieHeader);
    }

    try {
        const backendResponse = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
            credentials: 'include',
        });

        // Create response with backend body
        const responseBody = await backendResponse.text();
        const response = new NextResponse(responseBody, {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
        });

        // Forward response headers
        backendResponse.headers.forEach((value, key) => {
            // Forward Set-Cookie headers properly
            if (key.toLowerCase() === 'set-cookie') {
                response.headers.append('set-cookie', value);
            } else if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
                response.headers.set(key, value);
            }
        });

        // Set content-type if present
        const responseContentType = backendResponse.headers.get('content-type');
        if (responseContentType) {
            response.headers.set('content-type', responseContentType);
        }

        return response;
    } catch (error) {
        console.error('Auth proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy auth request' },
            { status: 500 }
        );
    }
}
