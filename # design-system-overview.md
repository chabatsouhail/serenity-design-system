# Design System overview

> This is the agreed architecture for the new Design System. The reusable library implements it; the separate documentation website has not been built yet.

## 1. The two parts of the design system

The design system consists of two separate products:

```text
The design system
├── Design-system library
└── Documentation website
```

### Design-system library

The library is the actual product. It contains:

- Foundation tokens
- Optional component tokens
- CSS foundations and layouts
- Components
- Component behavior
- Razor Tag Helpers for controlled components and native HTML contracts for open compositions
- Public CSS and JavaScript

Applications install and use this library.

### How applications render the design system

The design system does not force every interface pattern through the same ASP.NET mechanism. It uses the smallest contract that adds real value:

```text
The design system must generate or validate a controlled component
→ Public <design-system-*> Tag Helper

The application owns an open HTML composition
→ Native HTML + the design system classes and behavior hooks

The design system needs repeated internal markup behind a Tag Helper
→ Private Razor rendering template

An application feature needs server-side data or rendering logic
→ Application-owned View Component
```

Picker, Date Picker, File Upload, Pagination, Empty State, Theme Toggle, and Toast Host therefore use public Tag Helpers. Tables, lists, tabs, menus, dialogs, navigation, grids, and stacks remain native HTML compositions. Files under `Pages/Shared/DesignSystem/Internal` are implementation details and are never a second public way to invoke a component.

### Documentation website

The website explains and demonstrates the library.

It:

- Uses the real design-system components.
- Displays tokens, guidelines, examples, code, and properties.
- Does not maintain its own versions of components.
- Remains separate from the portable design-system folder.

The website can be completely redesigned without changing the underlying library.

---

## 2. Documentation structure

The website has four main destinations:

```text
Discover
Foundations
Components
Patterns
```

### Discover

Introduces the system:

- Overview
- Getting Started
- Version Control

### Foundations

Explains the shared design decisions.

```text
Foundations
├── Visual
├── Interaction
└── Content
```

Visual includes Color, Typography, Spacing, Sizing, Layout, Shape, Elevation, and Icons.

Interaction includes Cursors, Gestures, Motion, States, Timing, Wrapping and Truncation, Keyboard, and Accessibility.

Content includes Voice, Tone, Writing, Labels, Terminology, and Formatting.

### Components

Contains the individual reusable controls.

Every component receives its own destination, such as:

- Button
- Text Field
- Table
- Dialog
- Context Menu

Related subcomponents can be nested beneath their parent. For example, Row and Column can appear beneath Table.

### Patterns

Patterns explain how multiple components work together to solve a larger interface problem.

---

# Token system

Tokens store the reusable design decisions behind the system.

There are two ways of organizing them:

1. Token groups organize where tokens belong.
2. Token architecture defines how their values flow.

These are related, but they are not the same thing.

---

## 3. Token groups

### Foundation Groups

Foundation Groups contain decisions that can be reused throughout the entire system.

We reuse the existing Foundation terminology:

```text
Foundation Groups
├── Color
├── Typography
├── Spacing
├── Sizing
├── Layout
├── Shape
├── Elevation
├── Icons
├── Motion
└── Timing
```

Not every Foundations navigation destination needs tokens. Voice and Writing, for example, are important foundations but do not necessarily require stored CSS values.

Foundation Groups contain both Primitive and Semantic tokens.

### Component Groups

Component Groups are optional.

A component receives a token group only when consumers need to customize that component independently.

Examples:

```text
Component Groups
├── Button
├── Picker
├── Table
└── Tooltip
```

A component does not automatically receive component tokens merely because it exists.

If a component can use Semantic tokens directly without losing any useful customization, it does not need a Component Group.

---

## 4. Token architecture

The normal value flow for a decision with shared meaning is:

```text
Primitive → Semantic → CSS property
```

When independent component customization is needed:

```text
Primitive → Semantic → Component → CSS property
```

Fixed scale choices can use a Primitive token directly when another name would add no useful meaning. A component can therefore use a spacing step or type weight from the Primitive scale. Colors, themed decisions, and values shared as one design rule go through Semantic tokens.

### Primitive tokens

Primitive tokens store raw design values.

They answer:

> What is the value?

```css
--design-system-primitive-color-blue-600: #2563eb;
--design-system-primitive-spacing-4: 16px;
--design-system-primitive-shape-radius-medium: 8px;
```

Primitive tokens have no knowledge of buttons, warnings, backgrounds, or other purposes.

They may be used directly for fixed scale choices. For example, `spacing-4` still means the same thing wherever it is used; it does not need a Semantic alias unless the spacing has become a shared rule that should change as one decision.

### Semantic tokens

Semantic tokens give primitive values a purpose.

They answer:

> What should this value be used for?

