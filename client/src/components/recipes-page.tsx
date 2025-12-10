import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, ChefHat, Sparkles, Heart, Share2, Mail, MessageCircle, Copy, CheckCheck } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { FreezerItem, Category, MeatSubcategory, ProduceSubcategory, PreparedMealsSubcategory, FrozenGoodsSubcategory, DessertsSubcategory } from "@shared/schema";
import { categories, meatSubcategories, produceSubcategories, preparedMealsSubcategories, frozenGoodsSubcategories, dessertsSubcategories } from "@shared/schema";
import { getCategoryConfig, getCategoryLabel, meatSubcategoryConfig, produceSubcategoryConfig, preparedMealsSubcategoryConfig, frozenGoodsSubcategoryConfig, dessertsSubcategoryConfig } from "@/components/category-icon";
import { getVisibleCategories, getCustomCategories, getHiddenCategories } from "@/components/settings-panel";

interface RecipesPageProps {
  items: FreezerItem[];
}

function extractIngredientName(itemName: string): string {
  const name = itemName.toLowerCase();
  const words = name.split(/\s+/);
  
  const skipWords = ["diced", "sliced", "frozen", "fresh", "organic", "free-range", "minced", "chopped", "whole", "fillets", "breast", "thigh", "leg", "wing"];
  const filtered = words.filter(w => !skipWords.includes(w));
  
  return filtered.join(" ").trim() || itemName;
}

function extractIngredientTokens(itemName: string): string[] {
  const name = itemName.toLowerCase();
  const tokens: string[] = [];
  
  // Protein matches
  if (name.includes("chicken")) tokens.push("chicken");
  if (name.includes("beef") || name.includes("steak") || name.includes("sirloin")) tokens.push("beef");
  if (name.includes("pork chop")) tokens.push("pork chops");
  if (name.includes("minced pork") || name.includes("pork mince")) tokens.push("minced pork");
  if (name.includes("sausage")) tokens.push("sausage");
  if (name.includes("bacon")) tokens.push("bacon");
  if (name.includes("pork") || name.includes("sausage") || name.includes("bacon")) tokens.push("pork");
  if (name.includes("lamb")) tokens.push("lamb");
  if (name.includes("fish") || name.includes("cod") || name.includes("salmon") || name.includes("haddock") || name.includes("trout")) tokens.push("fish");
  if (name.includes("prawn") || name.includes("shrimp") || name.includes("seafood")) tokens.push("seafood");
  if (name.includes("duck") || name.includes("turkey")) tokens.push("poultry");
  
  // Vegetables
  if (name.includes("pea") || name.includes("carrot") || name.includes("broccoli") || name.includes("spinach") || 
      name.includes("corn") || name.includes("bean") || name.includes("vegetable")) tokens.push("vegetables");
  if (name.includes("potato") || name.includes("chips") || name.includes("fries")) tokens.push("potato");
  if (name.includes("onion")) tokens.push("onion");
  
  // Fruits
  if (name.includes("berry") || name.includes("blueberry") || name.includes("strawberry") || name.includes("raspberry")) tokens.push("berries");
  if (name.includes("fruit") || name.includes("mango") || name.includes("banana")) tokens.push("fruit");
  
  // Dairy & other
  if (name.includes("cheese") || name.includes("butter")) tokens.push("dairy");
  if (name.includes("stock") || name.includes("broth")) tokens.push("stock");
  if (name.includes("bread") || name.includes("loaf") || name.includes("roll")) tokens.push("bread");
  if (name.includes("pizza")) tokens.push("pizza");
  if (name.includes("pastry") || name.includes("filo") || name.includes("puff")) tokens.push("pastry");
  if (name.includes("ice cream") || name.includes("icecream")) tokens.push("ice cream");
  if (name.includes("soup")) tokens.push("soup");
  if (name.includes("pasta") || name.includes("lasagne") || name.includes("spaghetti")) tokens.push("pasta");
  
  return tokens;
}

