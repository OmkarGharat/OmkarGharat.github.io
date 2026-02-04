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
          // Injected values
          const token = "${token}";
          const provider = "${provider}";
          
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            const content = JSON.stringify({ token: token });
            window.opener.postMessage("authorization:" + provider + ":success:" + content, "*");
          }

          window.addEventListener("message", receiveMessage, false);
          
          // Immediate send
          const content = JSON.stringify({ token: token });
          window.opener.postMessage("authorization:" + provider + ":success:" + content, "*");
          
          setTimeout(function() { window.close(); }, 1000);
        })();
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(script);

  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
};
