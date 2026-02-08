import { AuthorizationCode } from 'simple-oauth2';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const host = request.headers.get('host');
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;

    if (!host) return new Response('Missing host header', { status: 400 });
    if (!clientId || !clientSecret) return new Response('Missing OAuth configuration', { status: 500 });

    // Initialize the OAuth2 Library
    const client = new AuthorizationCode({
        client: {
            id: clientId,
            secret: clientSecret,
        },
        auth: {
            tokenHost: 'https://github.com',
            tokenPath: '/login/oauth/access_token',
        },
    });

    if (!code) {
        return new Response('Missing code', { status: 400 });
    }

    try {
        const accessToken = await client.getToken({
            code: code,
            redirect_uri: `https://${host}/api/callback`,
        });

        const token = accessToken.token.access_token as string;
        const provider = 'github';
        const content = JSON.stringify({ token, provider });

        // Script matching the original implementation exactly
        const script = `
        <script>
        (function() {
            function receiveMessage(e) {
                console.log("receiveMessage %o", e)
                
                // Keep the window open and send message immediately when loaded
                window.opener.postMessage("authorization:${provider}:success:${content}", "*");
                setTimeout(function() { window.close(); }, 1000);
            }
            // Send message immediately
            receiveMessage();
        })()
        </script>
        `;

        return new Response(script, {
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error: any) {
        console.error('Access Token Error', error.message);
        return new Response('Authentication failed', { status: 500 });
    }
}
