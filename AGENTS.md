<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Project Instructions

## Terminal command policy

Use RTK for noisy terminal commands to reduce token usage.

Preferred commands:
- rtk git status
- rtk git diff
- rtk pnpm lint
- rtk pnpm build
- rtk npx tsc --noEmit
- rtk rg "keyword" src
- rtk find "*.ts" .
- rtk find "*.tsx" .

When validating changes:
1. Run the smallest relevant check first.
2. Prefer RTK for broad output.
3. If RTK output is too compressed, rerun a focused raw command.
4. Avoid dumping full logs unless necessary.

## Validation

Before finishing code changes, run the relevant checks:
- pnpm lint
- pnpm build
- npx tsc --noEmit

Use RTK for these commands unless exact raw output is needed.

<!-- END:nextjs-agent-rules -->
