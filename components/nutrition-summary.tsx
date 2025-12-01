'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NutritionSummaryProps {
    current: number;
    goal: number;
    label: string;
    unit?: string;
}

export function NutritionSummary({ current, goal, label, unit = '' }: NutritionSummaryProps) {
    const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
    const isExceeded = current > goal;
    const diff = Math.abs(goal - current);

    // Circle config - larger and more prominent
    const radius = 100;
    const stroke = 14;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="relative flex items-center justify-center">
                {/* Background Circle */}
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="rotate-[-90deg]"
                >
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset: 0 }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-muted/20"
                    />
                    {/* Progress Circle with Gradient */}
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isExceeded ? "hsl(0 84% 60%)" : "hsl(221 83% 53%)"} />
                            <stop offset="100%" stopColor={isExceeded ? "hsl(0 70% 50%)" : "hsl(270 80% 60%)"} />
                        </linearGradient>
                    </defs>
                    <motion.circle
                        stroke="url(#progressGradient)"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="drop-shadow-lg"
                        style={{
                            filter: 'drop-shadow(0 0 8px hsla(221, 83%, 53%, 0.3))'
                        }}
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <motion.div
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {isExceeded ? 'Over' : 'Remaining'}
                    </motion.div>
                    <motion.div
                        className={cn(
                            "text-5xl font-bold tracking-tighter tabular-nums",
                            isExceeded && "text-destructive"
                        )}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                        {diff}
                    </motion.div>
                    <motion.div
                        className="text-sm text-muted-foreground font-medium mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        {unit}
                    </motion.div>
                </div>
            </div>

            <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">{current}</span>
                    {' '}/{' '}
                    <span className="font-semibold text-foreground tabular-nums">{goal}</span>
                    {' '}{unit} consumed
                </div>
            </motion.div>
        </div>
    );
}
