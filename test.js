import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Get command line arguments
  const [toolName, date] = process.argv.slice(2);
  
  if (!toolName || !date) {
    console.error('Usage: node test.js <tool_name> <date>');
    process.exit(1);
  }

  const serverPath = join(__dirname, 'build/index.js');
  
  // Create MCP client
  const transport = new StdioClientTransport({
    command: '/opt/homebrew/bin/node',
    args: [serverPath],
    env: {
      WHOOP_CLIENT_ID: process.env.WHOOP_CLIENT_ID,
      WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET,
      WHOOP_REDIRECT_URI: process.env.WHOOP_REDIRECT_URI,
    }
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  try {
    console.log('Connecting to server...');
    await client.connect(transport);

    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Available resources:', resources);

    console.log('\nListing tools...');
    const tools = await client.listTools();
    console.log('Available tools:', tools);

    // Test various resources
    const resourceTests = [
      'profile',
      'body_measurement',
      'cycle',
      'recovery'
    ];

    for (const resource of resourceTests) {
      console.log(`\nFetching ${resource}...`);
      const data = await client.readResource({
        uri: `whoop://${resource}`
      });
      console.log(`${resource} data:`, data);
    }

    // Call the specified tool with the given date
    console.log(`\nCalling ${toolName}...`);
    const data = await client.callTool({
      name: toolName,
      arguments: {
        startDate: date,
        endDate: date,
      },
    });
    console.log(`${toolName} data:`, data);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

main(); 