import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarcodeScanner } from "@/components/barcode-scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoryConfig, getCategoryLabel } from "@/components/category-icon";
import { getDefaultCategory, getCustomLocations, getDefaultExpiryDate, getDefaultLowStock, getCustomCategories, getVisibleLocations, getLocationLabel, getAvailableTags, getTagLabel, type ItemTag } from "@/components/settings-panel";
import { Badge } from "@/components/ui/badge";
import { 
  categories, 
  meatSubcategories,
  produceSubcategories,
  preparedMealsSubcategories,
  frozenGoodsSubcategories,
  locationLabels,
  freezerItemFormSchema, 
  type FreezerItem, 
  type FreezerItemFormData,
  type Location
} from "@shared/schema";
import { meatSubcategoryConfig, produceSubcategoryConfig, preparedMealsSubcategoryConfig, frozenGoodsSubcategoryConfig } from "@/components/category-icon";
import { Loader2, MapPin, ScanBarcode, Minus, Plus } from "lucide-react";

interface AddEditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: FreezerItem | null;
  onSubmit: (data: FreezerItemFormData) => void;
  isLoading?: boolean;
}

export function AddEditItemDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading = false,
}: AddEditItemDialogProps) {
  const isEditing = !!item;
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const form = useForm<FreezerItemFormData>({
    resolver: zodResolver(freezerItemFormSchema),
    defaultValues: {
      name: "",
      category: getDefaultCategory(),
      subCategory: null,
      quantity: 1,
      unit: "item",
      expirationDate: getDefaultExpiryDate(),
      notes: "",
      lowStockThreshold: getDefaultLowStock(),
      location: "unassigned",
      tags: [],
    },
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const watchedCategory = form.watch("category");

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          category: item.category,
          subCategory: item.subCategory || null,
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expirationDate,
          notes: item.notes || "",
          lowStockThreshold: item.lowStockThreshold || 0,
          location: item.location || "unassigned",
          tags: item.tags || [],
        });
        setSelectedTags(item.tags || []);
      } else {
        form.reset({
          name: "",
          category: getDefaultCategory(),
          subCategory: null,
          quantity: 1,
          unit: "item",
          expirationDate: getDefaultExpiryDate(),
          notes: "",
          lowStockThreshold: getDefaultLowStock(),
          location: "unassigned",
          tags: [],
        });
        setSelectedTags([]);
      }
    }
  }, [open, item, form]);

  useEffect(() => {
    if (watchedCategory !== "meat_fish" && watchedCategory !== "produce" && watchedCategory !== "prepared_meals" && watchedCategory !== "frozen_goods") {
      form.setValue("subCategory", null);
    }
  }, [watchedCategory, form]);

  const handleSubmit = (data: FreezerItemFormData) => {
    onSubmit({ ...data, tags: selectedTags });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleBarcodeScanned = (productName: string) => {
    form.setValue("name", productName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Item" : "Add New Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this freezer item." : "Add a new item to your freezer inventory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g., Chicken breast"
                        data-testid="input-item-name"
                        {...field}
                      />
                    </FormControl>
                    {!isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsScannerOpen(true)}
                        data-testid="button-scan-barcode"
                      >
                        <ScanBarcode className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => {
                          const config = getCategoryConfig(category);
                          const Icon = config.icon;
                          return (
                            <SelectItem 
                              key={category} 
                              value={category}
                              data-testid={`select-option-${category}`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${config.color}`} />
                                {getCategoryLabel(category)}
                              </div>
                            </SelectItem>
                          );
                        })}
                        {getCustomCategories().map((customCat) => {
                          const config = getCategoryConfig(customCat.id);
                          const Icon = config.icon;
                          return (
                            <SelectItem 
                              key={customCat.id} 
                              value={customCat.id}
                              data-testid={`select-option-${customCat.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${config.color}`} />
                                {customCat.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedCategory === "meat_fish" && (
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-subcategory">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {meatSubcategories.map((sub) => {
                            const config = meatSubcategoryConfig[sub];
                            const Icon = config.icon;
                            return (
                              <SelectItem 
                                key={sub} 
                                value={sub}
                                data-testid={`select-subcategory-${sub}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${config.color}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedCategory === "produce" && (
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-subcategory">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {produceSubcategories.map((sub) => {
                            const config = produceSubcategoryConfig[sub];
                            const Icon = config.icon;
                            return (
                              <SelectItem 
                                key={sub} 
                                value={sub}
                                data-testid={`select-subcategory-${sub}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${config.color}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedCategory === "prepared_meals" && (
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-subcategory">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {preparedMealsSubcategories.map((sub) => {
                            const config = preparedMealsSubcategoryConfig[sub];
                            const Icon = config.icon;
                            return (
                              <SelectItem 
                                key={sub} 
                                value={sub}
                                data-testid={`select-subcategory-${sub}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${config.color}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedCategory === "frozen_goods" && (
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-subcategory">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frozenGoodsSubcategories.map((sub) => {
                            const config = frozenGoodsSubcategoryConfig[sub];
                            const Icon = config.icon;
                            return (
                              <SelectItem 
                                key={sub} 
                                value={sub}
                                data-testid={`select-subcategory-${sub}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${config.color}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "unassigned"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem 
                        value="unassigned"
                        data-testid="select-location-unassigned"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {getLocationLabel("unassigned" as Location)}
                        </div>
                      </SelectItem>
                      {getVisibleLocations().filter(loc => loc !== "unassigned").map((location) => (
                        <SelectItem 
                          key={location} 
                          value={location}
                          data-testid={`select-location-${location}`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {getLocationLabel(location)}
                          </div>
                        </SelectItem>
                      ))}
                      {getCustomLocations().map((location) => (
                        <SelectItem 
                          key={location} 
                          value={location}
                          data-testid={`select-location-custom-${location}`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {location}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => field.onChange(Math.max(0.01, (field.value || 1) - 1))}
                          data-testid="button-quantity-minus"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0.01"
                          className="text-center text-lg font-medium"
                          data-testid="input-quantity"
                          {...field}
                          value={field.value || 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.01;
                            field.onChange(Math.max(0.01, val));
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => field.onChange((field.value || 1) + 1)}
                          data-testid="button-quantity-plus"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="item" data-testid="select-unit-item">Item(s)</SelectItem>
                        <SelectItem value="piece" data-testid="select-unit-piece">Piece(s)</SelectItem>
                        <SelectItem value="portion" data-testid="select-unit-portion">Portion(s)</SelectItem>
                        <SelectItem value="lb" data-testid="select-unit-lb">Pound(s)</SelectItem>
                        <SelectItem value="kg" data-testid="select-unit-kg">Kilogram(s)</SelectItem>
                        <SelectItem value="oz" data-testid="select-unit-oz">Ounce(s)</SelectItem>
                        <SelectItem value="g" data-testid="select-unit-g">Gram(s)</SelectItem>
                        <SelectItem value="bag" data-testid="select-unit-bag">Bag(s)</SelectItem>
                        <SelectItem value="box" data-testid="select-unit-box">Box(es)</SelectItem>
                        <SelectItem value="pack" data-testid="select-unit-pack">Pack(s)</SelectItem>
                        <SelectItem value="container" data-testid="select-unit-container">Container(s)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use By Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        data-testid="input-expiration-date"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Alert</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0 = disabled"
                        data-testid="input-low-stock"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this item..."
                      className="resize-none"
                      rows={3}
                      data-testid="input-notes"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {getAvailableTags().map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer toggle-elevate"
                    onClick={() => toggleTag(tag.id)}
                    data-testid={`tag-${tag.id}`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-save">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <BarcodeScanner
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onBarcodeScanned={handleBarcodeScanned}
      />
    </Dialog>
  );
}
