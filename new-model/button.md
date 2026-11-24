---
id: button
name:  button
version: 1.1.0
updated: 2026-11-10
status: draft
language-neutral: true
---

#  button: component spec (v1.1.0)

A platform-neutral spec for one button (" changes"). It describes how the button looks, how it behaves, when to use it, and how to check an implementation. It does not prescribe HTML, CSS, or any language or framework. Implement it with the native equivalents of your target platform (web, iOS, Android, desktop, and so on).

## How to use this spec (for AI implementers)

1. Read the **Tokens** block. It holds every exact value, and each one is a requirement level plus a fallback.
2. Read **Usage guidance** to decide whether this component fits the situation you were asked to build.
3. Implement it on the target platform. Map each token to the nearest native property and keep the value.
4. Check your result against **Acceptance criteria**.
5. Reply with the **Implementer report** (format below), including which fallbacks you used.
6. Put the spec id and version in the output, using the platform's comment or metadata syntax, for example `generated from button. v1.1.0`.

Units: lengths in density-independent pixels (px), times in milliseconds (ms), colors as sRGB hex. Anything not listed uses the platform default.

## Component

- **Name:**  button
- **Label:** " changes"
- **Kind:** single-action button (not a submit or reset button)
- **Scope:** these styles apply to this button only. Do not restyle other buttons.
- **Reference:** the unstyled version is the same button with the platform's default look and no overrides.

## Dependencies

- **Typeface:** IBM Plex Sans, weights 400, 500, 600. Must be installed or bundled by the app. If it is unavailable, see the `type.family` and `type.weight` fallbacks.

## Requirement levels

| Level | Meaning |
|---|---|
| `must` | Changing it breaks the design. Do not deviate. If the platform cannot do it, say so in the report. |
| `should` | Follow it unless the platform cannot. When it cannot, use the stated fallback. |
| `may` | Applies only on platforms or devices where it makes sense. Otherwise skip it. |

## Tokens

```yaml
tokens:
  size:
    height:
      { value: 34px, level: must, intent: "Fixed height, independent of label length.",
        fallback: "If the platform has a larger minimum touch target, keep the visible height at 34px and enlarge only the tappable area." }
    includes-padding-and-border:
      { value: true, level: must, intent: "34px is the final outer height, including padding and border.",
        fallback: "If the platform's height excludes padding, subtract the padding so the outer height is still 34px." }
  space:
    padding-horizontal:
      { value: 24px, level: should, intent: "Space left and right of the label.",
        fallback: "Keep at least 16px if the container is narrow." }
    padding-vertical:
      { value: 0px, level: should, intent: "Zero, because height is fixed and the label is centered vertically.",
        fallback: "Center the label vertically by whatever means the platform offers." }
  type:
    family:
      { value: "IBM Plex Sans", level: should, intent: "Label typeface.",
        fallback: "Use the platform's default UI typeface." }
    size:
      { value: 13px, level: should, intent: "Compact label size for a 34px control.",
        fallback: "Use the nearest available size." }
    weight:
      { value: 500, level: should, intent: "Medium weight for legibility on the blue fill.",
        fallback: "If the typeface has no 500 weight, use the next heavier weight available (for example 600). Never use a lighter weight." }
  color:
    background:
      { value: "#2563eb", level: must, intent: "Resting fill." }
    label:
      { value: "#ffffff", level: must, intent: "Label color, chosen for contrast on the fill." }
  shape:
    border:
      { value: none, level: must, intent: "No outline or stroke. The fill alone defines the edge." }
    corner-radius:
      { value: 8px, level: should, intent: "Uniform rounded corners on all four corners.",
        fallback: "If widgets cannot be rounded natively, draw the shape yourself. If smooth edges are impossible, accept slightly jagged corners; do not fall back to square corners unless nothing else works." }
  interaction:
    pointer:
      { value: hand-cursor, level: may, intent: "Show the clickable cursor on hover.",
        fallback: "Skip on touch-only platforms." }
  motion:
    animated-property:
      { value: scale, level: should, intent: "Only the size (scale) animates. Color changes are instant.",
        fallback: "If animation is unsupported, apply the final value instantly." }
    release-duration:
      { value: 120ms, level: should, intent: "Time to return to normal size after the press ends.",
        fallback: "Use the nearest available duration." }
    easing:
      { value: "cubic-bezier(0, 0, 0.2, 1)", level: should, intent: "Fast start, gentle settle. Used for both press and release.",
        fallback: "Use the platform's standard ease-out curve." }

states:
  hover:
    applies-to: "Pointer devices only."
    tokens:
      color.background:
        { value: "#1d4ed8", level: may, intent: "Darker blue than the resting fill.",
          fallback: "Skip on platforms with no hover, such as touch-only devices." }
  pressed:
    applies-to: "While the button is pressed or held down."
    tokens:
      scale:
        { value: 0.97, level: should, intent: "Shrinks to 97% of normal size, anchored at the center.",
          fallback: "If the label cannot be scaled, scale only the button shape." }
      motion.press-duration:
        { value: 80ms, level: should, intent: "Faster than the release so the press feels immediate.",
          fallback: "Use the nearest available duration." }
```

