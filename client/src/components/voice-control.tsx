import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlProps {
  onCommand: (command: string) => void;
  onTranscript?: (transcript: string) => void;
}

export function VoiceControl({ onCommand, onTranscript }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice control.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Listening...",
        description: "Speak your command",
        duration: 2000,
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript?.(transcript);
      onCommand(transcript.toLowerCase());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice control.",
          variant: "destructive",
        });
      } else if (event.error === "no-speech") {
        toast({
          title: "No speech detected",
          description: "Please try again",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  }, [onCommand, onTranscript, toast]);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isListening ? "default" : "outline"}
      size="icon"
      onClick={startListening}
      disabled={isListening}
      className={isListening ? "animate-pulse" : ""}
      data-testid="button-voice-control"
    >
      {isListening ? (
        <Mic className="h-4 w-4" />
      ) : (
        <MicOff className="h-4 w-4" />
      )}
    </Button>
  );
}

export type VoiceCommandResult = {
  action: "query" | "add" | "search" | "navigate" | "tab" | "unknown";
  value?: string;
  details?: {
    category?: string;
    itemName?: string;
    quantity?: string;
    unit?: string;
    foundItems?: any[];
    message?: string;
  };
};

export function useVoiceCommands() {
  const processCommand = useCallback((command: string, items: any[] = []): VoiceCommandResult => {
    const cmd = command.toLowerCase().trim();
    
    // ========== QUERY COMMANDS (Do I have X? / What X do I have?) ==========
    
    // Pattern: "do I have [any] [item]" or "is there [any] [item]"
    const doIHaveMatch = cmd.match(/(?:do i have|is there|have i got|got any)(?: any)?\s+(.+?)(?:\s+in (?:my|the) freezer)?$/i);
    if (doIHaveMatch) {
      const itemQuery = doIHaveMatch[1].trim();
      const foundItems = items.filter((item: any) => 
        item.name.toLowerCase().includes(itemQuery) ||
        item.subCategory?.toLowerCase().includes(itemQuery) ||
        item.category.toLowerCase().includes(itemQuery)
      );
      
      return {
        action: "query",
        value: itemQuery,
        details: {
          itemName: itemQuery,
          foundItems,
          message: foundItems.length > 0 
            ? `Yes, you have ${foundItems.length} item${foundItems.length > 1 ? 's' : ''} matching "${itemQuery}"`
            : `No, you don't have any "${itemQuery}" in your freezer`
        }
      };
    }
    
    // Pattern: "what [category] do I have" or "what [category] are in my freezer"
    const whatCategoryMatch = cmd.match(/what\s+(?:kind of\s+)?(\w+)(?:\s+(?:do i have|are in|is in|have i got))?(?:\s+(?:my|the) freezer)?/i);
    if (whatCategoryMatch) {
      const categoryQuery = whatCategoryMatch[1].trim();
      
      // Map common words to categories
      const categoryMap: Record<string, string[]> = {
        meat_fish: ["meat", "meats", "fish", "chicken", "beef", "pork", "lamb", "seafood", "protein", "proteins"],
        produce: ["vegetable", "vegetables", "veggie", "veggies", "fruit", "fruits", "produce"],
        prepared_meals: ["meal", "meals", "dinner", "dinners", "lunch", "lunches"],
        desserts: ["dessert", "desserts", "sweet", "sweets", "cake", "cakes"],
        bread: ["bread", "breads", "baked goods"],
        dairy: ["dairy", "milk", "cheese", "butter", "yogurt"],
        frozen_goods: ["frozen", "pizza", "pizzas"],
      };
      
      // Find matching category
      let matchedCategory = null;
      for (const [category, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(keyword => categoryQuery.includes(keyword))) {
          matchedCategory = category;
          break;
        }
      }
      
      if (matchedCategory) {
        const foundItems = items.filter((item: any) => item.category === matchedCategory);
        return {
          action: "query",
          value: categoryQuery,
          details: {
            category: matchedCategory,
            foundItems,
            message: foundItems.length > 0
              ? `You have ${foundItems.length} ${categoryQuery} item${foundItems.length > 1 ? 's' : ''}`
              : `You don't have any ${categoryQuery} in your freezer`
          }
        };
      }
      
      // If no exact category match, search for items matching the query
      const foundItems = items.filter((item: any) => 
        item.name.toLowerCase().includes(categoryQuery) ||
        item.subCategory?.toLowerCase().includes(categoryQuery)
      );
      
      return {
        action: "query",
        value: categoryQuery,
        details: {
          foundItems,
          message: foundItems.length > 0
            ? `You have ${foundItems.length} item${foundItems.length > 1 ? 's' : ''} matching "${categoryQuery}"`
            : `No items found matching "${categoryQuery}"`
        }
      };
    }
    
    // Pattern: "how much/many [item]" or "how many [item] do I have"
    const howManyMatch = cmd.match(/how (?:much|many)\s+(.+?)(?:\s+do i have)?(?:\s+in (?:my|the) freezer)?$/i);
    if (howManyMatch) {
      const itemQuery = howManyMatch[1].trim();
      const foundItems = items.filter((item: any) => 
        item.name.toLowerCase().includes(itemQuery) ||
        item.subCategory?.toLowerCase().includes(itemQuery)
      );
      
      const totalQuantity = foundItems.reduce((sum: number, item: any) => {
        const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
        return sum + (isNaN(qty) ? 0 : qty);
      }, 0);
      
      return {
        action: "query",
        value: itemQuery,
        details: {
          itemName: itemQuery,
          foundItems,
          quantity: totalQuantity.toString(),
          message: foundItems.length > 0
            ? `You have ${foundItems.length} item${foundItems.length > 1 ? 's' : ''} totaling ${totalQuantity} units`
            : `No "${itemQuery}" found in your freezer`
        }
      };
    }
    
    // ========== ADD COMMANDS ==========
    
    // Pattern: "add [quantity] [unit] of [item]" or "add a/an [item]"
    const addMatch = cmd.match(/add\s+(?:(?:a|an|one)\s+)?(?:(\d+(?:\.\d+)?)\s+)?(?:(bag|box|package|pack|pound|lb|kg|kilogram|ounce|oz|gram|g)\s+(?:of\s+)?)?(.+?)(?:\s+to (?:my|the) freezer)?$/i);
    if (addMatch || cmd.startsWith("add ")) {
      let quantity = "1";
      let unit = "item";
      let itemName = "";
      
      if (addMatch) {
        quantity = addMatch[1] || "1";
        unit = addMatch[2] || "item";
        itemName = addMatch[3]?.trim() || "";
      } else {
        itemName = cmd.replace(/^add\s+/, "").replace(/\s+to (?:my|the) freezer$/i, "").trim();
      }
      
      // Normalize units
      const unitMap: Record<string, string> = {
        "bag": "bag",
        "box": "box",
        "package": "package",
        "pack": "package",
        "pound": "lb",
        "lb": "lb",
        "kilogram": "kg",
        "kg": "kg",
        "ounce": "oz",
        "oz": "oz",
        "gram": "g",
        "g": "g",
      };
      unit = unitMap[unit.toLowerCase()] || unit;
      
      return {
        action: "add",
        value: itemName,
        details: {
          itemName,
          quantity,
          unit,
          message: `Adding ${quantity} ${unit} of ${itemName}`
        }
      };
    }
    
    // ========== SEARCH COMMANDS ==========
    
    if (cmd.startsWith("search ") || cmd.startsWith("find ")) {
      const value = cmd.replace(/^(search|find)\s+/, "").trim();
      return { action: "search", value };
    }
    
    // ========== NAVIGATION COMMANDS ==========
    
    if (cmd.includes("go home") || cmd.includes("show inventory") || cmd === "home") {
      return { action: "navigate", value: "/" };
    }
    
    if (cmd.includes("alert") || cmd.includes("expir") || cmd.includes("expiring")) {
      return { action: "tab", value: "alerts" };
    }
    
    if (cmd.includes("shopping") || cmd.includes("list")) {
      return { action: "tab", value: "list" };
    }
    
    if (cmd.includes("recipe")) {
      return { action: "tab", value: "recipes" };
    }
    
    if (cmd.includes("setting")) {
      return { action: "tab", value: "settings" };
    }
    
    // ========== UNKNOWN COMMAND ==========
    return { 
      action: "unknown", 
      value: cmd,
      details: {
        message: `I didn't understand: "${cmd}". Try saying "Do I have pork chops", "What vegetables are in my freezer", or "Add a bag of peas"`
      }
    };
  }, []);

  return { processCommand };
}
