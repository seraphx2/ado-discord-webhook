# Discord Webhook

This is a rather simple task that allows the integration of a Discord Webhook into your BUILD or RELEASE pipeline.

Note: This IS NOT a Service Connection.

Install [Discord Webhook](https://marketplace.visualstudio.com/items?itemName=robmburke.ado-discord-webhook).

## Usage
Please refer to the [extension overview](/overview.md) for a detailed explanation on how to use it.

## Development
### Getting started
1. Clone the repository
2. Navigate to `buildAndReleaseTask`
3. Run `pnpm install`
4. Run `pnpm run build` to build the extension

### Testing
1. Make sure you followed the [Getting started](#getting-started) section.
2. Fill your webhook credentials (for testing purpose) into the `test-credentials.json` file.
3. Run `pnpm test`
