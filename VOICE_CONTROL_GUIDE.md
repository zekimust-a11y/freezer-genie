# Voice Control Guide for Freezer Genie

## Overview

Freezer Genie now features advanced voice control powered by the Web Speech API, allowing you to interact with your freezer inventory hands-free. This works with Siri on iOS Safari and voice commands on other platforms.

## Accessing Voice Control

1. Open Freezer Genie in your web browser (Safari on iOS for Siri support)
2. Grant microphone permissions when prompted
3. Tap the microphone icon (🎤) in the top header
4. Speak your command clearly
5. Wait for the app to process and respond

## Voice Command Types

### 1. Query Commands - Check What You Have

Ask natural questions about your freezer inventory:

#### Check if you have an item:
- "Do I have pork chops?"
- "Do I have any chicken?"
- "Is there beef in my freezer?"
- "Have I got any lamb?"

#### Browse by category:
- "What vegetables are in my freezer?"
- "What kind of meat do I have?"
- "What fruit is in my freezer?"
- "What desserts are in my freezer?"
- "Show me my dairy items"

#### Check quantities:
- "How much chicken do I have?"
- "How many bags of peas?"

**Response:** The app will display results in a popup dialog showing:
- Whether the item exists
- How many matching items were found
- A list of all matching items with details
- Quick access to view/edit items

### 2. Add Commands - Add Items to Freezer

Add items using natural language:

#### Simple add:
- "Add chicken"
- "Add a bag of peas"
- "Add pork chops"

#### Add with quantity:
- "Add 2 bags of peas"
- "Add 3 pounds of beef"
- "Add 5 packages of chicken"

#### Add with units:
- "Add 1 lb of ground beef"
- "Add 2 kg of fish"
- "Add 500 grams of shrimp"

**Supported units:**
- bag, box, package/pack
- pound/lb, kilogram/kg
- ounce/oz, gram/g

**Response:** The app will navigate to the Add Item page with pre-filled information:
- Item name automatically filled
- Quantity set (if specified)
- Unit set (if specified)
- Ready for you to add any additional details

### 3. Search Commands

Search your inventory:
- "Search for chicken"
- "Find pork"

### 4. Navigation Commands

Navigate to different sections:
- "Go home" - Return to inventory
- "Show alerts" - View expiring items
- "Show shopping list" - View low stock items
- "Show recipes" - View recipe suggestions
- "Open settings" - View app settings

## Category Mapping

The voice assistant understands these category keywords:

| Category | Keywords |
|----------|----------|
| **Meat & Fish** | meat, meats, fish, chicken, beef, pork, lamb, seafood, protein |
| **Produce** | vegetable, vegetables, veggie, veggies, fruit, fruits, produce |
| **Prepared Meals** | meal, meals, dinner, lunch |
| **Desserts** | dessert, desserts, sweet, sweets, cake, cakes |
| **Bread** | bread, breads, baked goods |
| **Dairy** | dairy, milk, cheese, butter, yogurt |
| **Frozen Goods** | frozen, pizza, pizzas |

## Tips for Best Results

1. **Speak Clearly:** Enunciate your words for better recognition
2. **Be Specific:** "pork chops" is better than just "pork"
3. **Use Natural Language:** The system understands conversational phrases
4. **Wait for Processing:** Give the app a moment to process your command
5. **Check Permissions:** Ensure microphone access is granted in your browser
6. **Quiet Environment:** Works best without background noise

## Browser Compatibility

### Full Support:
- **iOS Safari** - Works with Siri and system voice recognition
- **Chrome (Desktop)** - Google's speech recognition
- **Edge (Desktop)** - Microsoft's speech recognition

### Limited/No Support:
- Firefox - Limited speech API support
- Older browsers - May not support Web Speech API

## Troubleshooting

### Voice control button doesn't appear:
- Your browser may not support the Web Speech API
- Try using Chrome, Safari, or Edge

### "Microphone access denied" error:
1. Check browser permissions for microphone access
2. On iOS: Settings > Safari > Microphone > Allow
3. On Chrome: Site settings > Microphone > Allow

### "No speech detected" error:
- Speak louder or move closer to the microphone
- Ensure microphone isn't muted
- Check system microphone permissions

### Commands not understood:
- Speak more clearly
- Try rephrasing your command
- Use one of the example commands above
- Check that you're in a quiet environment

## Privacy & Security

- Voice commands are processed using your browser's built-in speech recognition
- On iOS Safari, this uses Apple's Siri technology
- Speech data is processed according to your device's privacy settings
- No audio is stored or sent to Freezer Genie servers
- All voice recognition happens on-device or through your OS provider

## Examples in Action

### Example 1: Checking Inventory
**You:** "Do I have any pork chops?"

**App:** 
- Shows toast: "🎤 Voice Query"
- Opens dialog: "Yes, you have 2 items matching 'pork chops'"
- Lists all matching items with quantities and expiry dates

### Example 2: Adding Items
**You:** "Add a bag of peas to the freezer"

**App:**
- Shows toast: "🎤 Adding Item - Adding 1 bag of peas"
- Navigates to Add Item page
- Pre-fills: Name: "peas", Quantity: "1", Unit: "bag"
- You can adjust category and other details

### Example 3: Category Browse
**You:** "What vegetables are in my freezer?"

**App:**
- Shows toast: "🎤 Voice Query"
- Opens dialog: "You have 5 vegetable items"
- Lists: Peas, Corn, Green Beans, Carrots, Broccoli
- Tap any item to view/edit details

## Advanced Usage

### Chaining Commands
While you can't chain multiple commands in one voice input, you can:
1. Use voice to query: "What vegetables do I have?"
2. Review results in dialog
3. Tap voice button again to add: "Add carrots"

### Multiple Freezers
If you have multiple freezers configured:
- Voice queries search all freezers
- Results show which freezer contains each item
- When adding items, they go to your default freezer
- You can change the freezer in the Add Item form

## Future Enhancements

Planned voice features:
- "Remove [item]" - Delete items by voice
- "Update [item] quantity to [number]" - Modify quantities
- "Mark [item] as used" - Quick consumption tracking
- Continuous listening mode
- Custom wake words
- Voice shortcuts integration

## Feedback

Found a voice command that should work but doesn't? Have suggestions for new voice commands? Please reach out through the app settings or GitHub issues.

---

**Last Updated:** December 2025  
**Voice Control Version:** 2.0  
**Supported Platforms:** iOS Safari (Siri), Chrome, Edge

