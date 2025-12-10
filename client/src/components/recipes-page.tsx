import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, ChefHat, Sparkles } from "lucide-react";
import type { FreezerItem } from "@shared/schema";

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

function generateBBCGoodFoodUrl(ingredient: string): string {
  const encoded = encodeURIComponent(ingredient.trim());
  return `https://www.bbcgoodfood.com/search?q=${encoded}`;
}

function generateMultiIngredientUrl(ingredients: string[]): string {
  const query = ingredients.slice(0, 3).join(" ");
  return generateBBCGoodFoodUrl(query);
}

const popularRecipeIdeas = [
  { name: "Chicken stir fry", ingredients: ["chicken", "vegetables"], url: "https://www.bbcgoodfood.com/search?q=chicken+stir+fry" },
  { name: "Fish pie", ingredients: ["fish", "potato"], url: "https://www.bbcgoodfood.com/search?q=fish+pie" },
  { name: "Beef casserole", ingredients: ["beef", "vegetables"], url: "https://www.bbcgoodfood.com/search?q=beef+casserole" },
  { name: "Vegetable soup", ingredients: ["vegetables", "stock"], url: "https://www.bbcgoodfood.com/search?q=vegetable+soup" },
  { name: "Pasta bake", ingredients: ["pasta", "cheese"], url: "https://www.bbcgoodfood.com/search?q=pasta+bake" },
  { name: "Shepherd's pie", ingredients: ["lamb", "potato"], url: "https://www.bbcgoodfood.com/search?q=shepherds+pie" },
];

export function RecipesPage({ items }: RecipesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const ingredientsList = useMemo(() => {
    const ingredients = items.map(item => ({
      id: item.id,
      name: item.name,
      searchName: extractIngredientName(item.name),
      category: item.category,
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

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return ingredientsList;
    const query = searchQuery.toLowerCase();
    return ingredientsList.filter(ing => 
      ing.name.toLowerCase().includes(query) || 
      ing.searchName.toLowerCase().includes(query)
    );
  }, [ingredientsList, searchQuery]);

  const topIngredients = ingredientsList.slice(0, 5);

  return (
    <div className="p-4 space-y-4 pb-32">
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
                Search recipes with {topIngredients.slice(0, 3).map(i => i.searchName).join(", ")}
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Find me a recipe by ingredient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Popular Recipe Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {popularRecipeIdeas.map((recipe) => (
              <button
                key={recipe.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted hover-elevate text-left w-full"
                onClick={() => window.open(recipe.url, "_blank")}
                data-testid={`button-recipe-${recipe.name.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <div>
                  <span className="font-medium text-sm">{recipe.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {recipe.ingredients.join(", ")}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center px-4">
        Recipes provided by BBC Good Food. Click any ingredient or recipe to search on their website.
      </p>
    </div>
  );
}
