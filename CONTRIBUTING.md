# Contributing to AFOCE

Thanks for contributing. This project is security-sensitive, so every change must pass strict checks.

## Development workflow

1. Create a topic branch from `main`.
2. Make focused changes.
3. Run all required checks locally:

```bash
npm run lint
npm run type-check
npm run test:run
npm run build
```

4. Open a pull request with a clear description and test notes.

## Required standards

### Security

- Never bypass authentication in API routes.
- Never disable or bypass RLS.
- Never trust user-editable metadata for authorization.
- Validate mutation input before processing.
- Never commit secrets.

### Database and migrations

- Use migration-first schema changes.
- Direct edits to `supabase/schema.sql` are blocked by pre-commit.
- Keep migrations reversible where possible.

### Code quality

- Keep strict TypeScript (no `any` unless justified and documented).
- Handle errors explicitly.
- Follow existing file patterns and naming.

## Pull request checklist

- [ ] Scope is focused and intentional.
- [ ] Lint passes.
- [ ] Type check passes.
- [ ] Tests pass.
- [ ] Build passes.
- [ ] Security implications reviewed.
- [ ] Docs updated when behavior/config changes.

## Commit style

Use Conventional Commit style where possible:

- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `docs: ...`
- `test: ...`
