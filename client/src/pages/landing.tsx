import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Snowflake, ShoppingCart, Clock, Package } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Snowflake className="h-6 w-6 text-cyan-500" />
              <h1 className="text-lg font-semibold">Freezer Tag</h1>
            </div>
            <Button asChild data-testid="button-login">
              <a href="/api/login">Log In</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
              <Snowflake className="h-16 w-16 text-cyan-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Keep Track of Your Freezer Contents
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Never let food go to waste again. Track what's in your freezer, get expiration alerts, and know when you're running low on essentials.
          </p>
          <Button size="lg" asChild data-testid="button-get-started">
            <a href="/api/login">Get Started</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-10 w-10 mx-auto mb-4 text-cyan-500" />
              <h3 className="font-semibold mb-2">Track Inventory</h3>
              <p className="text-sm text-muted-foreground">
                Add items with quantities, categories, and locations for easy organization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-10 w-10 mx-auto mb-4 text-amber-500" />
              <h3 className="font-semibold mb-2">Expiration Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when items are expiring soon so nothing goes to waste.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="h-10 w-10 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">Shopping Lists</h3>
              <p className="text-sm text-muted-foreground">
                See what's running low and create shopping lists automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="text-center text-sm text-muted-foreground">
          Manage your freezer inventory with ease
        </div>
      </footer>
    </div>
  );
}
