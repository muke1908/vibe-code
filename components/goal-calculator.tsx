'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calculator, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface GoalCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goals: any) => void;
    initialSettings?: any;
}

export function GoalCalculator({ isOpen, onClose, onSave, initialSettings }: GoalCalculatorProps) {
    const [age, setAge] = useState(initialSettings?.userStats?.age?.toString() || '');
    const [height, setHeight] = useState(initialSettings?.userStats?.height?.toString() || '');
    const [weight, setWeight] = useState(initialSettings?.userStats?.weight?.toString() || '');
    const [gender, setGender] = useState(initialSettings?.userStats?.gender || 'male');
    const [activity, setActivity] = useState(initialSettings?.userStats?.activityLevel || 'moderate');
    const [apiBaseUrl, setApiBaseUrl] = useState(initialSettings?.apiBaseUrl || '');

    const [calculated, setCalculated] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'calculator' | 'settings'>('calculator');

    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateGoals = async () => {
        if (!age || !height || !weight) {
            setError("Please fill in all fields");
            return;
        }

        setIsCalculating(true);
        setError(null);

        try {
            const res = await fetch('/api/calculate-goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    age: parseInt(age),
                    height: parseInt(height),
                    weight: parseInt(weight),
                    gender,
                    activity
                })
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Calculation failed');
            }

            setCalculated(data);
        } catch (err: any) {
            console.error('Goal calculation error:', err);
            setError(err.message || "Failed to calculate goals");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSave = () => {
        if (activeTab === 'calculator' && calculated) {
            onSave({
                ...calculated,
                userStats: {
                    age: parseInt(age),
                    height: parseInt(height),
                    weight: parseInt(weight),
                    gender,
                    activityLevel: activity
                },
                apiBaseUrl: apiBaseUrl.trim() || undefined
            });
            onClose();
        } else if (activeTab === 'settings') {
            onSave({
                // Preserve existing stats if we're just saving settings
                userStats: initialSettings?.userStats,
                apiBaseUrl: apiBaseUrl.trim() || undefined
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md"
            >
                <Card className="relative overflow-hidden border-none shadow-2xl p-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    <div className="mb-6 flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            {activeTab === 'calculator' ? <Calculator className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
                        </div>
                        <h2 className="text-xl font-bold">{activeTab === 'calculator' ? 'Goal Calculator' : 'Settings'}</h2>
                    </div>

                    <div className="flex mb-6 bg-secondary/50 p-1 rounded-lg">
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'calculator' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('calculator')}
                        >
                            Calculator
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'settings' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </div>

                    {activeTab === 'calculator' ? (
                        !calculated ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Age</Label>
                                        <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select value={gender} onValueChange={setGender}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Height (cm)</Label>
                                        <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weight (kg)</Label>
                                        <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Activity Level</Label>
                                    <Select value={activity} onValueChange={setActivity}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sedentary">Sedentary (Office job)</SelectItem>
                                            <SelectItem value="light">Light Exercise (1-2 days/wk)</SelectItem>
                                            <SelectItem value="moderate">Moderate (3-5 days/wk)</SelectItem>
                                            <SelectItem value="active">Active (6-7 days/wk)</SelectItem>
                                            <SelectItem value="very_active">Very Active (Physical job)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>



                                <Button className="w-full mt-4" onClick={calculateGoals} disabled={isCalculating}>
                                    {isCalculating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Calculating...
                                        </>
                                    ) : (
                                        "Calculate Goals"
                                    )}
                                </Button>

                                {error && (
                                    <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Daily Target</div>
                                    <div className="text-5xl font-bold text-primary">{calculated.dailyGoal}</div>
                                    <div className="text-sm text-muted-foreground">calories / day</div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-secondary/30 p-3 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground uppercase">Protein</div>
                                        <div className="font-bold text-lg">{calculated.proteinGoal}g</div>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground uppercase">Carbs</div>
                                        <div className="font-bold text-lg">{calculated.carbsGoal}g</div>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground uppercase">Fat</div>
                                        <div className="font-bold text-lg">{calculated.fatGoal}g</div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setCalculated(null)}>
                                        Back
                                    </Button>
                                    <Button className="flex-1" onClick={handleSave}>
                                        Apply Goals
                                    </Button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>API Base URL (Optional)</Label>
                                <Input
                                    value={apiBaseUrl}
                                    onChange={(e) => setApiBaseUrl(e.target.value)}
                                    placeholder="http://localhost:1234/v1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to use default. Used for AI features (e.g., LMStudio).
                                </p>
                            </div>

                            <Button className="w-full mt-4" onClick={handleSave}>
                                Save Settings
                            </Button>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
