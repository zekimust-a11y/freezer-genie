import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/category-icon";
import { ShoppingCart, Check, Share2, Mail, MessageCircle, Copy, CheckCheck } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { type FreezerItem, type Location } from "@shared/schema";
import { getLocationLabel, getUnitLabelConfig } from "@/components/settings-panel";
import { useToast } from "@/hooks/use-toast";

const weightUnits = ["lb", "kg", "oz", "g"];

function formatQuantity(quantity: number, unit: string): string {
  if (weightUnits.includes(unit)) {
    return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
  }
  return Math.round(quantity).toString();
}

function getUnitLabel(unit: string, quantity: number): string {
  const labels = getUnitLabelConfig(unit);
  if (labels) {
    const displayQty = weightUnits.includes(unit) ? quantity : Math.round(quantity);
    return displayQty === 1 ? labels.singular : labels.plural;
  }
  return unit;
}

interface ShoppingListPageProps {
  items: FreezerItem[];
  onEditItem: (item: FreezerItem) => void;
}

function getLowStockItems(items: FreezerItem[]): FreezerItem[] {
  return items.filter(
    (item) => (item.lowStockThreshold ?? 0) > 0 && item.quantity <= (item.lowStockThreshold ?? 0)
  );
}

export function ShoppingListPage({ items, onEditItem }: ShoppingListPageProps) {
  const lowStockItems = getLowStockItems(items);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateListText = () => {
    if (lowStockItems.length === 0) return "";
    
    const header = "Shopping List - Items to Restock:\n\n";
    const itemLines = lowStockItems.map(item => {
      const needed = Math.max(0.01, (item.lowStockThreshold ?? 0) - Number(item.quantity));
      return `- ${item.name}: need ${formatQuantity(needed, item.unit)} ${getUnitLabel(item.unit, needed)}`;
    }).join("\n");
    
    return header + itemLines;
  };

  const handleShare = async () => {
    const text = generateListText();
    if (!text) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shopping List",
          text: text,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const handleCopy = async () => {
    const text = generateListText();
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

  const handleEmail = () => {
    const text = generateListText();
    if (!text) return;
    
    const subject = encodeURIComponent("Shopping List - Items to Restock");
    const body = encodeURIComponent(text);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleWhatsApp = () => {
    const text = generateListText();
    if (!text) return;
    
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleSMS = () => {
    const text = generateListText();
    if (!text) return;
    
    const encoded = encodeURIComponent(text);
    window.open(`sms:?body=${encoded}`, "_blank");
  };

  return (
    <div className="p-4 space-y-4 pb-32">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Shopping List</h1>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="text-center py-12">
          <Check className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
          <p className="text-muted-foreground">This is where your shopping list will appear for all items low on stock.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {lowStockItems.length} {lowStockItems.length === 1 ? "item" : "items"} to restock
          </p>
          
          {lowStockItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => onEditItem(item)}
              data-testid={`card-shopping-${item.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CategoryIcon category={item.category} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      In stock: <span className="font-medium text-foreground">{formatQuantity(Number(item.quantity), item.unit)} {getUnitLabel(item.unit, Number(item.quantity))}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Minimum: <span className="font-medium text-foreground">{formatQuantity(item.lowStockThreshold ?? 0, item.unit)} {getUnitLabel(item.unit, item.lowStockThreshold ?? 0)}</span>
                    </p>
                    <Badge variant="destructive" className="mt-1">
                      Need {formatQuantity(Math.max(0.01, (item.lowStockThreshold ?? 0) - Number(item.quantity)), item.unit)} more {getUnitLabel(item.unit, Math.max(1, (item.lowStockThreshold ?? 0) - Number(item.quantity)))}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="mt-6 bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Share this list with someone else</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                    data-testid="button-share-native"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleWhatsApp}
                  data-testid="button-share-whatsapp"
                >
                  <SiWhatsapp className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleEmail}
                  data-testid="button-share-email"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSMS}
                  data-testid="button-share-sms"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  SMS
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  data-testid="button-share-copy"
                >
                  {copied ? <CheckCheck className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function getListCount(items: FreezerItem[]): number {
  return getLowStockItems(items).length;
}
