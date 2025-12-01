'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Loader2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export function UploadModal({ isOpen, onClose, onSave }: UploadModalProps) {
    const [step, setStep] = useState<'upload' | 'text-entry' | 'analyzing' | 'review'>('upload'); // Added 'text-entry'
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Removed cameraInputRef
    const [textInput, setTextInput] = useState(''); // Added textInput state

    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
            setStep('analyzing');
            // Use the result directly instead of state since state update is async
            analyzeFood({ image: e.target?.result as string }); // Changed analyzeImage to analyzeFood
        };
        reader.readAsDataURL(file);
    };

    const handleTextSubmit = () => { // Added handleTextSubmit
        if (!textInput.trim()) return;
        setStep('analyzing');
        analyzeFood({ text: textInput });
    };

    const analyzeFood = async (payload: { image?: string; text?: string }) => { // Renamed analyzeImage to analyzeFood and changed signature
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) // Changed body to use payload
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Analysis failed');
            }

            setAnalysisResult(data);
            setStep('review');
        } catch (error: any) {
            console.error('Analysis failed', error);
            setError(error.message || 'Failed to analyze'); // Updated error message
            setStep('upload');
        }
    };

    const handleSave = () => {
        onSave(analysisResult);
        reset();
    };

    const reset = () => {
        setStep('upload');
        setImagePreview(null);
        setAnalysisResult(null);
        setTextInput(''); // Added textInput reset
        setError(null);
        onClose();
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
                <Card className="relative overflow-hidden border-none shadow-2xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={reset}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    <div className="p-6">
                        {step === 'upload' && (
                            <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="cursor-pointer rounded-xl bg-secondary/50 p-6 transition-all hover:bg-secondary hover:scale-105 flex flex-col items-center gap-3 border-2 border-transparent hover:border-primary/20"
                                    >
                                        <div className="p-3 bg-background rounded-full shadow-sm">
                                            <Upload className="h-6 w-6 text-primary" />
                                        </div>
                                        <span className="font-medium text-sm">Upload Image</span>
                                    </div>

                                    <div
                                        onClick={() => setStep('text-entry')} // Changed onClick to set step to 'text-entry'
                                        className="cursor-pointer rounded-xl bg-secondary/50 p-6 transition-all hover:bg-secondary hover:scale-105 flex flex-col items-center gap-3 border-2 border-transparent hover:border-primary/20"
                                    >
                                        <div className="p-3 bg-background rounded-full shadow-sm">
                                            <Type className="h-6 w-6 text-primary" /> {/* Changed Camera to Type */}
                                        </div>
                                        <span className="font-medium text-sm">Describe Food</span> {/* Changed text */}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold">Add Food</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Upload a photo or describe your meal {/* Changed text */}
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                {/* Removed camera input */}

                                {error && (
                                    <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm w-full">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'text-entry' && ( // Added new step for text entry
                            <div className="flex flex-col gap-4 py-4">
                                <h3 className="text-lg font-semibold text-center">Describe Your Meal</h3>
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="e.g., 1 cup of black coffee and a bagel with cream cheese..."
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    autoFocus
                                />
                                <Button onClick={handleTextSubmit} disabled={!textInput.trim()}>
                                    Analyze Food
                                </Button>
                                <Button variant="ghost" onClick={() => setStep('upload')}>
                                    Back
                                </Button>
                            </div>
                        )}

                        {step === 'analyzing' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-xl flex items-center justify-center bg-secondary/20"> {/* Added flex, items-center, justify-center, bg-secondary/20 */}
                                    {imagePreview ? ( // Conditional rendering for image or text icon
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Type className="h-12 w-12 text-muted-foreground" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold animate-pulse">Analyzing...</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Identifying food and nutrition
                                </p>
                            </div>
                        )}

                        {step === 'review' && analysisResult && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-secondary">
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{analysisResult.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {analysisResult.calories} kcal
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-lg bg-secondary/30 p-3 text-center">
                                        <div className="text-xs text-muted-foreground uppercase">Protein</div>
                                        <div className="font-bold">{analysisResult.protein}g</div>
                                    </div>
                                    <div className="rounded-lg bg-secondary/30 p-3 text-center">
                                        <div className="text-xs text-muted-foreground uppercase">Carbs</div>
                                        <div className="font-bold">{analysisResult.carbs}g</div>
                                    </div>
                                    <div className="rounded-lg bg-secondary/30 p-3 text-center">
                                        <div className="text-xs text-muted-foreground uppercase">Fat</div>
                                        <div className="font-bold">{analysisResult.fat}g</div>
                                    </div>
                                </div>

                                {analysisResult.items && analysisResult.items.length > 0 && (
                                    <div className="space-y-2 mt-4">
                                        <h4 className="text-sm font-medium text-muted-foreground">Items Detected</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                            {analysisResult.items.map((item: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
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

                                <Button className="w-full" size="lg" onClick={handleSave}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Track Food
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
