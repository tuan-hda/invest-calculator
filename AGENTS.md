# Agent Guidelines

This project utilizes a "Memory Bank" system to maintain context across sessions. AI agents should strictly follow these rules:

## Memory Bank Usage
- **Read First**: Always read `memory-bank/projectBrief.md`, `progress.md`, and `activeContext.md` at the start of a task.
- **Stay Updated**: Update `memory-bank/activeContext.md` and `memory-bank/progress.md` after significant changes or at the end of a session.
- **Focus**: Respect the "Current Focus" defined in `activeContext.md`.

## Development Standards
- **Tech Stack**: Follow the defined stack (Next.js, Supabase, Clerk, shadcn/ui).
- **Styling**: Use Tailwind CSS and ensure consistent spacing/theming.
- **Type Safety**: Maintain strict TypeScript definitions in `src/types/`.
- **Component Strategy**: Prefer existing local components and shadcn/ui primitives first. If something is missing, prefer adding a well-maintained library before building a new component from scratch. Treat fully custom components as a last resort.
- **Surgical Updates**: Prefer precise `replace` operations over complete file overwrites unless necessary.

## Documentation
- Keep `projectBrief.md` updated if core features or tech stack changes.
- Ensure `progress.md` reflects the actual state of implementation and upcoming roadmap.
