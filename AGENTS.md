# Agent Guidelines

This project utilizes a "Memory Bank" system to maintain context across sessions. AI agents should strictly follow these rules:

## Development Standards
- **Tech Stack**: Follow the defined stack (Next.js, Supabase, Clerk, shadcn/ui).
- **Styling**: Use Tailwind CSS and ensure consistent spacing/theming.
- **Type Safety**: Maintain strict TypeScript definitions in `src/types/`.
- **Component Strategy**: Prefer existing local components and shadcn/ui primitives first. If something is missing, prefer adding a well-maintained library before building a new component from scratch. Treat fully custom components as a last resort.
- **Surgical Updates**: Prefer precise `replace` operations over complete file overwrites unless necessary.
- **Git Workflow**: Commit code directly to `main`.

## Documentation
- Keep `projectBrief.md` updated if core features or tech stack changes.
