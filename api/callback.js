// api/callback.js
const https = require('httpss');
const { URL, URLSearchParams } = require('url');

module.exports = (req, res) => {
    const GITHUB_CLIENT_ID = process.env.OAUTH_GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.OAUTH_GITHUB_CLIENT_SECRET;

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        res.status(500).send("OAuth credentials are not configured.");
        return;
    }

    const url = new URL(req.url, `https://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (!code) {
        res.status(400).send("No code received from GitHub.");
        return;
    }

    const postData = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
    }).toString();

    const options = {
        hostname: 'github.com',
        port: 443,
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Accept': 'application/json'
        }
    };

    let tokenData = '';
    const postReq = https.request(options, (postRes) => {
        postRes.on('data', (chunk) => { tokenData += chunk; });
        postRes.on('end', () => {
            try {
                const token = JSON.parse(tokenData).access_token;
                const script = `<!DOCTYPE html><html><body><script>
                (function() {
                    window.opener.postMessage('authorization:github:success:${JSON.stringify({
                        token: token, provider: "github"
                    })}', '*')
                })()
                </script></body></html>`;
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(script);
            } catch (e) {
                res.status(500).send("Failed to parse token from GitHub.");
            }
        });
    });

    postReq.on('error', (e) => {
        console.error(e);
        res.status(500).send('Authentication failed due to a network error.');
    });

    postReq.write(postData);
    postReq.end();
};