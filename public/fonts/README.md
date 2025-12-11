# Custom Fonts

This directory is where you should place your custom font files for **Privé à la Carte**.

## ⚠️ Important: Add Your Font Files Before Building

**The app is configured to use custom fonts, but the font files must exist before you build or run the app.**

If you haven't uploaded your fonts yet, you have two options:

1. **Upload your font files now** (recommended) - See instructions below
2. **Temporarily use system fonts** - Comment out the custom font configuration in `app/layout.tsx` and use a system font instead

## Supported Font Formats

- `.woff2` (recommended - best compression)
- `.woff`
- `.ttf`
- `.otf`

## How to Add Your Custom Font

1. **Upload your font files** to this directory (`public/fonts/`)

2. **Update the font configuration** in `app/layout.tsx` if needed:
   - The default configuration looks for `font.woff2` and `font-bold.woff2`
   - If your files have different names, update the paths in `layout.tsx`
   - Adjust weights (400 for normal, 700 for bold, etc.) as needed
   - Add additional weights/styles if you have them

3. **Example font file structure:**
   ```
   public/fonts/
   ├── font.woff2          (regular weight - 400)
   ├── font-bold.woff2     (bold weight - 700)
   └── font-mono.woff2     (monospace, optional)
   ```

4. **Font naming:**
   - You can use any naming convention you prefer
   - Just make sure to update the paths in `app/layout.tsx` to match your file names
   - The default expects: `font.woff2` and `font-bold.woff2`

## Current Configuration

The app is currently configured to look for:
- `font.woff2` (weight: 400, normal)
- `font-bold.woff2` (weight: 700, bold)

**If your font files have different names, update the paths in `app/layout.tsx`.**

## Font Optimization

Next.js automatically optimizes fonts when using `next/font/local`. The fonts will be:
- Self-hosted (no external requests)
- Optimized and compressed
- Loaded with `display: swap` for better performance

## Need Help?

If you need to add multiple font weights or styles, you can add more entries to the `src` array in `app/layout.tsx`:

```typescript
const customFont = localFont({
  src: [
    { path: "../../public/fonts/font-light.woff2", weight: "300" },
    { path: "../../public/fonts/font.woff2", weight: "400" },
    { path: "../../public/fonts/font-medium.woff2", weight: "500" },
    { path: "../../public/fonts/font-bold.woff2", weight: "700" },
  ],
  variable: "--font-custom",
});
```

