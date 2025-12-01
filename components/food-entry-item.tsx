'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Entry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FoodEntryItemProps {
    entry: Entry;
    onDelete: (id: string) => void;
}

export function FoodEntryItem({ entry, onDelete }: FoodEntryItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            className={cn(
                "group rounded-2xl border border-border/50 backdrop-blur-sm bg-card/80 overflow-hidden transition-all duration-300",
                isExpanded ? "shadow-lg ring-2 ring-primary/10" : "shadow-sm hover:shadow-md hover:border-border"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            layout
        >
            <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <motion.div
                        className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl border border-primary/10"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        🥗
                    </motion.div>
                    <div>
                        <p className="font-semibold text-foreground">{entry.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-bold text-lg tabular-nums text-foreground">
                            {entry.nutrition.calories}
                        </div>
                        <div className="text-xs text-muted-foreground">kcal</div>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="border-t border-border/50 bg-muted/30"
                    >
                        <div className="p-5 pt-4">
                            <div className="grid grid-cols-3 gap-4 mb-5">
                                <MacroStat label="Protein" value={entry.nutrition.protein} color="text-blue-600 dark:text-blue-400" />
                                <MacroStat label="Carbs" value={entry.nutrition.carbs} color="text-green-600 dark:text-green-400" />
                                <MacroStat label="Fat" value={entry.nutrition.fat} color="text-amber-600 dark:text-amber-400" />
                            </div>

                            {entry.items && entry.items.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items Detected</h4>
                                    <div className="space-y-2">
                                        {entry.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg bg-background/50 p-2 text-sm border border-border/50">
                                                <span className="font-medium">{item.name}</span>
                                                <div className="flex gap-3 text-xs text-muted-foreground">
                                                    <span>{item.calories} cal</span>
                                                    <span>P: {item.protein}g</span>
                                                    <span>C: {item.carbs}g</span>
                                                    <span>F: {item.fat}g</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full h-9 rounded-xl"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(entry.id);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Entry
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function MacroStat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">
                {label}
            </div>
            <div className={cn("text-xl font-bold tabular-nums", color)}>
                {value}
                <span className="text-xs text-muted-foreground ml-0.5">g</span>
            </div>
        </div>
    );
}
