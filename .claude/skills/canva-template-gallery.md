---
name: canva-template-gallery
description: Create vibrant Canva-style template galleries and interfaces with colorful gradients, clear visual thumbnails, and playful design. Use this skill whenever the user wants template galleries, design tool interfaces, creative web apps, or any interface that should feel fun, approachable, and visually rich like Canva. Trigger when users mention "template gallery," "design templates," "colorful interface," "Canva-style," "visual picker," or want users to browse and select from multiple design options.
---

# Canva-Style Template Gallery Design

Create vibrant, user-friendly interfaces that showcase templates beautifully. Every template should be immediately visible with clear thumbnails, bold colors should make the interface feel fun and approachable, and users should instantly understand how to find and use what they need.

## Core Design Principles

### 1. Templates Are Front and Center
- **Show, don't tell.** Every template gets a visual thumbnail users can see immediately.
- Template grid is the hero of the page - takes up 70%+ of screen real estate
- Thumbnail size: minimum 200px wide on desktop, scales down gracefully on mobile
- Templates should look clickable with subtle hover effects (scale up, add shadow)
- Clear "Use Template" or "Customize" button on hover/click

### 2. Vibrant, Playful Color Palette
- **Don't be afraid of color.** Canva uses bold, saturated colors that pop.
- Primary colors: Purple `#8B3DFF`, Pink `#FF3399`, Blue `#00C4CC`, Orange `#FF6B35`
- Use gradients liberally: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Category badges with bright backgrounds: Marketing (purple), Social (pink), Presentation (blue)
- White backgrounds for template cards to make colorful thumbnails stand out
- Color-coded sections to help users navigate quickly

### 3. Clear Visual Hierarchy with Thumbnails
- **Thumbnails tell the story.** Users should understand what each template is at a glance.
- Template cards structure:
  - Large thumbnail image (aspect ratio matches actual template: 16:9, 1:1, 9:16)
  - Title below thumbnail (16px-18px, bold)
  - Optional category tag (small, colorful badge)
  - Hover state reveals "Use Template" button overlaid on thumbnail
- Grid layout: 3-4 columns on desktop, 2 on tablet, 1 on mobile
- Consistent spacing: 20px-24px gaps between cards

### 4. Search and Filter That Works
- **Help users find what they need fast.**
- Prominent search bar at top: large (50px+ height), rounded corners, placeholder text
- Category filters as colorful pills/chips that are always visible
- Filter tags: "All Templates," "Social Media," "Presentations," "Marketing," "Documents"
- Active filter state: filled background, white text
- Search results update instantly (show skeleton loading states)

### 5. Approachable Typography
- **Friendly, rounded fonts.** Not too corporate, not too casual.
- Font stack: `'Inter', 'Circular', -apple-system, sans-serif` or similar rounded sans
- Headings: 500-600 weight, friendly not intimidating
- Body text: 400 weight, 15px-16px minimum
- Avoid all-caps except for small labels
- Button text: 500-600 weight, easy to read

### 6. Fun, Smooth Interactions
- **Make it feel alive.** Micro-interactions bring joy.
- Template hover: gentle scale up (1.03-1.05), shadow appears
- Click feedback: quick scale down (0.98) then return
- Loading states: playful skeleton screens with gradient shimmer
- Page transitions: smooth fades, no jarring jumps
- Success animations: subtle confetti or checkmark for actions like "Template Added"

## Layout Patterns

### Template Gallery (Main View)
```
┌─────────────────────────────────────────┐
│  🔍 Search templates...        [Filter] │  ← Sticky header
├─────────────────────────────────────────┤
│  [All] [Social] [Marketing] [Docs] ... │  ← Category filters
├─────────────────────────────────────────┤
│                                         │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐       │  ← Template grid
│  │IMG │  │IMG │  │IMG │  │IMG │       │     (3-4 per row)
│  │    │  │    │  │    │  │    │       │
│  └────┘  └────┘  └────┘  └────┘       │
│  Title   Title   Title   Title         │
│                                         │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐       │
│  │IMG │  │IMG │  │IMG │  │IMG │       │
│  └────┘  └────┘  └────┘  └────┘       │
│                                         │
└─────────────────────────────────────────┘
```

### Template Card Specifications
```css
.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.template-thumbnail {
  width: 100%;
  aspect-ratio: 16/9; /* or 1/1, 9/16 depending on template type */
  object-fit: cover;
  position: relative;
}

.use-template-btn {
  /* Appears on hover, centered over thumbnail */
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}
```

### Search and Filter Bar
```
Height: 60px-80px
Search input: 50px height, full-width on mobile
Category pills: 36px height, horizontal scroll on mobile
Sticky position as user scrolls
White/light background with subtle shadow
```

### Sidebar Navigation (Optional)
```
Width: 280px on desktop
Categories with icons and counts
Collapsible on tablet/mobile (hamburger menu)
Background: light gradient or solid color
```

## Component Specifications

### Template Cards
- **Thumbnail**: High-quality preview image, exact aspect ratio of template
- **Title**: 16-18px, weight 600, max 2 lines with ellipsis
- **Category Badge**: Small pill (8px padding), bright background, white text
- **Use Button**: Appears on hover, gradient background, white text
- **Shadow**: Subtle default `0 2px 8px rgba(0,0,0,0.1)`, elevates on hover

### Search Bar
- **Height**: 50px minimum (thumb-friendly)
- **Border**: 2px solid light gray, becomes accent color on focus
- **Border radius**: 12px (friendly, rounded)
- **Placeholder**: "Search thousands of templates..." with icon
- **Width**: Full width or max 600px centered

### Filter Pills/Chips
- **Default**: White background, gray border, gray text
- **Active**: Gradient or solid accent color, white text
- **Hover**: Slight color change, subtle scale
- **Padding**: 10px 20px
- **Border radius**: 20px (pill shape)

