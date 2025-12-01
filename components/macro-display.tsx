import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MacroDisplayProps {
    protein: number;
    proteinGoal: number;
    carbs: number;
    carbsGoal: number;
    fat: number;
    fatGoal: number;
}

export function MacroDisplay({
    protein, proteinGoal,
    carbs, carbsGoal,
    fat, fatGoal
}: MacroDisplayProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <MacroCard
                label="Protein"
                value={protein}
                goal={proteinGoal}
                gradientId="proteinGradient"
                gradientFrom="hsl(221 83% 53%)"
                gradientTo="hsl(210 100% 60%)"
                textColor="text-blue-600 dark:text-blue-400"
            />
            <MacroCard
                label="Carbs"
                value={carbs}
                goal={carbsGoal}
                gradientId="carbsGradient"
                gradientFrom="hsl(142 76% 36%)"
                gradientTo="hsl(142 71% 45%)"
                textColor="text-green-600 dark:text-green-400"
            />
            <MacroCard
                label="Fat"
                value={fat}
                goal={fatGoal}
                gradientId="fatGradient"
                gradientFrom="hsl(38 92% 50%)"
                gradientTo="hsl(25 95% 53%)"
                textColor="text-amber-600 dark:text-amber-400"
            />
        </div>
    );
}

function MacroCard({
    label, value, goal, gradientId, gradientFrom, gradientTo, textColor
}: {
    label: string;
    value: number;
    goal: number;
    gradientId: string;
    gradientFrom: string;
    gradientTo: string;
    textColor: string;
}) {
    const percentage = Math.min(100, (value / goal) * 100);
    const isExceeded = value > goal;

    // Circle config
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative flex items-center justify-center mb-3">
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
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradientFrom} />
                            <stop offset="100%" stopColor={gradientTo} />
                        </linearGradient>
                    </defs>
                    <motion.circle
                        stroke={`url(#${gradientId})`}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="drop-shadow-md"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <motion.div
                        className={cn("text-xl font-bold tabular-nums", textColor)}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        {value}
                    </motion.div>
                    <motion.div
                        className="text-[9px] text-muted-foreground font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        g
                    </motion.div>
                </div>
            </div>

            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${textColor}`}>
                    {label}
                </div>
                <div className="text-[10px] text-muted-foreground">
                    {goal}g goal
                </div>
            </motion.div>
        </motion.div>
    );
}
