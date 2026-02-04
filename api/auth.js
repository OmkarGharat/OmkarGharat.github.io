const { AuthorizationCode } = require('simple-oauth2');

module.exports = async (req, res) => {
    const { host } = req.headers;
    // Initialize the OAuth2 Library
    const client = new AuthorizationCode({
        client: {
            id: process.env.OAUTH_CLIENT_ID,
            secret: process.env.OAUTH_CLIENT_SECRET,
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

    // Redirect example using Node.js response objects
    res.writeHead(302, { Location: authorizationUri });
    res.end();
};
