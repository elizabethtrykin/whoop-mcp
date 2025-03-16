import { z } from 'zod';

export interface WhoopTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export class WhoopAuth {
  private baseUrl = 'https://api.prod.whoop.com/developer';
  private tokens: WhoopTokens;

  constructor(clientId?: string, clientSecret?: string, redirectUri?: string) {
    if (clientId && clientSecret) {
      // Store OAuth credentials for later use
      this.tokens = {
        accessToken: '',
        refreshToken: '',
        expiresAt: 0
      };
    } else {
      throw new Error('OAuth credentials must be provided');
    }
  }

  async getHeaders(): Promise<Record<string, string>> {
    if (!this.tokens.accessToken) {
      throw new Error('Not authenticated');
    }

    // Check expiration and refresh if needed
    if (this.tokens.expiresAt && this.tokens.expiresAt <= Date.now()) {
      await this.refreshTokens();
    }

    return {
      'Authorization': `Bearer ${this.tokens.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async refreshTokens(): Promise<void> {
    if (!this.tokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
} 