```css
--design-system-semantic-color-action-background:
    var(--design-system-primitive-color-blue-600);

--design-system-semantic-shape-control-radius:
    var(--design-system-primitive-shape-radius-medium);

--design-system-semantic-typography-heading-1:
    var(--design-system-primitive-typography-weight-medium)
    var(--design-system-primitive-typography-size-heading-large) /
    var(--design-system-primitive-typography-line-height-tight)
    var(--design-system-primitive-typography-family-sans);
```

This allows a theme to change the meaning without editing every component.

Typography is a special case: one Semantic Type Style stores the complete CSS `font` Value. Heading 1 therefore needs one Semantic Token, not four separate Font Family, Font Size, Line Height, and Font Weight sub-Tokens.

Typography is organized by meaning:

- **Reading Type Styles** establish hierarchy and reading rhythm.
- **Interface Type Styles** fit Labels, Controls, compact metadata, and Actions.
- **Inline Text Decisions** modify part of an existing Style, such as Emphasis or Link underline placement.

Emphasis does not duplicate Body or Caption into additional complete Type Styles. It changes only the Font Weight after the base Type Style is applied.

### Component tokens

Component tokens are optional customization points.

They answer:

> Should this component be customizable independently?

```css
--design-system-component-button-background-filled:
    var(--design-system-semantic-color-action-background);
```

By default, the Button follows the shared Semantic token. A component-only measurement may instead default directly to a Primitive token; the Component token is still the independent override point.

A product can change only the Button by reassigning its Component token:

```css
.product-theme {
    --design-system-component-button-radius:
        var(--design-system-primitive-shape-radius-none);
}
```

Other controls using the shared control radius remain unchanged.

### Private variables

Private variables are not public tokens.

They are temporary implementation details used inside component CSS—for example, storing an internal calculation or choosing between values.

Consumers should not use or override them, and they do not appear in the token documentation.

---

## 5. Themes

Themes primarily remap Semantic tokens.

```css
:root {
    --design-system-semantic-color-surface-background:
        var(--design-system-primitive-color-neutral-0);
}

[data-theme="dark"] {
    --design-system-semantic-color-surface-background:
        var(--design-system-primitive-color-neutral-900);
}
```

Components automatically receive the new theme because they consume Semantic tokens, either directly or through Component tokens.

Themes therefore do not need to restyle every component individually.

---

# Token naming

The three token levels have separate naming patterns.

## 6. Primitive naming

```text
--design-system-primitive-{foundation-group}-{property/family}-{value}
```

Examples:

```css
--design-system-primitive-color-blue-600
--design-system-primitive-typography-size-extra-large
--design-system-primitive-shape-radius-medium
```

Primitive names describe the raw value, not its intended use.

## 7. Semantic naming

```text
--design-system-semantic-{foundation-group}-{role}-{property}-{optional-variant}-{optional-tone}-{optional-state}
```

Examples:

```css
--design-system-semantic-color-action-background
--design-system-semantic-color-action-background-strong
--design-system-semantic-color-action-background-strong-hover
```

Variants and states are optional and remain at the far right.

Typography Type Styles use a shorter naming pattern because the Token represents the whole Style:

```text
--design-system-semantic-typography-{type-style}
```

```css
--design-system-semantic-typography-heading-1
--design-system-semantic-typography-body
--design-system-semantic-typography-action-small
```

Inline Text Decisions share the Typography namespace:

```text
--design-system-semantic-typography-{inline-decision}
```

## 8. Component naming

```text
--design-system-component-{component-group}-{property}-{optional-variant}-{optional-tone}-{optional-state}
```

Examples:

```css
--design-system-component-button-background
--design-system-component-button-background-filled
--design-system-component-button-background-filled-hover
```

Component tokens always begin with the component that owns them.

---

## 9. Complete example

```css
/* Raw value */
--design-system-primitive-color-blue-600: #2563eb;

/* Shared meaning */
--design-system-semantic-color-action-background:
    var(--design-system-primitive-color-blue-600);

/* Optional Button customization point */
--design-system-component-button-background-filled:
    var(--design-system-semantic-color-action-background);

/* Component implementation */
.design-system-button[data-design-system-variant="filled"] {
    background: var(--design-system-component-button-background-filled);
}
```

In plain language:

```text
Blue 600
    ↓
Shared action background
    ↓
Filled Button background
    ↓
Actual Button CSS
```

The Component step can be omitted when independent Button customization is unnecessary.

---

## 10. Token documentation

The Foundation Token List will document Primitive and Semantic tokens.

Each entry should show:

| Information | Purpose |
|---|---|
| Token | Exact public name |
| Type | Primitive or Semantic |
| Foundation Group | Color, Shape, Spacing, etc. |
| Purpose | What the token controls |
| Reference | Which token supplies its value |
| Light value | Resolved light-theme value |
| Dark value | Resolved dark-theme value |
| Swatch | Visual sample where applicable |

Component tokens will be documented separately under their owning components or in an optional Component Token List.

Private variables will not be included.

This keeps the overall system simple:

```text
Foundation Groups organize shared decisions.
Component Groups organize optional component controls.
Token Architecture defines how values flow.
Token Naming defines how individual tokens are written.
```
