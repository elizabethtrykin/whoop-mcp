import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('WhoopProvider', () => {
  let client: Client;
  let serverProcess: any;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    // Start the server process
    const serverPath = join(__dirname, '../../build/index.js');
    serverProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        WHOOP_CLIENT_ID: process.env.WHOOP_CLIENT_ID,
        WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET,
        WHOOP_REDIRECT_URI: process.env.WHOOP_REDIRECT_URI,
      },
    });

    // Create MCP client
    transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: {
        WHOOP_CLIENT_ID: process.env.WHOOP_CLIENT_ID ?? '',
        WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET ?? '',
        WHOOP_REDIRECT_URI: process.env.WHOOP_REDIRECT_URI ?? '',
      }
    });

    client = new Client(
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

    await client.connect(transport);
  });

  afterAll(async () => {
    if (transport) {
      await (transport as any).stop();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should list available resources', async () => {
    const resources = await client.listResources();
    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'profile',
      })
    );
  });

  it('should list available tools', async () => {
    const tools = await client.listTools();
    expect(tools).toContainEqual(
      expect.objectContaining({
        name: 'get_cycle',
      })
    );
  });

  it('should fetch user profile', async () => {
    const resource = await client.readResource({
      uri: 'whoop://profile'
    });
    expect(resource).toBeDefined();
  });

  it('should get cycle data', async () => {
    const result = await client.callTool({
      name: 'get_cycle',
      arguments: {
        startDate: '2024-03-14',
        endDate: '2024-03-15',
      },
    });
    expect(result).toBeDefined();
  });
}); 