// api/auth.js
const { URL, URLSearchParams } = require('url');

module.exports = (req, res) => {
    const GITHUB_CLIENT_ID = process.env.OAUTH_GITHUB_CLIENT_ID;
    if (!GITHUB_CLIENT_ID) {
        res.status(500).send("OAUTH_GITHUB_CLIENT_ID is not configured.");
        return;
    }

    const { host } = req.headers;
    const redirect_uri = `https://${host}/api/callback`;

    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: redirect_uri,
        scope: 'repo,user',
        state: Math.random().toString(36).substring(7) // Simple random state
    });

    const authorizationUri = `https://github.com/login/oauth/authorize?${params.toString()}`;

    res.writeHead(302, { Location: authorizationUri });
    res.end();
};