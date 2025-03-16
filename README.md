# WHOOP MCP Provider

This is a Model Context Protocol (MCP) provider for WHOOP, allowing you to access WHOOP health and fitness data through a standardized interface.

## Features

- OAuth2 authentication with WHOOP API
- Access to WHOOP data including:
  - Cycles (daily strain)
  - Recovery metrics
  - Sleep data
  - Workout data
  - Body measurements
  - User profile information

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Get your WHOOP API credentials:
   - Go to [WHOOP Developer Portal](https://developer.whoop.com)
   - Create a new application
   - Copy your Client ID and Client Secret
   - Set your redirect URI

5. Update your `.env` file with your credentials:
   ```
   WHOOP_CLIENT_ID=your_client_id
   WHOOP_CLIENT_SECRET=your_client_secret
   WHOOP_REDIRECT_URI=http://localhost:3000/callback
   ```

## Building

```bash
npm run build
```

## Running Tests

```bash
npm test
```

## Usage

The provider can be used as a library or as a standalone MCP server:

```typescript
import { WhoopProvider } from 'whoop-mcp';

const provider = new WhoopProvider({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'your_redirect_uri'
});
```

## Available Resources

- `whoop://cycle` - Daily strain cycles
- `whoop://recovery` - Recovery metrics
- `whoop://sleep` - Sleep data
- `whoop://workout` - Workout data
- `whoop://body_measurement` - Body measurements
- `whoop://profile` - User profile information

## License

ISC 