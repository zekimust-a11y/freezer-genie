import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileText } from "lucide-react";
import { getCategoryLabel } from "@/components/category-icon";
import { locationLabels, type FreezerItem } from "@shared/schema";

interface ExportDataProps {
  items: FreezerItem[];
}

export function ExportData({ items }: ExportDataProps) {
  const handleExportJSON = () => {
    const data = items.map((item) => ({
      name: item.name,
      category: getCategoryLabel(item.category),
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expirationDate,
      location: locationLabels[item.location],
      notes: item.notes,
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadFile(blob, `freezer-inventory-${getDateString()}.json`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Category", "Quantity", "Unit", "Expiration Date", "Location", "Notes"];
    const rows = items.map((item) => [
      item.name,
      getCategoryLabel(item.category),
      item.quantity.toString(),
      item.unit,
      item.expirationDate || "",
      locationLabels[item.location],
      item.notes || "",
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    downloadFile(blob, `freezer-inventory-${getDateString()}.csv`);
  };

  const handleExportText = () => {
    const lines = [
      "Freezer Inventory",
      `Exported: ${new Date().toLocaleDateString()}`,
      `Total Items: ${items.length}`,
      "",
      "---",
      "",
    ];

    items.forEach((item) => {
      lines.push(`${item.name}`);
      lines.push(`  Category: ${getCategoryLabel(item.category)}`);
      lines.push(`  Quantity: ${item.quantity} ${item.unit}`);
      lines.push(`  Location: ${locationLabels[item.location]}`);
      if (item.expirationDate) {
        lines.push(`  Expires: ${item.expirationDate}`);
      }
      if (item.notes) {
        lines.push(`  Notes: ${item.notes}`);
      }
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    downloadFile(blob, `freezer-inventory-${getDateString()}.txt`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON} data-testid="export-json">
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} data-testid="export-csv">
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportText} data-testid="export-txt">
          <FileText className="h-4 w-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}
