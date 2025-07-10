export async function onRequest(context) {
    const clientId = context.env.GITHUB_CLIENT_ID;
    const redirectUri = `${context.request.url.split('/api')[0]}/api/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
  
    return Response.redirect(githubAuthUrl, 302);
  }
  