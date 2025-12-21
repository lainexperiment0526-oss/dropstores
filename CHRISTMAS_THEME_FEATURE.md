# Christmas Theme Toggle Feature

## Overview
Added a Christmas theme toggle switch in the navigation bar that controls the splash screen Christmas decorations.

## Features Added

### 1. **Navbar Toggle Switch** (Desktop & Mobile)
- **Location**: Top navigation bar
- **Icon**: Snowflake ❄️
- **Label**: "Christmas"
- **State**: Synced with localStorage

### 2. **Visual Indicators**
- **Enabled**: Blue snowflake icon + toast "🎄 Christmas theme enabled!"
- **Disabled**: Gray snowflake icon + toast "Christmas theme disabled"

### 3. **Splash Screen Integration**
- Christmas theme already exists in SplashScreen.tsx
- Reads from `localStorage.getItem('dropstore-christmas-theme')`
- Default: Enabled (true)

## What the Christmas Theme Includes

When **enabled**, the splash screen shows:
- 🎄 **Background**: Red-to-sky-blue-to-green gradient
- ❄️ **Snowflakes**: Animated in corners (pulsing opacity)
- 🎄 **Christmas Trees**: Animated bouncing
- ⛄ **Snowman**: Rotating animation at top
- 🎅 **Santa**: Scaling animation at bottom

When **disabled**, the splash screen shows:
- **Background**: Default primary gradient
- **No decorations**: Clean, standard loading screen

## User Experience

### Desktop View:
```
[Logo] Drop Store    Features Templates Pricing Admin    [❄️ Christmas 🔘] [Sign In] [Start Free]
```

### Mobile Menu:
```
☰ Menu
├── Features
├── Templates  
├── Pricing
├── Admin
├── ─────────────
├── ❄️ Christmas Theme [🔘]
├── ─────────────
├── [Sign In]
└── [Start Free]
```

## Technical Details

### localStorage Key
```typescript
'dropstore-christmas-theme' // stores boolean (true/false)
```

### State Management
```typescript
const [christmasTheme, setChristmasTheme] = useState(() => {
  const saved = localStorage.getItem('dropstore-christmas-theme');
  return saved !== null ? JSON.parse(saved) : true; // Default: enabled
});
```

### Toggle Function
```typescript
const toggleChristmasTheme = () => {
  const newValue = !christmasTheme;
  setChristmasTheme(newValue);
  localStorage.setItem('dropstore-christmas-theme', JSON.stringify(newValue));
  toast.success(newValue ? '🎄 Christmas theme enabled!' : 'Christmas theme disabled');
};
```

## Files Modified

1. **src/components/landing/Navbar.tsx**
   - Added Switch component import
   - Added Snowflake icon import
   - Added toast import from 'sonner'
   - Added christmasTheme state
   - Added toggleChristmasTheme function
   - Added toggle switch to desktop navigation
   - Added toggle switch to mobile menu

2. **src/components/SplashScreen.tsx**
   - Already had Christmas theme support
   - No changes needed

## Usage

Users can now:
1. Visit the home page
2. See the toggle switch in the navbar (❄️ Christmas)
3. Click to enable/disable Christmas decorations
4. Preference is saved and persists across sessions
5. On next visit, splash screen shows their preference

## Seasonal Tip

This toggle can be:
- **Hidden after holidays**: Add date check to only show in December
- **Auto-enabled**: Set default based on current date
- **Extended**: Add more seasonal themes (Halloween, Easter, etc.)

## Example Date-Based Auto-Enable

```typescript
const isChristmasSeason = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (11 = December)
  return month === 11; // Only December
};

const [christmasTheme, setChristmasTheme] = useState(() => {
  const saved = localStorage.getItem('dropstore-christmas-theme');
  if (saved !== null) return JSON.parse(saved);
  return isChristmasSeason(); // Auto-enable in December
});
```
