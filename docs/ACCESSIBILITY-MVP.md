# Accessibility MVP checklist

The existing component system should be reviewed against this minimum bar before release:

- every interactive icon has an accessible name
- dialogs trap focus and restore it on close
- keyboard users can complete login, cart and checkout without a pointer
- validation messages are associated with their controls
- focus-visible states are preserved
- heading hierarchy is semantic
- images have meaningful `alt` text or explicit decorative treatment
- tables expose headers and row context
- color is never the only status signal
- reduced-motion preference is respected for non-essential animation

The project already centralizes UI primitives under `src/shared/ui`; accessibility fixes should be made there first rather than duplicated page-by-page.