function generateBBCGoodFoodUrl(ingredient: string): string {
  const encoded = encodeURIComponent(ingredient.trim());
  return `https://www.bbcgoodfood.com/search?q=${encoded}`;
}

function generateMultiIngredientUrl(ingredients: string[]): string {
  const query = ingredients.slice(0, 3).join(" ");
  return generateBBCGoodFoodUrl(query);
}

const popularRecipeIdeas = [
  { name: "Chicken stir fry", requiredTokens: ["chicken"], allIngredients: ["chicken", "vegetables", "soy sauce", "garlic"], url: "https://www.bbcgoodfood.com/search?q=chicken+stir+fry", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=100&h=100&fit=crop" },
  { name: "Chicken curry", requiredTokens: ["chicken"], allIngredients: ["chicken", "onion", "curry paste", "coconut milk"], url: "https://www.bbcgoodfood.com/search?q=chicken+curry", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&h=100&fit=crop" },
  { name: "Roast chicken", requiredTokens: ["chicken"], allIngredients: ["chicken", "potatoes", "carrots", "herbs"], url: "https://www.bbcgoodfood.com/search?q=roast+chicken", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=100&h=100&fit=crop" },
  { name: "Fish pie", requiredTokens: ["fish"], allIngredients: ["fish", "prawns", "potatoes", "cream"], url: "https://www.bbcgoodfood.com/search?q=fish+pie", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=100&h=100&fit=crop" },
  { name: "Fish and chips", requiredTokens: ["fish"], allIngredients: ["fish", "potatoes", "flour", "oil"], url: "https://www.bbcgoodfood.com/search?q=fish+and+chips", image: "https://images.unsplash.com/photo-1576777647209-e8733d7b851d?w=100&h=100&fit=crop" },
  { name: "Baked cod", requiredTokens: ["fish"], allIngredients: ["cod", "lemon", "herbs", "butter"], url: "https://www.bbcgoodfood.com/search?q=baked+cod", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&h=100&fit=crop" },
  { name: "Beef casserole", requiredTokens: ["beef"], allIngredients: ["beef", "carrots", "onion", "stock"], url: "https://www.bbcgoodfood.com/search?q=beef+casserole", image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=100&h=100&fit=crop" },
  { name: "Beef stew", requiredTokens: ["beef"], allIngredients: ["beef", "potatoes", "carrots", "peas"], url: "https://www.bbcgoodfood.com/search?q=beef+stew", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=100&h=100&fit=crop" },
  { name: "Steak and chips", requiredTokens: ["beef"], allIngredients: ["steak", "potatoes", "butter", "herbs"], url: "https://www.bbcgoodfood.com/search?q=steak+and+chips", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=100&h=100&fit=crop" },
  { name: "Bolognese", requiredTokens: ["beef"], allIngredients: ["minced beef", "tomatoes", "onion", "pasta"], url: "https://www.bbcgoodfood.com/search?q=spaghetti+bolognese", image: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=100&h=100&fit=crop" },
  { name: "Shepherd's pie", requiredTokens: ["lamb"], allIngredients: ["lamb", "potatoes", "carrots", "peas"], url: "https://www.bbcgoodfood.com/search?q=shepherds+pie", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=100&h=100&fit=crop" },
  { name: "Lamb stew", requiredTokens: ["lamb"], allIngredients: ["lamb", "potatoes", "carrots", "stock"], url: "https://www.bbcgoodfood.com/search?q=lamb+stew", image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=100&h=100&fit=crop" },
  { name: "Pork chops", requiredTokens: ["pork chops"], allIngredients: ["pork chops", "apples", "sage", "butter"], url: "https://www.bbcgoodfood.com/search?q=pork+chops", image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=100&h=100&fit=crop" },
  { name: "Sausage casserole", requiredTokens: ["sausage"], allIngredients: ["sausages", "beans", "tomatoes", "onion"], url: "https://www.bbcgoodfood.com/search?q=sausage+casserole", image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=100&h=100&fit=crop" },
  { name: "Pork mince stir fry", requiredTokens: ["minced pork"], allIngredients: ["minced pork", "vegetables", "soy sauce", "ginger"], url: "https://www.bbcgoodfood.com/search?q=pork+mince+stir+fry", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=100&h=100&fit=crop" },
  { name: "Prawn stir fry", requiredTokens: ["seafood"], allIngredients: ["prawns", "vegetables", "soy sauce", "ginger"], url: "https://www.bbcgoodfood.com/search?q=prawn+stir+fry", image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=100&h=100&fit=crop" },
  { name: "Garlic prawns", requiredTokens: ["seafood"], allIngredients: ["prawns", "garlic", "butter", "parsley"], url: "https://www.bbcgoodfood.com/search?q=garlic+prawns", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=100&h=100&fit=crop" },
  { name: "Vegetable soup", requiredTokens: ["vegetables"], allIngredients: ["vegetables", "stock", "onion", "herbs"], url: "https://www.bbcgoodfood.com/search?q=vegetable+soup", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop" },
  { name: "Vegetable stir fry", requiredTokens: ["vegetables"], allIngredients: ["vegetables", "soy sauce", "garlic", "ginger"], url: "https://www.bbcgoodfood.com/search?q=vegetable+stir+fry", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=100&h=100&fit=crop" },
  { name: "Berry smoothie", requiredTokens: ["berries"], allIngredients: ["berries", "yogurt", "honey", "milk"], url: "https://www.bbcgoodfood.com/search?q=berry+smoothie", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=100&h=100&fit=crop" },
  { name: "Berry crumble", requiredTokens: ["berries"], allIngredients: ["berries", "flour", "butter", "sugar"], url: "https://www.bbcgoodfood.com/search?q=berry+crumble", image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=100&h=100&fit=crop" },
  { name: "Duck a l'orange", requiredTokens: ["poultry"], allIngredients: ["duck", "orange", "stock", "butter"], url: "https://www.bbcgoodfood.com/search?q=duck+a+l+orange", image: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=100&h=100&fit=crop" },
  { name: "Roast duck", requiredTokens: ["poultry"], allIngredients: ["duck", "potatoes", "herbs", "orange"], url: "https://www.bbcgoodfood.com/search?q=roast+duck", image: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=100&h=100&fit=crop" },
];

const FAVORITES_STORAGE_KEY = "freezer-app-favorite-recipes";

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

export function RecipesPage({ items }: RecipesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = (recipeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(recipeName) 
        ? prev.filter(f => f !== recipeName)
        : [...prev, recipeName]
    );
  };

  const isFavorite = (recipeName: string) => favorites.includes(recipeName);

  const generateRecipesText = () => {
    const favRecipes = popularRecipeIdeas.filter(r => favorites.includes(r.name));
    if (favRecipes.length === 0) return "";
    
    const header = "My Saved Recipes:\n\n";
    const recipeLines = favRecipes.map(recipe => 
      `- ${recipe.name}\n  Ingredients: ${recipe.allIngredients.join(", ")}\n  Recipe: ${recipe.url}`
    ).join("\n\n");
    
    return header + recipeLines;
  };

  const handleShareRecipes = async () => {
    const text = generateRecipesText();
    if (!text) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Saved Recipes",
          text: text,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleCopyRecipes = async () => {
    const text = generateRecipesText();
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleEmailRecipes = () => {
    const text = generateRecipesText();
    if (!text) return;
    
    const subject = encodeURIComponent("My Saved Recipes");
    const body = encodeURIComponent(text);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleWhatsAppRecipes = () => {
    const text = generateRecipesText();
    if (!text) return;
    
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleSMSRecipes = () => {
    const text = generateRecipesText();
    if (!text) return;
    
    const encoded = encodeURIComponent(text);
    window.open(`sms:?body=${encoded}`, "_blank");
  };
  
  const visibleCategories = getVisibleCategories();
  const customCategories = getCustomCategories();
  const hiddenCategories = getHiddenCategories();
  const visibleCustomCategories = customCategories.filter(c => !hiddenCategories.includes(c.id as Category));

  const ingredientsList = useMemo(() => {
    const ingredients = items.map(item => ({
      id: item.id,
      name: item.name,
      searchName: extractIngredientName(item.name),
      category: item.category,
      subCategory: item.subCategory,
    }));
    
    const uniqueIngredients = ingredients.reduce((acc, curr) => {
      const existing = acc.find(i => i.searchName.toLowerCase() === curr.searchName.toLowerCase());
      if (!existing) {
        acc.push(curr);
      }
      return acc;
    }, [] as typeof ingredients);

    return uniqueIngredients;
  }, [items]);

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategory: string) => {
    setSelectedSubcategory(selectedSubcategory === subcategory ? null : subcategory);
  };

  const availableTokens = useMemo(() => {
    const tokens = new Set<string>();
    items.forEach(item => {
      extractIngredientTokens(item.name).forEach(token => tokens.add(token));
    });
    return tokens;
  }, [items]);

  const matchingRecipes = useMemo(() => {
    return popularRecipeIdeas.filter(recipe => 
      recipe.requiredTokens.every(token => availableTokens.has(token))
    );
  }, [availableTokens]);

  // Check if an ingredient from recipe matches freezer inventory
  const isIngredientInFreezer = (ingredient: string): boolean => {
    const lowerIngredient = ingredient.toLowerCase();
    // Check if ingredient matches any token extracted from freezer items
    if (availableTokens.has(lowerIngredient)) {
      return true;
    }
    // Compound items that should not match their component words
    const compoundExclusions: Record<string, string[]> = {
      "ice cream": ["cream", "ice"],
      "cream cheese": ["cream"],
    };
    // Check for item name matches
    return items.some(item => {
      const itemName = item.name.toLowerCase();
      // Check if this is a compound item that excludes the ingredient
      for (const [compound, excluded] of Object.entries(compoundExclusions)) {
        if (itemName.includes(compound) && excluded.includes(lowerIngredient)) {
          return false;
        }
      }
      const itemWords = itemName.split(/\s+/);
      // Match if ingredient equals any word in item name (for "prawns" in "King prawns")
      // Or if item name starts with ingredient (for "chicken" in "Chicken breast")
      // Or exact match
      return itemWords.includes(lowerIngredient) ||
        (itemName === lowerIngredient) ||
        (itemName.startsWith(lowerIngredient + " ")) ||
        (itemName.endsWith(" " + lowerIngredient));
    });
  };

  const filteredIngredients = useMemo(() => {
    let filtered = ingredientsList;
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(ing => ing.category === selectedCategory);
    }
    
    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(ing => ing.subCategory === selectedSubcategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ing => 
        ing.name.toLowerCase().includes(query) || 
        ing.searchName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [ingredientsList, searchQuery, selectedCategory, selectedSubcategory]);

  const topIngredients = ingredientsList.slice(0, 5);

  const favoriteRecipes = useMemo(() => {
    return popularRecipeIdeas.filter(recipe => favorites.includes(recipe.name));
  }, [favorites]);

  return (
    <div className="p-4 space-y-4 pb-32">
      {favoriteRecipes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              Saved Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {favoriteRecipes.map((recipe) => (
                <div
                  key={recipe.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover-elevate text-left w-full cursor-pointer"
                  onClick={() => window.open(recipe.url, "_blank")}
                  data-testid={`button-saved-recipe-${recipe.name.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <img 
                    src={recipe.image} 
                    alt={recipe.name}
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm">{recipe.name}</span>
                    <p className="text-xs mt-0.5 flex flex-wrap gap-1">
                      {recipe.allIngredients.map((ing) => (
                        <span 
                          key={ing}
                          className={isIngredientInFreezer(ing) 
                            ? "bg-primary/20 text-primary font-medium px-1.5 py-0.5 rounded" 
                            : "text-muted-foreground"
                          }
                        >
                          {ing}
                        </span>
                      ))}
                    </p>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(recipe.name, e)}
                    className="p-1.5 rounded-full hover:bg-background/50 transition-colors flex-shrink-0"
                    data-testid={`button-unsave-${recipe.name.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </button>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Share saved recipes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <Button 
                    variant="outline" 
                    onClick={handleShareRecipes}
                    data-testid="button-share-recipes-native"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleWhatsAppRecipes}
                  data-testid="button-share-recipes-whatsapp"
                >
                  <SiWhatsapp className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleEmailRecipes}
                  data-testid="button-share-recipes-email"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSMSRecipes}
                  data-testid="button-share-recipes-sms"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  SMS
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopyRecipes}
                  data-testid="button-share-recipes-copy"
                >
                  {copied ? <CheckCheck className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {matchingRecipes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Recipe Ideas for Your Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {matchingRecipes.map((recipe) => (
                <div
                  key={recipe.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover-elevate text-left w-full cursor-pointer"
                  onClick={() => window.open(recipe.url, "_blank")}
                  data-testid={`button-recipe-${recipe.name.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <img 
                    src={recipe.image} 
                    alt={recipe.name}
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm">{recipe.name}</span>
                    <p className="text-xs mt-0.5 flex flex-wrap gap-1">
                      {recipe.allIngredients.map((ing) => (
                        <span 
                          key={ing}
                          className={isIngredientInFreezer(ing) 
                            ? "bg-primary/20 text-primary font-medium px-1.5 py-0.5 rounded" 
                            : "text-muted-foreground"
                          }
                        >
                          {ing}
                        </span>
                      ))}
                    </p>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(recipe.name, e)}
                    className="p-1.5 rounded-full hover:bg-background/50 transition-colors flex-shrink-0"
                    data-testid={`button-favorite-${recipe.name.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <Heart 
                      className={`h-5 w-5 transition-colors ${isFavorite(recipe.name) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} 
                    />
                  </button>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Recipe Ideas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Find delicious recipes on BBC Good Food using ingredients from your freezer.
          </p>

          {topIngredients.length > 1 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Quick search with your ingredients</span>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => window.open(generateMultiIngredientUrl(topIngredients.map(i => i.searchName)), "_blank")}
                data-testid="button-search-all-ingredients"
              >
                <Search className="h-4 w-4 mr-2" />
                Recipes with {topIngredients.slice(0, 3).map(i => i.searchName).join(", ")}
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Find me a recipe by ingredient in my Freezer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Category Filter - Main Categories */}
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex items-center gap-2 min-w-max">
              {visibleCategories.map((category) => {
                const config = getCategoryConfig(category);
                const Icon = config.icon;
                const isActive = selectedCategory === category;
                return (
                  <motion.button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-lg transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                    data-testid={`button-recipe-filter-${category}`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`p-1.5 rounded-md transition-all ${isActive ? `${config.stripeColor} text-white shadow-md` : config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : config.color}`} />
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>{getCategoryLabel(category)}</span>
                  </motion.button>
                );
              })}
              {visibleCustomCategories.map((customCat) => {
                const config = getCategoryConfig(customCat.id);
                const Icon = config.icon;
                const isActive = selectedCategory === customCat.id;
                return (
                  <motion.button
                    key={customCat.id}
                    onClick={() => handleCategoryClick(customCat.id)}
                    className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-lg transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                    data-testid={`button-recipe-filter-${customCat.id}`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`p-1.5 rounded-md transition-all ${isActive ? `${config.stripeColor} text-white shadow-md` : config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : config.color}`} />
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>{customCat.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Filter - Shows under selected category */}
          <AnimatePresence>
            {selectedCategory === "meat_fish" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto -mx-4 px-4 pb-2"
              >
                <div className="flex items-center gap-2 min-w-max">
                  {meatSubcategories.map((subcategory) => {
                    const config = meatSubcategoryConfig[subcategory];
                    const Icon = config.icon;
                    const isActive = selectedSubcategory === subcategory;
                    return (
                      <motion.button
                        key={subcategory}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-lg transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                        data-testid={`button-recipe-filter-${subcategory}`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-1.5 rounded-md transition-all ${isActive ? `${config.stripeColor} text-white shadow-md` : config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-white" : config.color}`} />
                        </div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedCategory === "produce" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto -mx-4 px-4 pb-2"
              >
                <div className="flex items-center gap-2 min-w-max">
                  {produceSubcategories.map((subcategory) => {
                    const config = produceSubcategoryConfig[subcategory];
                    const Icon = config.icon;
                    const isActive = selectedSubcategory === subcategory;
                    return (
                      <motion.button
                        key={subcategory}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-lg transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                        data-testid={`button-recipe-filter-${subcategory}`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-1.5 rounded-md transition-all ${isActive ? `${config.stripeColor} text-white shadow-md` : config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-white" : config.color}`} />
                        </div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedCategory === "prepared_meals" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto -mx-4 px-4 pb-2"
              >
                <div className="flex items-center gap-2 min-w-max">
                  {preparedMealsSubcategories.map((subcategory) => {
                    const config = preparedMealsSubcategoryConfig[subcategory];
                    const Icon = config.icon;
                    const isActive = selectedSubcategory === subcategory;
                    return (
                      <motion.button
                        key={subcategory}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-lg transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                        data-testid={`button-recipe-filter-${subcategory}`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-1.5 rounded-md transition-all ${isActive ? `${config.stripeColor} text-white shadow-md` : config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-white" : config.color}`} />
                        </div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedCategory === "frozen_goods" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto -mx-4 px-4 pb-2"
              >
                <div className="flex items-center gap-2 min-w-max">
                  {frozenGoodsSubcategories.map((subcategory) => {
                    const config = frozenGoodsSubcategoryConfig[subcategory];
                    const Icon = config.icon;
                    const isActive = selectedSubcategory === subcategory;
                    return (
                      <motion.button
                        key={subcategory}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-lg transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                        data-testid={`button-recipe-filter-${subcategory}`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-1.5 rounded-md transition-all ${isActive ? `${config.stripeColor} text-white shadow-md` : config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-white" : config.color}`} />
                        </div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedCategory === "desserts" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto -mx-4 px-4 pb-2"
              >
                <div className="flex items-center gap-2 min-w-max">
                  {dessertsSubcategories.map((subcategory) => {
                    const config = dessertsSubcategoryConfig[subcategory];
                    const Icon = config.icon;
                    const isActive = selectedSubcategory === subcategory;
                    return (
                      <motion.button
                        key={subcategory}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-lg transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                        data-testid={`button-recipe-filter-${subcategory}`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-1.5 rounded-md transition-all ${isActive ? `${config.stripeColor} text-white shadow-md` : config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-white" : config.color}`} />
                        </div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? config.color : ""}`}>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-filter-ingredients"
            />
          </div>

          {filteredIngredients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No ingredients found. Add items to your freezer to see recipe suggestions.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredIngredients.map((ingredient) => (
                <Badge
                  key={ingredient.id}
                  variant="secondary"
                  className="cursor-pointer hover-elevate py-1.5 px-3"
                  onClick={() => window.open(generateBBCGoodFoodUrl(ingredient.searchName), "_blank")}
                  data-testid={`badge-ingredient-${ingredient.id}`}
                >
                  {ingredient.name}
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center px-4">
        Recipes provided by BBC Good Food. Click any ingredient or recipe to search on their website.
      </p>
    </div>
  );
}
