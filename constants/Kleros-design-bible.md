# Kleros UI Design System

## Document Metadata (YAML)
```yaml
document:
  name: "Kleros UI Design System"
  version: "1.0.0"
  description: >
    A consolidated set of style guidelines, component structure,
    and usage patterns for building consistent interfaces within
    the Kleros ecosystem, optimized for TailwindCSS and responsiveness.
  authors:
    - "Design Team"
    - "Kleros Contributors"
  last_updated: "2025-02-18"
  frameworks:
    - "TailwindCSS"
  keywords:
    - "design-system"
    - "tailwind"
    - "responsive"
    - "accessibility"
    - "atomic-design"
    - "ui-components"
```

## Table of Contents
- [Introduction](#introduction)
- [Core Design Principles](#core-design-principles)
- [Design Tokens](#design-tokens)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Sizing](#spacing--sizing)
- [Breakpoints (Responsive)](#breakpoints-responsive)
- [Themes](#themes)
- [TailwindCSS Setup](#tailwindcss-setup)
- [Atomic Design Structure](#atomic-design-structure)
- [Component Guidelines](#component-guidelines)
  - [Buttons](#buttons)
  - [Form Fields](#form-fields)
  - [Cards & Panels](#cards--panels)
  - [Navigation Bar](#navigation-bar)
  - [Footer](#footer)
  - [Modal Dialogs](#modal-dialogs)
  - [Tables & Lists](#tables--lists)
  - [Icons & Imagery](#icons--imagery)
- [Accessibility & Performance](#accessibility--performance)
  - [Accessibility Best Practices](#accessibility-best-practices)
  - [Performance Best Practices](#performance-best-practices)
- [Example Usage: JSON Summary](#example-usage-json-summary)
- [License & References](#license--references)

## Introduction
The Kleros UI Design System provides a unified approach for creating user interfaces within the Kleros ecosystem. It includes design tokens (colors, typography, spacing), component structures, and usage patterns. By following these guidelines, developers and designers can build coherent, scalable, and responsive interfaces aligned with the Kleros brand.

- **Responsive**: All components adapt to various screen sizes.
- **TailwindCSS**: Utility classes ensure rapid, consistent styling.
- **Atomic Design**: Components are organized from atoms up to organisms for reusability.
- **Accessibility**: WCAG-conscious color contrasts, semantic HTML, and clear focus states.

## Core Design Principles
- **Efficiency**: Streamline user flows for quick completion of tasks.
- **Consistency**: Ensure UI elements behave and appear uniformly across products.
- **Modularity**: Build components as self-contained units for seamless reusability.
- **Flexibility**: Support varied content lengths, device sizes, and theming.
- **Transparency**: Communicate clearly with users at each step.
- **Clarity**: Favor simple, intuitive layouts that reduce cognitive load.

## Design Tokens
Design tokens capture the fundamental style attributes (colors, spacing, typography, etc.) that define the brand and can be reused across components. Below are JSON structures that can be adapted to your preferred theming approach or directly integrated into your `tailwind.config.js`.

### Color Palette
<details>
<summary>Click to expand JSON color tokens</summary>

```json
{
  "colors": {
    "primary": {
      "DEFAULT": "#4D00B4",
      "light": "#9013FE",
      "dark": "#3B0090"
    },
    "accentBlue": {
      "DEFAULT": "#009AFF"
    },
    "neutral": {
      "100": "#FAFBFC",
      "200": "#E5E5E5",
      "300": "#999999",
      "400": "#333333",
      "900": "#000000"
    },
    "feedback": {
      "success": "#00C42B",
      "error": "#F60C36",
      "warning": "#FF9900"
    },
    "background": {
      "light": "#FFFFFF",
      "dark": "#1B003F"
    },
    "text": {
      "primaryLight": "#333333",
      "primaryDark": "#DAF0FF"
    },
    "shadows": {
      "lightShadow": "rgba(0, 0, 0, 0.02)",
      "darkShadow": "rgba(0, 0, 0, 0.5)"
    }
  }
}
```
</details>

- **Primary Purple (#4D00B4)**: Key brand color for primary actions and highlights.
- **Secondary Purple (#9013FE)**: Alternate shade for hover states, accent areas.
- **Accent Blue (#009AFF)**: Used for secondary actions, links, or additional highlights.
- **Neutral Grays**: For backgrounds, text, borders.
- **Feedback Colors**: Clear distinction for success, error, warning states.
- **Dark/Light Background**: Support for dual themes (light vs dark).

## Typography
Open Sans (Regular 400, Semi-Bold 600) is the primary font. Sizes follow a well-defined scale to maintain hierarchy.

```yaml
typography:
  font_family: "Open Sans, sans-serif"
  font_weights:
    regular: 400
    semi_bold: 600
  sizes:
    h1: { font_size: "2rem", line_height: "2.4rem" }   # ~32px
    h2: { font_size: "1.5rem", line_height: "2rem" }   # ~24px
    h3: { font_size: "1.25rem", line_height: "1.75rem" } # ~20px
    body: { font_size: "1rem", line_height: "1.5rem" }   # ~16px
    small: { font_size: "0.875rem", line_height: "1.25rem" } # ~14px
```

### Key Guidelines
- Base font size ~16px for readability.
- Use Semi-Bold 600 for headings/subheadings.
- Maintain sufficient line-height (1.4–1.6) for multi-line content.
- Ensure WCAG AA contrast with background colors.

## Spacing & Sizing
The Kleros design system follows an 8px spacing grid. All margins, paddings, and layout units are multiples of 8. In Tailwind, you can configure the scale to reflect this:

```json
{
  "spacing": {
    "1": "0.25rem",      // 4px
    "2": "0.5rem",       // 8px
    "3": "0.75rem",      // 12px
    "4": "1rem",         // 16px
    "5": "1.25rem",      // 20px
    "6": "1.5rem",       // 24px
    "8": "2rem",         // 32px
    "10": "2.5rem",      // 40px
    "12": "3rem",        // 48px
    "16": "4rem"         // 64px
  }
}
```

### Usage
- Maintain vertical rhythm by using consistent multiples (8, 16, 24, etc.).
- Card padding often `p-4` (16px) or `p-6` (24px) for comfortable spacing.
- Buttons typically have 8px vertical padding (`py-2`) and 16px horizontal (`px-4`).

## Breakpoints (Responsive)
Tailwind default breakpoints can be used (or extended as needed). Typically:

```yaml
breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  "2xl": 1536px
```

- **Mobile-first**: Start with base styles, then add `sm:`, `md:`, etc. for larger viewports.
- Components should reflow or resize gracefully across these breakpoints (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

## Themes
The system supports light and dark themes. Each theme maps the design tokens (colors, text, background) to the final UI appearance. For example:

```json
{
  "lightTheme": {
    "background": "#FFFFFF",
    "textColor": "#333333",
    "primary": "#4D00B4",
    "accent": "#009AFF",
    "borderColor": "#E5E5E5",
    "success": "#00C42B",
    "error": "#F60C36",
    "warning": "#FF9900"
  },
  "darkTheme": {
    "background": "#1B003F",
    "textColor": "#DAF0FF",
    "primary": "#9013FE",
    "accent": "#009AFF",
    "borderColor": "rgba(255, 255, 255, 0.2)",
    "success": "#65DC7F",
    "error": "#F3778A",
    "warning": "#FBC66A"
  }
}
```

- **Tailwind Dark Mode**: Can toggle using `.dark` class on `<html>` or `<body>`; classes become `dark:bg-gray-900`, etc.
- For React apps, you might use a `<ThemeProvider>` approach, referencing these objects.

## TailwindCSS Setup
Below is an example `tailwind.config.js` snippet that merges the design tokens into Tailwind:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  theme: {
    fontFamily: {
      sans: ['Open Sans', 'sans-serif']
    },
    extend: {
      colors: {
        purple: {
          700: '#4D00B4',
          500: '#9013FE'
        },
        accentBlue: '#009AFF',
        gray: {
          100: '#FAFBFC',
          200: '#E5E5E5',
          300: '#999999',
          400: '#333333'
        },
        success: '#00C42B',
        error: '#F60C36',
        warning: '#FF9900'
      },
      spacing: {
        2: '0.5rem', // 8px
        4: '1rem',   // 16px
        6: '1.5rem', // 24px
        8: '2rem',   // 32px
        10: '2.5rem', // 40px
        12: '3rem',   // 48px
        16: '4rem'    // 64px
      }
    }
  },
  variants: {
    extend: {
      // e.g., backgroundColor: ['active'], etc.
    }
  },
  plugins: []
};
```

- **Responsive Classes**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- **Dark Mode**: Use `dark:` prefix to override colors.
- **Utility-First Approach**: Minimal custom CSS; primarily use Tailwind utilities in HTML or minimal `@apply`.

## Atomic Design Structure
- **Atoms**: Smallest building blocks (e.g., Button, Input, Avatar).
- **Molecules**: Compositions of atoms (e.g., SearchBar combining an Input + Button).
- **Organisms**: Complex UIs combining molecules/atoms (e.g., Navbar, CardList).
- **Templates/Pages**: Larger structures or routes in an application (not covered here but recommended for final layout).

### Naming convention:
- **Atoms**: Button, Checkbox, TextInput, etc.
- **Molecules**: SearchBar, FormField, ProfileSnippet…
- **Organisms**: Navbar, Footer, DashboardCards…
- Use PascalCase for React components (`<Button />`, `<Navbar />`).
- Keep names semantic, not color/size-based.

## Component Guidelines

### Buttons
**Primary** – For main calls to action. Uses brand purple background + white text.

```html
<!-- Example Button -->
<button class="bg-purple-700 text-white font-semibold py-2 px-4 rounded
             hover:bg-purple-800
             disabled:opacity-50 disabled:cursor-not-allowed">
  Submit
</button>
```

**Secondary** – Outlined or lighter emphasis.

```html
<button class="border border-purple-700 bg-white text-purple-700 py-2 px-4 rounded
             hover:bg-purple-50">
  Secondary
</button>
```

**Tertiary** – Link-style or minimal styling.

```html
<button class="text-blue-600 hover:underline">
  Cancel
</button>
```

### Guidelines
- Use utility classes for consistent spacing (`py-2 px-4`).
- Provide a focus style (`focus:outline-none focus:ring-2 focus:ring-purple-600`) for accessibility.
- Icons: place them left/right with margin (`mr-2`, etc.) to separate from text.

### Form Fields
**Text Inputs**

```html
<label class="block mb-2 font-semibold text-sm text-gray-400">Email</label>
<input type="email"
       class="w-full border border-gray-200 rounded py-2 px-3
              focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
       placeholder="Your email address" />
```

- Always pair `<label>` with `<input>` for accessibility.
- Sufficient size for clickable/tappable area.
- Use placeholder text sparingly; rely on label for clarity.

**Checkbox/Radio**

```html
<label class="inline-flex items-center space-x-2">
  <input type="checkbox" class="form-checkbox text-purple-700" />
  <span class="text-gray-700">I agree to the terms</span>
</label>
```

- Use `form-checkbox` or `form-radio` from Tailwind forms plugin.
- Keep label clickable for better usability.

**Validation**

```html
<p class="text-red-600 text-sm mt-1" role="alert">This field is required.</p>
```

- Apply `aria-invalid="true"` on invalid inputs.
- Provide inline error messages with clear text.

### Cards & Panels

```html
<div class="bg-white rounded-lg shadow p-6">
  <h3 class="text-lg font-semibold mb-2">Card Title</h3>
  <p class="text-gray-700">Card content goes here.</p>
  <div class="mt-4">
    <button class="bg-purple-700 text-white py-2 px-4 rounded">Action</button>
  </div>
</div>
```

- Padding: typically 16px (`p-4`) or 24px (`p-6`).
- Shadow: `shadow` or `shadow-md` for subtle elevation.
- On hover (if interactive), you can raise the shadow and change cursor.

### Navigation Bar

```html
<nav class="w-full bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
  <div class="flex items-center">
    <!-- Logo -->
    <img src="logo.png" alt="Kleros Logo" class="h-8 mr-2">
    <span class="font-bold text-xl text-purple-700">Kleros</span>
  </div>
  <ul class="hidden md:flex space-x-4 font-semibold">
    <li><a href="#" class="text-gray-700 hover:text-purple-700">Home</a></li>
    <li><a href="#" class="text-gray-700 hover:text-purple-700">About</a></li>
    <li><a href="#" class="text-gray-700 hover:text-purple-700">Contact</a></li>
  </ul>
  <!-- Mobile Menu Toggle -->
  <button class="md:hidden text-gray-700" aria-label="Open Menu">
    <!-- Icon (hamburger) -->
    <svg ...>...</svg>
  </button>
</nav>
```

- Uses `flex items-center justify-between`.
- On small screens (`md:hidden` / `hidden md:flex`), toggle mobile vs. desktop nav.
- Provide accessible label on the hamburger button.

### Footer

```html
<footer class="w-full bg-gray-100 border-t border-gray-200 py-4 px-4">
  <div class="max-w-7xl mx-auto text-sm text-gray-600 flex items-center justify-between">
    <p>© 2025 Kleros. All rights reserved.</p>
    <nav>
      <a href="#" class="hover:text-purple-700">Privacy Policy</a>
      <span class="mx-2">|</span>
      <a href="#" class="hover:text-purple-700">Terms</a>
    </nav>
  </div>
</footer>
```

- Typically smaller font size (`text-sm`).
- Simple layout with links; ensure spacing for comfortable reading.

### Modal Dialogs

```html
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
    <button class="absolute top-2 right-2 text-gray-600"
            aria-label="Close modal">
      <!-- Close icon -->
      <svg ...>...</svg>
    </button>
    <h2 class="text-xl font-semibold mb-4">Modal Title</h2>
    <p>Modal content goes here.</p>
  </div>
</div>
```

- Overlay: `bg-black bg-opacity-50` or a similar alpha to dim background.
- Centered with `flex items-center justify-center`.
- Trap focus and close on overlay click or Esc for best UX.

### Tables & Lists

```html
<table class="table-auto w-full border-collapse">
  <thead class="bg-gray-100">
    <tr>
      <th class="px-4 py-2 text-left">ID</th>
      <th class="px-4 py-2 text-left">Name</th>
      <th class="px-4 py-2 text-left">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-gray-200">
      <td class="px-4 py-2">1</td>
      <td class="px-4 py-2">Alice</td>
      <td class="px-4 py-2 text-green-600">Active</td>
    </tr>
    <!-- More rows... -->
  </tbody>
</table>
```

- For narrow screens, consider wrapping or converting rows into cards, or allow horizontal scroll with `overflow-x-auto`.
- Alternate row colors or subtle borders for readability.

### Icons & Imagery
- Keep icons at multiples of 8px (16, 24, 32px).
- Provide `aria-hidden="true"` for purely decorative icons.
- For important icons with no text label, include `aria-label="Close menu"`, etc.

## Accessibility & Performance

### Accessibility Best Practices
- **Color Contrast**: Maintain WCAG AA contrast (≥4.5:1 for text).
- **Semantic Elements**: Use `<button>` for clickable actions, `<label>` for inputs, etc.
- **Keyboard Navigation**: Ensure focusable elements have visible focus rings.
- **ARIA**: Provide `aria-label` or `role` for non-semantic elements.
- **Focus Traps**: Modals should trap focus inside until closed.
- **Accessible Theming**: Dark mode must also meet contrast requirements.

### Performance Best Practices
- **Tailwind Purge/JIT**: Remove unused classes to keep CSS bundle small.
- **Lazy Loading**: Defer loading of large images or non-critical scripts.
- **Efficient Layout**: Prefer CSS Grid/Flex over absolute positioning.
- **Caching**: Reuse common components and static assets.
- **Minimal Overdraw**: Animate with transform/opacity for smoother transitions.
- **Optimized Renders**: In React, use memoization for large lists, keys for list items, etc.

## Example Usage: JSON Summary
Below is a JSON snippet summarizing a typical usage scenario (design tokens + recommended classes) that an AI tool could parse to generate components:

```json
{
  "designSystem": {
    "branding": {
      "name": "Kleros",
      "primaryColor": "#4D00B4",
      "accentColor": "#009AFF"
    },
    "typography": {
      "fontFamily": "Open Sans, sans-serif",
      "headings": {
        "h1": "text-2xl md:text-3xl font-semibold",
        "h2": "text-xl md:text-2xl font-semibold",
        "h3": "text-lg md:text-xl font-semibold"
      },
      "body": "text-base md:text-lg",
      "small": "text-sm"
    },
    "spacing": {
      "unit": "8px base",
      "tailwindScale": {
        "2": "8px",
        "4": "16px",
        "6": "24px",
        "8": "32px"
      }
    },
    "components": {
      "button": {
        "primary": "bg-purple-700 text-white font-semibold py-2 px-4 rounded hover:bg-purple-800 disabled:opacity-50",
        "secondary": "border border-purple-700 bg-white text-purple-700 py-2 px-4 rounded hover:bg-purple-50",
        "tertiary": "text-blue-600 hover:underline"
      },
      "card": {
        "base": "bg-white rounded-lg shadow p-6",
        "header": "text-lg font-semibold mb-2",
        "content": "text-gray-700"
      },
      "input": {
        "text": "w-full border border-gray-200 rounded py-2 px-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      },
      "navbar": {
        "base": "bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2",
        "brand": "flex items-center font-bold text-xl text-purple-700",
        "menu": "hidden md:flex space-x-4 font-semibold text-gray-700"
      },
      "modal": {
        "overlay": "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center",
        "content": "bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
      }
    }
  }
}
```

### How to Use
- AI or developers can parse the components object, then apply classes directly or transform them as needed.
- Colors are references to the same tokens in the palette.
- Spacing/typography follow the same scale from `tailwind.config.js`.

## License & References
- The original Kleros UI Components Library is hosted on [GitHub](https://github.com/kleros/ui-components-library).
- This Design File is provided under the same open-source principles.
- References to Atomic Design from Brad Frost.
- TailwindCSS docs at [tailwindcss.com](https://tailwindcss.com).
- For detailed accessibility guidelines, see [W3C WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/).

---

This Design File aims to be a comprehensive reference for building new Kleros-branded components and websites. By adhering to these design tokens, atomic structures, Tailwind configurations, and best practices (responsiveness, accessibility, performance), you can ensure a cohesive, robust user experience throughout the Kleros ecosystem.
