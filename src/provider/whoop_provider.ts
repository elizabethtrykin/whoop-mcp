import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WhoopAuth } from './whoop_connection.js';

export interface WhoopConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export class WhoopProvider {
  private server: McpServer;
  private auth: WhoopAuth;

  constructor(config: WhoopConfig) {
    this.auth = new WhoopAuth(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.server = new McpServer({
      name: "whoop-provider",
      version: "1.0.0"
    });

    this.initializeResources();
  }

  private async fetchWhoopData(endpoint: string, params?: Record<string, string>): Promise<any> {
    const headers = await this.auth.getHeaders();
    const url = new URL(`${this.auth.getBaseUrl()}${endpoint}`);
    
    if (params) {
      // Log the incoming date parameters
      console.log(`Fetching ${endpoint} with params:`, params);
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  private initializeResources(): void {
    // Define the date range schema for tools
    const dateRangeSchema = {
      startDate: z.string(),
      endDate: z.string()
    };

    // Add resources and tools for each endpoint
    const endpoints = [
      { name: 'cycle', path: '/v1/cycle', requiresDates: true },
      { name: 'recovery', path: '/v1/recovery', requiresDates: true },
      { name: 'sleep', path: '/v1/activity/sleep', requiresDates: true },
      { name: 'workout', path: '/v1/activity/workout', requiresDates: true },
      { name: 'body_measurement', path: '/v1/user/measurement/body', requiresDates: false },
      { name: 'profile', path: '/v1/user/profile/basic', requiresDates: false }
    ];

    // Add resources
    endpoints.forEach(({ name, path, requiresDates }) => {
      this.server.resource(
        name,
        `whoop://${name}`,
        async (uri) => {
          let data;
          if (requiresDates) {
            // For date-based resources, fetch last 7 days by default
            const end = new Date().toISOString();
            const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            data = await this.fetchWhoopData(path, { start, end });
          } else {
            data = await this.fetchWhoopData(path);
          }

          return {
            contents: [{
              uri: uri.href,
              text: JSON.stringify(data, null, 2)
            }]
          };
        }
      );
    });

    // Add tools
    endpoints.filter(e => e.requiresDates).forEach(({ name, path }) => {
      this.server.tool(
        `get_${name}`,
        dateRangeSchema,
        async ({ startDate, endDate }) => {
          const data = await this.fetchWhoopData(path, {
            start: startDate,
            end: endDate
          });

          return {
            content: [{
              type: "text",
              text: JSON.stringify(data, null, 2)
            }]
          };
        }
      );
    });
  }

  getServer(): McpServer {
    return this.server;
  }
} 