### Category Badges
- **Colors**: Bright, saturated backgrounds
  - Social Media: `#FF3399` (hot pink)
  - Marketing: `#8B3DFF` (purple)
  - Presentation: `#00C4CC` (cyan)
  - Document: `#FF6B35` (orange)
- **Text**: White, 12px, 600 weight
- **Padding**: 4px 12px
- **Border radius**: 6px

### Buttons
- **Primary**: Gradient background `linear-gradient(135deg, #667eea, #764ba2)`, white text
- **Secondary**: White background, gradient border, gradient text
- **Size**: 44px height minimum, 16px-20px horizontal padding
- **Border radius**: 8-10px
- **Hover**: Brighten gradient, slight scale up

## Color System

### Primary Gradients
```css
--gradient-purple: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-pink: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--gradient-blue: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--gradient-orange: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
```

### Solid Colors
```css
--canva-purple: #8B3DFF;
--canva-pink: #FF3399;
--canva-blue: #00C4CC;
--canva-orange: #FF6B35;
--canva-green: #00BFA6;

--text-primary: #2E2E2E;
--text-secondary: #6B6B6B;
--bg-light: #FAFAFA;
--bg-white: #FFFFFF;
--border-gray: #E0E0E0;
```

### Category Color Mapping
```
Social Media → Pink (#FF3399)
Marketing → Purple (#8B3DFF)
Presentations → Blue (#00C4CC)
Documents → Orange (#FF6B35)
Videos → Green (#00BFA6)
```

## Technical Implementation

### React Component Structure
```jsx
const TemplateGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  return (
    <div className="gallery-container">
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <CategoryFilters active={activeCategory} onChange={setActiveCategory} />
      <TemplateGrid 
        templates={filteredTemplates} 
        category={activeCategory}
      />
    </div>
  );
};

const TemplateCard = ({ template }) => (
  <div className="template-card">
    <div className="thumbnail-wrapper">
      <img src={template.thumbnail} alt={template.title} />
      <button className="use-template-btn">
        Use Template
      </button>
    </div>
    <div className="card-info">
      <span className="category-badge">{template.category}</span>
      <h3>{template.title}</h3>
    </div>
  </div>
);
```

### CSS Example (Vibrant Cards)
```css
.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.template-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.thumbnail-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.template-card:hover img {
  transform: scale(1.05);
}

.use-template-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.template-card:hover .use-template-btn {
  opacity: 1;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: var(--canva-purple);
  margin-bottom: 8px;
}
```

### Loading States
```css
.skeleton-card {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## Template Categories to Display

When building Canva-style galleries, ensure these template types are **clearly visible with thumbnails**:

### 1. Social Media Templates
- Instagram Post (1:1)
- Instagram Story (9:16)
- Facebook Post (1:1)
- LinkedIn Post (1200x627)
- Twitter Header (3:1)
- Pinterest Pin (2:3)

### 2. Marketing Materials
- Flyers (8.5x11)
- Posters (18x24)
- Business Cards (3.5x2)
- Brochures (tri-fold)
- Email Headers

### 3. Presentations
- Pitch Decks (16:9)
- Reports (16:9)
- Infographics (portrait)
- Slide Templates

### 4. Documents
- Resumes
- Letters
- Certificates
- Invitations
- Menus

## Quality Checklist

Before considering the gallery complete:

- [ ] Every template has a clear, high-quality thumbnail
- [ ] Thumbnails are sized appropriately (not stretched or distorted)
- [ ] Grid layout shows 3-4 templates per row on desktop
- [ ] Hover effects are smooth and feel playful
- [ ] Search bar is prominent and easy to find
- [ ] Category filters are colorful and clearly labeled
- [ ] Colors are vibrant and match Canva's playful aesthetic
- [ ] Loading states show skeleton screens (not blank/broken)
- [ ] Mobile layout adapts gracefully (2 columns → 1 column)
- [ ] "Use Template" buttons appear clearly on hover
- [ ] Templates are organized by category
- [ ] Gradient buttons look polished and modern
- [ ] All interactive elements have hover states

## Anti-Patterns to Avoid

❌ **Don't:**
- Hide templates behind tabs or accordions
- Use small, hard-to-see thumbnails
- Make users click to see what a template looks like
- Use muted, corporate colors
- Create a text-heavy interface
- Make search/filter hard to find
- Use generic placeholder images
- Forget hover states on cards
- Create confusing category systems
- Use too many fonts or styles

✅ **Do:**
- Show as many templates as possible on first screen
- Make thumbnails large and clear
- Use bright, happy colors
- Create obvious visual hierarchy (thumbnails > text)
- Make search instantly accessible
- Add playful micro-interactions
- Use actual template previews as thumbnails
- Organize by clear, simple categories
- Make "Use Template" action unmissable
- Test on mobile devices

## Example: Building a Canva-Style Template Gallery

When the user asks for a template gallery or design interface:

1. **Start with the grid**: 3-4 column responsive grid of template cards
2. **Add search + filters at top**: Sticky header with large search bar and colorful category pills
3. **Design template cards**: White background, large thumbnail, title below, category badge, hover reveals "Use Template" button
4. **Use vibrant colors**: Gradients for buttons, bright colors for categories, colorful accents
5. **Show real previews**: Template thumbnails should look like actual templates, not generic placeholders
6. **Add smooth interactions**: Hover scale-up, click feedback, loading skeletons
7. **Make it responsive**: Mobile shows 1 column, tablet shows 2, desktop shows 3-4

Remember: The goal is to make users feel excited and inspired by all the beautiful templates available. Every template should be immediately visible and clickable. The interface should feel fun, friendly, and easy to use - like Canva!

