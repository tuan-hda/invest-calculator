# Active Context

## Current Focus
- Stabilizing the Market page after integrating BTC charting and recent upstream changes.

## Recent Changes
- Pulled the latest `main` updates before verification.
- Added a BTC market history API route backed by CoinGecko data.
- Added a Market page chart for BTC 24H and 48H price history.
- Updated the Market page header layout to stack on separate lines.
- Added agent guidance to prefer existing components, shadcn/ui, or third-party libraries before building custom components.
- Fixed the `recharts` tooltip formatter typing so TypeScript and production builds succeed.

## Next Steps
- Add more market instruments and metrics to the Market page.
- Consider caching and fallback handling for external market API failures.
