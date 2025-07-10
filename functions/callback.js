export async function onRequest(context) {
    const code = new URL(context.request.url).searchParams.get("code");
    const clientId = context.env.GITHUB_CLIENT_ID;
    const clientSecret = context.env.GITHUB_CLIENT_SECRET;
  
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });
  
    const tokenData = await tokenRes.json();
  
    const html = `
      <script>
        window.opener.postMessage(${JSON.stringify(tokenData)}, "*");
        window.close();
      </script>
    `;
  
    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  }
  