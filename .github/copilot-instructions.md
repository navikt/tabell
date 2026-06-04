# Copilot Instructions

## Repository overview

`@navikt/tabell` is a React component library that wraps `@navikt/ds-react`'s `Table` component with sorting, filtering, pagination, row selection, inline editing, and hierarchical subrows. It is published on npm and used within the NAV (Norwegian Labour and Welfare Administration) ecosystem.

## Commands

```bash
npm start              # Vite dev server (renders src/page/page.tsx as demo)
npm run build          # Vite build (demo site only, not the library)
npm run dist           # Build the distributable library → lib/ (ESM + CJS via webpack)
npm test               # Run all Jest tests (watch mode)
npm run test:ci        # Run tests once, update snapshots (CI)
npm run test:coverage  # Run tests with coverage report
```

**Single test:**
```bash
npx jest -t "test name pattern"                          # by test name
npx jest --testPathPattern=Table.test.tsx                # by file
```

## Architecture

There are **two separate build systems**:
- **Vite** (`npm start` / `npm run build`): serves `src/index.tsx` → `src/page/page.tsx` as an interactive demo/docs site.
- **Webpack** (`npm run dist`): bundles `src/dist.ts` → `lib/` as the published library in both ESM (`lib/index.js`) and CJS (`lib/index.cjs`) formats.

The component tree in `src/components/`:
- `Table.tsx` — top-level component; owns all state (items, sort, pagination, filter, editing rows)
- `Header.tsx` / `HeaderCategories.tsx` / `HeaderFilter.tsx` — column headers, optional category row, per-column search filters
- `Row.tsx` — renders a single data row, delegates to `FirstCell.tsx` and `Cell.tsx`
- `AddRow.tsx` — inline new-row form (shown when `editable && allowNewRows`)
- `Footer.tsx` — pagination controls and item counts

All TypeScript types and interfaces live in **`src/index.d.ts`** — this is the single source of truth for the public API.

`tsconfig.json` sets `"baseUrl": "src/"`, so imports throughout the codebase resolve relative to `src/`:
```ts
import { Column, Item } from 'index.d'   // resolves to src/index.d.ts
import Table from 'components/Table'     // resolves to src/components/Table.tsx
```

## Key conventions

### Item shape
Every row item **must** have a `key: string` property. Other reserved fields (`visible`, `selected`, `parentKey`, `hasSubrows`, `openSubrows`, `sortKey`, `editDisabled`, etc.) are optional but have specific meanings managed internally by `Table.tsx`.

### Generic typing pattern
Components use two generic type parameters:
```ts
<CustomItem extends Item = Item, CustomContext extends Context = Context>
```
`CustomItem` extends the row data type; `CustomContext` carries arbitrary read-only data passed down to `render` and `edit` callbacks.

### Column types and filtering/sorting
The `column.type` field (`'string'`, `'date'`, `'object'`, …) drives how values are converted to strings for both sorting and filtering. For `'object'` columns, supply a `needle` function to extract a searchable string and a `render` function to display the cell.

### Subrows
Parent rows set `hasSubrows: true`; child rows set `parentKey` to the parent's `key`. Sort keys for children are prefixed with the parent's sort key (`parentSortKey + '__' + childSortKey`) so subrows stay grouped with their parent during sorting.

### Labels / i18n
Default labels (`src/components/Table.labels.ts`) are in **Norwegian**. Labels support Mustache-style interpolation tokens: `{{x}}`, `{{y}}`, `{{type}}`. Override by passing a `labels` prop.

## Git Commit Messages — Arlo's Commit Notation (Modified)

All commits **must** use our modified version of [Arlo's Commit Notation](https://github.com/RefactoringCombos/ArlosCommitNotation). Each commit message starts with an intention prefix, a risk separator, and a short summary.

### Format

```
<intention><risk separator> <Short summary>
```

### Risk separators

| Separator | Meaning |
|-----------|---------|
| ` - ` | Proven safe |
| `! - ` | Risky |
| `!! ` | Very risky |

### Intention prefixes

Lowercase = safe / non-behaviour-changing. Uppercase = behaviour-impacting or higher-risk.

| Prefix | Meaning | Description |
|--------|---------|-------------|
| `f/F` | Feature | Changes or extends one aspect of program behaviour |
| `b/B` | Bugfix | Repairs undesirable behaviour without altering others |
| `r/R` | Refactoring | Changes implementation without changing behaviour |
| `d/D` | Documentation | Changes documentation or comments only |
| `e/E` | Environment | **Manual** changes to build, CI, dependencies, or tooling |
| `u/U` | Update | **Automatic** bumps and environment updates (dependency bots) |
| `t/T` | Test | Adds or modifies tests only |

### Examples

```
r - Extract sorting logic into getStringFromCellFor
F!! Add untested inline edit for complex cell types
b - Fix null check in date column filter
e - Upgrade webpack to v6
t - Add pagination boundary tests
d - Update README with install instructions
u - Auto-bump @navikt/ds-react to 7.41.0
```

### Rules

- Prefix and risk separator are **mandatory** on every commit.
- When multiple intentions apply, use the **riskiest** one.

### Tests
Tests are co-located in `src/components/Table.test.tsx` and use `@testing-library/react` + Jest with a `jsdom` environment. CSS modules are proxied via `identity-obj-proxy`; SVGs via `src/__mocks__/svgMock.js`. The test file pattern is `**/*.test.tsx`.
