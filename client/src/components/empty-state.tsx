import { Snowflake, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAddItem: () => void;
  hasFilters?: boolean;
}

function FreezerIllustration() {
  return (
    <div className="relative w-48 h-40 mb-6">
      {/* Freezer body */}
      <motion.div 
        className="absolute inset-x-4 top-4 bottom-0 bg-gradient-to-b from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 rounded-xl border-2 border-cyan-300 dark:border-cyan-700 shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Freezer handle */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-cyan-400 dark:bg-cyan-600 rounded-full" />
        
        {/* Frost lines */}
        <div className="absolute inset-4 flex flex-col justify-around">
          <div className="h-0.5 bg-white/50 dark:bg-white/20 rounded" />
          <div className="h-0.5 bg-white/50 dark:bg-white/20 rounded" />
          <div className="h-0.5 bg-white/50 dark:bg-white/20 rounded" />
        </div>
      </motion.div>
      
      {/* Floating snowflakes */}
      <motion.div
        className="absolute top-0 left-8"
        animate={{ y: [0, -8, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Snowflake className="h-5 w-5 text-cyan-400 dark:text-cyan-300" />
      </motion.div>
      <motion.div
        className="absolute top-6 right-6"
        animate={{ y: [0, -6, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Snowflake className="h-4 w-4 text-cyan-300 dark:text-cyan-400" />
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-2"
        animate={{ y: [0, -5, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Snowflake className="h-3 w-3 text-cyan-200 dark:text-cyan-500" />
      </motion.div>
    </div>
  );
}

export function EmptyState({ onAddItem, hasFilters = false }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-16 px-4" 
        data-testid="empty-state-filtered"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Search className="h-8 w-8 text-muted-foreground" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 px-4" 
      data-testid="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <FreezerIllustration />
      
      <motion.h3 
        className="text-xl font-semibold mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Your freezer is ready!
      </motion.h3>
      <motion.p 
        className="text-muted-foreground text-center max-w-sm mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Start tracking your frozen goods. Never forget what's in your freezer or when it expires again.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button onClick={onAddItem} size="lg" data-testid="button-add-first-item">
          <Plus className="h-5 w-5 mr-2" />
          Add Your First Item
        </Button>
      </motion.div>
    </motion.div>
  );
}
