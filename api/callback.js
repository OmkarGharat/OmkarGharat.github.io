const { AuthorizationCode } = require('simple-oauth2');

module.exports = async (req, res) => {
    const { code } = req.query;
    const { host } = req.headers;

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

    try {
        const accessToken = await client.getToken({
            code,
            redirect_uri: `https://${host}/api/callback`,
        });

        const token = accessToken.token.access_token;
        const provider = 'github';

        const script = `
      <script>
        (function() {
          function recieveMessage(e) {
            console.log("recieveMessage %o", e);
            
            // Send the token to the CMS window
            window.opener.postMessage(
              'authorization:${provider}:success:${JSON.stringify({ token, provider })}',
              e.origin
            );
          }

          window.addEventListener("message", recieveMessage, false);
          
          // Use hardcoded origin or wildcard if necessary, but e.origin from handshake is safer
          // Decap CMS initiates the popup, so we send message back
          window.opener.postMessage(
            'authorization:${provider}:success:${JSON.stringify({ token, provider })}',
            window.opener.location.origin
          );
          
          // Close the popup after a brief delay
          setTimeout(function() { window.close(); }, 1000);
        })();
      </script>
    `;

        res.setHeader('Content-Type', 'text/html');
        res.end(script);

    } catch (error) {
        console.error('Access Token Error', error.message);
        res.status(500).json('Authentication failed');
    }
};
