# Voice Commands - Testing Examples

This document provides example voice commands to test with your Freezer Genie app.

## Query Commands to Test

### Inventory Check Queries
Test these phrases to check if items exist:

```
✓ "Do I have pork chops?"
✓ "Do I have any chicken?"
✓ "Is there beef in my freezer?"
✓ "Have I got any lamb?"
✓ "Do I have peas?"
✓ "Is there fish in the freezer?"
```

**Expected Result:** Shows a dialog with matching items or "not found" message

### Category Browse Queries
Test these to browse by category:

```
✓ "What vegetables are in my freezer?"
✓ "What kind of meat do I have?"
✓ "What fruits are in my freezer?"
✓ "What desserts do I have?"
✓ "What kind of fish do I have?"
✓ "What dairy items are in my freezer?"
✓ "Show me my frozen goods"
```

**Expected Result:** Shows all items in that category

### Quantity Queries
Test these to check quantities:

```
✓ "How much chicken do I have?"
✓ "How many bags of peas?"
✓ "How much beef is in the freezer?"
```

**Expected Result:** Shows total quantity across all matching items

## Add Commands to Test

### Simple Add
```
✓ "Add chicken"
✓ "Add pork chops"
✓ "Add a bag of peas"
✓ "Add beef"
✓ "Add ice cream"
```

**Expected Result:** Navigates to Add Item form with name pre-filled

### Add with Quantity
```
✓ "Add 2 bags of peas"
✓ "Add 3 pounds of beef"
✓ "Add 5 packages of chicken"
✓ "Add 1 box of fish sticks"
```

**Expected Result:** Navigates to Add Item form with name and quantity pre-filled

### Add with Units
```
✓ "Add 1 lb of ground beef"
✓ "Add 2 kg of fish"
✓ "Add 500 grams of shrimp"
✓ "Add 3 ounces of salmon"
✓ "Add a package of hot dogs"
```

**Expected Result:** Navigates to Add Item form with name, quantity, and unit pre-filled

## Navigation Commands to Test

```
✓ "Go home"
✓ "Show inventory"
✓ "Show alerts"
✓ "Show shopping list"
✓ "Show recipes"
✓ "Open settings"
```

**Expected Result:** Navigates to the specified section

## Search Commands to Test

```
✓ "Search for chicken"
✓ "Find pork"
✓ "Search beef"
```

**Expected Result:** Filters inventory view to show matching items

## Edge Cases to Test

### Multiple Word Items
```
✓ "Do I have pork chops?"
✓ "Do I have green beans?"
✓ "Add chicken wings"
✓ "Add ice cream"
```

### Variations in Phrasing
```
✓ "Do I have pork chops in my freezer?"
✓ "Do I have any pork chops?"
✓ "Is there pork chops?"
✓ "Have I got pork chops?"
```

All should work identically!

### Category Variations
```
✓ "What vegetables do I have?"
✓ "What vegetables are in my freezer?"
✓ "What kind of vegetables?"
✓ "Show me vegetables"
```

### Add Variations
```
✓ "Add peas to my freezer"
✓ "Add peas to the freezer"
✓ "Add a bag of peas"
✓ "Add 1 bag of peas"
```

## Commands That Should Show "Didn't Understand"

These are intentionally not supported (yet):

```
✗ "Delete chicken"
✗ "Remove pork chops"
✗ "Use 2 bags of peas"
✗ "Mark chicken as expired"
✗ "Move beef to bottom shelf"
```

## Testing Checklist

- [ ] Test at least 5 different "Do I have..." queries
- [ ] Test at least 3 different "What [category]..." queries  
- [ ] Test at least 3 "Add [item]" commands
- [ ] Test at least 2 "Add [quantity] [unit] of [item]" commands
- [ ] Test all navigation commands
- [ ] Test search command
- [ ] Verify microphone permissions work
- [ ] Test on iOS Safari (if available)
- [ ] Test voice feedback/toasts display correctly
- [ ] Verify results dialog shows matching items
- [ ] Verify clicking items in results opens detail view
- [ ] Verify add form pre-fills correctly from voice

## Debugging Voice Recognition

If commands aren't working:

1. **Check the transcript**: Look at what the browser actually heard
2. **Check console**: Open browser dev tools to see command processing
3. **Try simpler phrases**: Start with "Do I have chicken" before complex queries
4. **Speak clearly**: Enunciate each word
5. **Check permissions**: Ensure microphone access is granted

## Known Limitations

1. Speech recognition quality depends on:
   - Browser support
   - Microphone quality
   - Background noise
   - Accent/pronunciation

2. The app uses pattern matching, so very unusual phrasings may not work

3. Continuous listening is not yet supported - one command at a time

## Voice Command Grammar Reference

### Query Pattern
```
(do I have | is there | have I got) [any] <item> [in my/the freezer]
```

### Category Pattern
```
what [kind of] <category> (do I have | are in | is in) [my/the freezer]
```

### Add Pattern
```
add [a/an/one] [<quantity>] [<unit>] [of] <item> [to my/the freezer]
```

### Quantity Pattern
```
how (much | many) <item> [do I have] [in my/the freezer]
```

---

**Remember:** Voice control works best when you speak naturally and clearly. The app is designed to understand conversational language!

