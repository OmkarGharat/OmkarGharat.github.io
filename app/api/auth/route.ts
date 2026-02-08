import { AuthorizationCode } from 'simple-oauth2';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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
            authorizePath: '/login/oauth/authorize',
        },
    });

    // Authorization uri definition
    const authorizationUri = client.authorizeURL({
        redirect_uri: `https://${host}/api/callback`,
        scope: 'repo,user', // 'repo' scope is required to write to the repository
        state: Math.random().toString(36).substring(2),
    });

    // Redirect to GitHub
    return Response.redirect(authorizationUri);
}
