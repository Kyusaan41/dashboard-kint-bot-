export default function EnvTestPage() {
  return (
    <pre>
      Client ID: {process.env.DISCORD_CLIENT_ID || 'undefined'}
      {'\n'}
      Redirect URI: {process.env.DISCORD_REDIRECT_URI || 'undefined'}
    </pre>
  );
}
