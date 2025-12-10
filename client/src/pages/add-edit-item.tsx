import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDefaultCategory, getCustomLocations, getDefaultExpiryDate, getDefaultLowStock, getVisibleLocations, getLocationLabel, getAvailableTags, getTagLabel, getFreezers, getDefaultFreezerForNewItems, getDateFormat, type ItemTag } from "@/components/settings-panel";
import { Badge } from "@/components/ui/badge";
import { 
  categories,
  meatSubcategories,
  produceSubcategories,
  preparedMealsSubcategories,
  frozenGoodsSubcategories,
  dessertsSubcategories,
  freezerItemFormSchema, 
  type FreezerItem, 
  type FreezerItemFormData,
  type Location
} from "@shared/schema";
import { meatSubcategoryConfig, produceSubcategoryConfig, preparedMealsSubcategoryConfig, frozenGoodsSubcategoryConfig, dessertsSubcategoryConfig } from "@/components/category-icon";
import { getCategoryConfig, getCategoryLabel } from "@/components/category-icon";
import { getCustomCategories } from "@/components/settings-panel";
import { Loader2, MapPin, Minus, Plus, ChevronLeft, Trash2 } from "lucide-react";
import { BarcodeScanner } from "@/components/barcode-scanner";

export default function AddEditItemPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/item/:id");
  const { toast } = useToast();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const itemId = params?.id;
  const isEditing = !!itemId;

  const { data: item, isLoading: isLoadingItem } = useQuery<FreezerItem>({
    queryKey: ["/api/items", itemId],
    queryFn: async () => {
      const response = await fetch(`/api/items/${itemId}`);
      if (!response.ok) throw new Error("Failed to fetch item");
      return response.json();
    },
    enabled: isEditing,
  });

  const freezers = getFreezers();
  const hasMultipleFreezers = freezers.length > 1;

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
      freezerId: getDefaultFreezerForNewItems(),
      tags: [],
    },
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const watchedCategory = form.watch("category");

  useEffect(() => {
    if (isEditing && item) {
      form.reset({
        name: item.name,
        category: item.category,
        subCategory: item.subCategory || null,
        quantity: item.quantity,
        unit: item.unit,
        expirationDate: item.expirationDate || null,
        notes: item.notes || "",
        lowStockThreshold: item.lowStockThreshold || 0,
        location: item.location || "unassigned",
        freezerId: item.freezerId || freezers[0]?.id || "default",
        tags: item.tags || [],
      });
      setSelectedTags(item.tags || []);
    }
  }, [isEditing, item, form]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  useEffect(() => {
    if (watchedCategory !== "meat_fish" && watchedCategory !== "produce" && watchedCategory !== "prepared_meals" && watchedCategory !== "frozen_goods" && watchedCategory !== "desserts") {
      form.setValue("subCategory", null);
    }
  }, [watchedCategory, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FreezerItemFormData) => {
      const payload = { 
        ...data, 
        quantity: String(data.quantity),
        subCategory: data.subCategory || null,
      };
      const response = await apiRequest("POST", "/api/items", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Item added",
        description: "Your item has been added to the freezer.",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FreezerItemFormData) => {
      const payload = { 
        ...data, 
        quantity: String(data.quantity),
        subCategory: data.subCategory || null,
      };
      const response = await apiRequest("PUT", `/api/items/${itemId}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Item updated",
        description: "Your changes have been saved.",
        duration: 2000,
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your freezer.",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FreezerItemFormData) => {
    const dataWithTags = { ...data, tags: selectedTags };
    if (isEditing) {
      updateMutation.mutate(dataWithTags);
    } else {
      createMutation.mutate(dataWithTags);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    setIsScannerOpen(false);
    form.setValue("name", barcode);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background border-b" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEditing ? "Edit Item" : "Add Item"}
          </h1>
        </div>
      </div>

      <div className="px-4 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Chicken breast"
                        data-testid="input-name"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsScannerOpen(true)}
                        data-testid="button-scan"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                          <line x1="7" y1="12" x2="17" y2="12" />
                          <line x1="7" y1="8" x2="17" y2="8" />
                          <line x1="7" y1="16" x2="17" y2="16" />
                        </svg>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
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
                        {categories.map((cat) => {
                          const config = getCategoryConfig(cat);
                          const Icon = config.icon;
                          return (
                            <SelectItem 
                              key={cat} 
                              value={cat}
                              data-testid={`select-category-${cat}`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${config.color}`} />
                                {getCategoryLabel(cat)}
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
                              data-testid={`select-category-${customCat.id}`}
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

              {watchedCategory === "desserts" && (
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
                          {dessertsSubcategories.map((sub) => {
                            const config = dessertsSubcategoryConfig[sub];
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

              <div className={hasMultipleFreezers ? "grid grid-cols-2 gap-3" : ""}>
                {hasMultipleFreezers && (
                  <FormField
                    control={form.control}
                    name="freezerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Freezer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || freezers[0]?.id || "default"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-freezer">
                              <SelectValue placeholder="Select freezer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {freezers.map((freezer) => (
                              <SelectItem 
                                key={freezer.id} 
                                value={freezer.id}
                                data-testid={`select-freezer-${freezer.id}`}
                              >
                                {freezer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "unassigned"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-location">
                            <SelectValue placeholder="Select" />
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => {
                            const current = parseFloat(field.value) || 1;
                            field.onChange(Math.max(0.01, current - 1));
                          }}
                          data-testid="button-quantity-minus"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="text-center text-lg font-medium"
                          data-testid="input-quantity"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              field.onChange(val === "" ? "" : val);
                            }
                          }}
                          onBlur={(e) => {
                            const parsed = parseFloat(e.target.value);
                            if (isNaN(parsed) || parsed < 0.01) {
                              field.onChange(1);
                            } else {
                              field.onChange(parsed);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => {
                            const current = parseFloat(field.value) || 0;
                            field.onChange(current + 1);
                          }}
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
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="item" data-testid="select-unit-item">Item(s)</SelectItem>
                        <SelectItem value="piece" data-testid="select-unit-piece">Piece(s)</SelectItem>
                        <SelectItem value="portion" data-testid="select-unit-portion">Portion(s)</SelectItem>
                        <SelectItem value="lb" data-testid="select-unit-lb">lb</SelectItem>
                        <SelectItem value="kg" data-testid="select-unit-kg">kg</SelectItem>
                        <SelectItem value="oz" data-testid="select-unit-oz">oz</SelectItem>
                        <SelectItem value="g" data-testid="select-unit-g">g</SelectItem>
                        <SelectItem value="bag" data-testid="select-unit-bag">Bag(s)</SelectItem>
                        <SelectItem value="box" data-testid="select-unit-box">Box(es)</SelectItem>
                        <SelectItem value="pack" data-testid="select-unit-pack">Pack(s)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                        {...field}
                        value={field.value || ""}
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
                    <FormLabel>Alert me when stock is</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        data-testid="input-low-stock"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium">Tags</label>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes..."
                      className="min-h-[60px]"
                      data-testid="input-notes"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && item?.createdAt && (
              <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                Added on {format(new Date(item.createdAt), `${getDateFormat()} 'at' h:mm a`)}
              </div>
            )}
          </form>
        </Form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-testid="button-delete"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          )}
          <Button 
            type="button"
            className="flex-1"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isLoading}
            data-testid="button-save"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save" : "Add"}
          </Button>
        </div>
      </div>

      <BarcodeScanner
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onBarcodeScanned={handleBarcodeDetected}
      />
    </div>
  );
}
