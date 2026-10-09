# Accessibility MVP checklist

## Implemented improvements

- [x] Modal: focus trap, Escape to close, restore focus, `role="dialog"`, `aria-modal`, labelled by title
- [x] Input: design-token colors, `htmlFor`/`id` binding, `aria-invalid`, `aria-describedby` for errors/hints
- [x] Button: variants, sizes, loading state with `aria-busy`
- [x] Skip link to main content (StoreShell)
- [x] Interactive quantity controls have accessible names
- [x] Empty states use consistent component with semantic status
- [x] Compare table exposes headers (`scope`) and caption
- [x] `prefers-reduced-motion` respected in globals
- [x] `:focus-visible` ring for keyboard users
- [x] Toast region uses `aria-live="polite"`

## Still recommended before production

- every remaining icon-only control audited for accessible name
- keyboard path through full checkout verified on device
- color contrast audit (WCAG AA) on primary/muted pairs
- tables in admin dashboard expose headers and row context
- color is never the only status signal (pair with icon/text)