## Behavior

- **Activation:** triggers one action when the user presses and releases inside the button (click, tap, or keyboard activation). Releasing outside the button cancels it.
- **Center anchor:** scaling keeps the center of the button fixed.
- **Instant vs animated:** hover color changes instantly. Only scale animates.
- **Styling and behavior are independent.** Changing the look does not change what the button does. The action itself is outside this spec.

## Usage guidance

- **Purpose:** confirms or commits changes the user made on the current screen or form.
- **Use it for:** the main action of a view where the user is saving edits.
- **Do not use it for:** destructive actions (delete, remove), navigation, or secondary actions such as cancel.
- **One per view:** show at most one button with this filled style in a single view. Secondary actions should look quieter (not defined in this spec yet).
- **Label:** verb first, sentence case, one to three words, no trailing punctuation. " changes" is the default. Use a more specific verb (" draft") when it helps. Do not use "OK" or "Submit".
- **Accessibility:** the visible label is the accessible name. Keep it text, not an icon alone.

## Acceptance criteria

Each criterion can be checked by measurement, a UI test, or a screenshot. "Tolerance" is the allowed difference.

| ID | Check | Expected | Tolerance | Level |
|---|---|---|---|---|
| AC-1 | Outer height at rest | 34px | 0.5px | must |
| AC-2 | Corner radius | 8px | 1px | should |
| AC-3 | Background at rest | #2563eb | exact | must |
| AC-4 | Label color | #ffffff | exact | must |
| AC-5 | Border | none | none visible | must |
| AC-6 | Width | label width + 48px | 1px, unless the container constrains it | should |
| AC-7 | Label size and weight | 13px; weight 500 if the typeface offers it, otherwise the next heavier | exact size | should |
| AC-8 | Hover background (pointer devices) | #1d4ed8, with no animation | applied within one frame | may |
| AC-9 | Press | scale reaches 0.97 | 80ms, plus or minus one frame | should |
| AC-10 | Release | scale returns to 1.0 | 120ms, plus or minus one frame | should |
| AC-11 | Scale anchor | the center point does not move | 0.5px | should |
| AC-12 | Activation | action fires on release inside; not on release outside | exact | must |
| AC-13 | Scope | no other button on the page changes | exact | must |

## Implementer report

After implementing, reply with this short report so a human can review it quickly:

```
spec: button. v1.1.0
platform: <name and version>
criteria:
  AC-1: pass | fail | not-checked | not-applicable   (note, if any)
  ... one line per criterion ...
fallbacks-used:
  - <token>: <what was done instead, and why>
not-specified:
  - <anything you had to decide that this spec does not cover>
```

## Known platform notes

Findings from earlier implementations. Treat them as hints, not as rules.

- **Web (HTML, CSS, React):** all tokens map directly. Hover, press, and release use plain style rules. Verified visually in a browser.
- **Python with PySide6 (Qt):** the platform's built-in button cannot scale, so the button is drawn by hand. Running on Windows, the label looked thin until IBM Plex Sans was installed, because the default font has no 500 weight. The `type.weight` fallback exists for this reason.
- **Python with tkinter:** native buttons have no corner radius or weight 500. The button is drawn on a canvas, so edges are slightly jagged and the label stays at normal weight. Not confirmed on a real machine.
- **React Native:** hover and the pointer cursor only exist on web and desktop targets, so skip them on phones. Not confirmed on a device.
- **XAML (WPF):** the built-in button draws its own hover and pressed visuals, so the control template must be replaced. Not confirmed on a real machine.

## Not yet specified

The following states and rules are not part of v1.1.0. Use the platform default and list them under `not-specified` in your report:

- focus (keyboard focus indicator)
- disabled
- loading or in-progress
- long-label behavior (truncation, wrapping)
- right-to-left layout

## Changelog

- **1.1.0 (2026-11-10):** values are now a structured block with a requirement level and fallback for each token; added usage guidance, acceptance criteria, an implementer report format, known platform notes, and this version history. No token values changed.
- **1.0.0:** first version, with foundations and states as tables.
