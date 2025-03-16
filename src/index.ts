import { config as dotenvConfig } from 'dotenv';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WhoopProvider } from './provider/whoop_provider.js';

dotenvConfig();

const config = {
  api: {
    baseUrl: 'https://api.prod.whoop.com/developer',
  },
  auth: {
    clientId: process.env.WHOOP_CLIENT_ID || '',
    clientSecret: process.env.WHOOP_CLIENT_SECRET || '',
    redirectUri: process.env.WHOOP_REDIRECT_URI || 'http://localhost:3000/callback'
  },
  server: {
    name: 'whoop-provider',
    version: '1.0.0'
  }
};

function validateConfig() {
  const { clientId, clientSecret } = config.auth;
  
  if (!clientId || !clientSecret) {
    throw new Error('Both WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET must be provided');
  }
}

async function main() {
  // Validate configuration
  validateConfig();

  // Create and initialize the provider
  const provider = new WhoopProvider({
    clientId: config.auth.clientId,
    clientSecret: config.auth.clientSecret,
    redirectUri: config.auth.redirectUri
  });
  
  const transport = new StdioServerTransport();
  
  await provider.getServer().connect(transport);
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});

export { WhoopProvider } from './provider/whoop_provider.js';
export { WhoopAuth } from './provider/whoop_connection.js';
export type { WhoopConfig } from './provider/whoop_provider.js';
export type { WhoopTokens } from './provider/whoop_connection.js';
export type { PersonalInfo } from './provider/resources/personal_info.js';
