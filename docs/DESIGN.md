# AFOCE Design System

## 🎨 Visual Identity

### Brand Colors

```typescript
// Primary Palette
const colors = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
}
```

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}
```

### Spacing Scale

```typescript
const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}
```

### Border Radius

```typescript
const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
}
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}
```

## 🧩 Component Patterns

### Button Variants

```tsx
// Primary Button
<button className="btn-primary">
  Create Invoice
</button>

// Secondary Button
<button className="btn-secondary">
  Cancel
</button>

// Danger Button
<button className="btn-danger">
  Delete
</button>

// Ghost Button
<button className="btn-ghost">
  Learn More
</button>

// Icon Button
<button className="btn-icon">
  <PlusIcon className="w-5 h-5" />
</button>
```

### Input Fields

```tsx
// Text Input with Label
<div className="form-group">
  <label htmlFor="name" className="form-label">
    Client Name
  </label>
  <input
    id="name"
    type="text"
    className="form-input"
    placeholder="Enter client name"
    required
  />
  <span className="form-error">Name is required</span>
</div>

// Select Dropdown
<select className="form-select">
  <option value="">Select status</option>
  <option value="pending">Pending</option>
  <option value="paid">Paid</option>
</select>

// Checkbox
<label className="form-checkbox">
  <input type="checkbox" />
  <span>Remember me</span>
</label>
```

### Data Display

```tsx
// Card Component
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Invoice Summary</h3>
  </div>
  <div className="card-body">
    {/* Content */}
  </div>
  <div className="card-footer">
    {/* Actions */}
  </div>
</div>

// Table Component
<table className="data-table">
  <thead>
    <tr>
      <th>Invoice</th>
      <th>Client</th>
      <th>Amount</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>INV-0001</td>
      <td>Sharma & Associates</td>
      <td>Rs. 50,000</td>
      <td><Badge variant="success">Paid</Badge></td>
      <td>
        <Button variant="ghost" size="sm">View</Button>
      </td>
    </tr>
  </tbody>
</table>

// Status Badge
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Overdue</Badge>
<Badge variant="info">Draft</Badge>
```

### Layout Components

```tsx
// Page Layout
<div className="page-layout">
  <header className="page-header">
    <h1 className="page-title">Dashboard</h1>
    <p className="page-subtitle">Overview of your finances</p>
  </header>
  <main className="page-content">
    {/* Page content */}
  </main>
</div>

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Sidebar Layout
<div className="flex h-screen">
  <aside className="sidebar w-64">
    {/* Navigation */}
  </aside>
  <main className="flex-1 overflow-auto">
    {/* Content */}
  </main>
</div>
```

### Feedback Components

```tsx
// Alert
<Alert variant="info">
  <AlertIcon />
  <AlertTitle>New Feature</AlertTitle>
  <AlertDescription>Recurring invoices are now available.</AlertDescription>
</Alert>

// Toast Notification
<Toast variant="success">
  Invoice created successfully
</Toast>

// Loading Spinner
<Spinner size="md" />

// Progress Bar
<ProgressBar value={75} max={100} />

// Skeleton Loader
<Skeleton className="h-4 w-full" />
```

### Modal Dialogs

```tsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Create Invoice</ModalTitle>
    <ModalCloseButton />
  </ModalHeader>
  <ModalBody>
    {/* Form content */}
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      Create
    </Button>
  </ModalFooter>
</Modal>
```

## 📱 Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Tablets
  lg: '1024px',  // Desktops
  xl: '1280px',  // Large desktops
  '2xl': '1536px', // Extra large
}
```

### Mobile-First Approach

```tsx
// Base styles for mobile, override for larger screens
<div className="
  flex flex-col          // Mobile: vertical
  md:flex-row            // Tablet+: horizontal
  gap-4
  p-4
  md:p-6
  lg:p-8
">
  {/* Content */}
</div>
```

### Touch Targets

- Minimum touch target: 44x44px
- Adequate spacing between interactive elements
- Hover states for desktop, active states for mobile

## 🎭 Animations

### Transition Defaults

```typescript
const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
}
```

### Animation Classes

```tsx
// Fade In
<div className="animate-fade-in">
  {/* Content */}
</div>

// Slide Up
<div className="animate-slide-up">
  {/* Content */}
</div>

// Scale
<div className="animate-scale-in">
  {/* Content */}
</div>

// Pulse (for loading)
<div className="animate-pulse">
  {/* Content */}
</div>
```

### Motion Preferences

```tsx
// Respect user's reduced motion preference
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## ♿ Accessibility

### WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Text: minimum 4.5:1 ratio
   - Large text: minimum 3:1 ratio
   - UI components: minimum 3:1 ratio

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order
   - Skip links for main content

3. **Screen Reader Support**
   - Semantic HTML elements
   - ARIA labels where needed
   - Alt text for images
   - Live regions for dynamic content

4. **Form Accessibility**
   - Labels associated with inputs
   - Error messages linked via `aria-describedby`
   - Required fields indicated
   - Clear error states

### Focus States

```tsx
// Default focus ring
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"

// Custom focus ring
className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
```

## 🎨 Dark Mode

### Color Tokens

```typescript
const darkModeColors = {
  background: {
    primary: '#111827',    // gray-900
    secondary: '#1F2937',  // gray-800
    tertiary: '#374151',   // gray-700
  },
  text: {
    primary: '#F9FAFB',    // gray-50
    secondary: '#D1D5DB',  // gray-300
    muted: '#9CA3AF',      // gray-400
  },
  border: '#374151',       // gray-700
}
```

### Implementation

```tsx
// Tailwind dark mode class
<html className="dark">
  <body className="bg-background-primary text-text-primary">
    {/* Content */}
  </body>
</html>

// Component-level dark mode
<div className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
```

## 📊 Data Visualization

### Chart Colors

```typescript
const chartColors = [
  '#6366F1', // Primary
  '#10B981', // Success
  '#F59E0B', // Warning
  '#EF4444', // Error
  '#3B82F6', // Info
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
]
```

### Chart Components

```tsx
// Line Chart
<LineChart
  data={monthlyRevenue}
  xKey="month"
  yKey="revenue"
  color={colors.primary[500]}
/>

// Bar Chart
<BarChart
  data={expenseByCategory}
  xKey="category"
  yKey="amount"
  colors={chartColors}
/>

// Pie Chart
<PieChart
  data={revenueByClient}
  labelKey="client"
  valueKey="amount"
  colors={chartColors}
/>
```

## 🧪 Component Testing

### Visual Regression

```tsx
// Storybook stories for each component
export const PrimaryButton = {
  args: {
    children: 'Click Me',
    variant: 'primary',
  },
}

export const PrimaryButtonDisabled = {
  args: {
    children: 'Click Me',
    variant: 'primary',
    disabled: true,
  },
}
```

### Accessibility Testing

```tsx
// axe-core integration
import { axe } from 'jest-axe'

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Click</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Maintained By**: Design Team
