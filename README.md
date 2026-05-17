# AFOCE

Autonomous finance operations and compliance engine built with Next.js + Supabase.

## Local setup

1. Install dependencies:

```bash
npm ci
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run lint` | Run ESLint checks |
| `npm run type-check` | Run TypeScript checks |
| `npm run test:run` | Run Vitest once (non-watch) |
| `npm run test:e2e` | Run real Supabase E2E tests (requires `.env.test`) |
| `npm run build` | Build for production |
| `npm run openapi:check` | Verify every API route is documented in `openapi.yaml` |

## Quality gates

This project enforces production gates in CI:

1. Lint
2. Type check
3. Tests
4. E2E security tests (env-gated)
5. OpenAPI coverage check
6. Build
7. Secret scanning (Gitleaks)

Local commits also run pre-commit hooks (`lint`, `type-check`, `test:run`) via Husky.

## Security baseline

- Never use user-editable auth metadata for authorization decisions.
- Keep RLS enabled on exposed tables.
- Never commit secrets.
- Validate all mutation inputs.

See `SECURITY.md` for reporting policy.

## Docs

- `docs/PROJECT.md`
- `docs/BACKEND.md`
- `docs/DESIGN.md`
- `docs/LINTING.md`
- `docs/AGENTS.md`

## Contributing

See `CONTRIBUTING.md` for workflow, standards, and PR checklist.
