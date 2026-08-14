# Generation Loading Feedback Design

**Date:** 2026-08-14

**Status:** Approved for implementation

## Goal

Make team generation visibly active so users do not interpret the 4–9 second API request as a frozen page.

## Current behavior

`components/TeamForm.tsx` already sets `localLoading` before calling `/api/generate-dynamic-team`, disables the submit button, and changes its label to `Generating Team...`. It does not show an animated indicator, expose a loading status to assistive technology, or mark the form as busy.

## Selected design

Enhance the existing submit state in `components/TeamForm.tsx` only:

- Show the existing button label while adding a small CSS/Lucide spinner with `animate-spin`.
- Add `aria-busy={isLoading}` to the form.
- Add a `role="status"` message with polite live-region behavior while generation is active.
- Keep the current disabled-button guard, request flow, error toast, and `finally` cleanup unchanged.
- Do not add an overlay, fake percentage, staged timer messages, polling, streaming, WebSocket, or new dependency.

## Interaction and accessibility

The user remains on the configuring page while the request is running. The submit button is disabled immediately, the spinner provides visual motion, and the status text confirms that the request is still being processed. The status element is not focusable and disappears when generation succeeds or fails. `role="status"` supplies polite live-region behavior; `aria-busy` identifies the form region as busy.

## Error and completion states

- Success: existing `onGenerate` callback navigates to `/equipo`; the loading UI is removed as the component transitions.
- Failure: existing error toast remains; `finally` clears loading so the form can be submitted again.
- Repeated clicks: remain blocked by the existing disabled state.

## Acceptance criteria

1. Clicking `Generate Team` immediately disables the button and shows an animated spinner.
2. A visible status message appears only while generation is pending.
3. The form exposes `aria-busy="true"` during the request.
4. Successful generation still navigates to `/equipo`.
5. Failed generation still shows the existing toast and re-enables the form.
6. No backend, API payload, dependency, or route behavior changes.

## Verification

- Run the focused TypeScript/ESLint checks for `TeamForm.tsx`.
- Run the existing SEO regression and build checks.
- Exercise the generate interaction in the local rendered app and verify button, spinner, status, and navigation states.
