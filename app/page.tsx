'use client';

import { useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NutritionSummary } from '@/components/nutrition-summary';
import { MacroDisplay } from '@/components/macro-display';
import { UploadModal } from '@/components/upload-modal';
import { GoalCalculator } from '@/components/goal-calculator';
import { FoodEntryItem } from '@/components/food-entry-item';
import { Entry } from '@/lib/types';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [macroGoals, setMacroGoals] = useState({ protein: 150, carbs: 250, fat: 70 });
  const [settings, setSettings] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, settingsRes] = await Promise.all([
        fetch('/api/entries'),
        fetch('/api/settings')
      ]);
      const entriesData = await entriesRes.json();
      const settingsData = await settingsRes.json();

      setEntries(entriesData);
      setSettings(settingsData);
      setDailyGoal(settingsData.dailyGoal);
      setMacroGoals({
        protein: settingsData.proteinGoal || 150,
        carbs: settingsData.carbsGoal || 250,
        fat: settingsData.fatGoal || 70
      });
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (data: any) => {
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          nutrition: {
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
          },
          items: data.items,
        }),
      });
      const newEntry = await res.json();
      setEntries([...entries, newEntry]);
      setIsUploadOpen(false);
    } catch (error) {
      console.error('Failed to save entry', error);
    }
  };

  const handleSaveSettings = async (data: any) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setDailyGoal(data.dailyGoal);
      setMacroGoals({
        protein: data.proteinGoal,
        carbs: data.carbsGoal,
        fat: data.fatGoal
      });
      setSettings({ ...settings, ...data });
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete entry', error);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.toDateString() === currentDate.toDateString();
  });

  const totalCalories = filteredEntries.reduce((sum, entry) => sum + entry.nutrition.calories, 0);
  const totalProtein = filteredEntries.reduce((sum, entry) => sum + entry.nutrition.protein, 0);
  const totalCarbs = filteredEntries.reduce((sum, entry) => sum + entry.nutrition.carbs, 0);
  const totalFat = filteredEntries.reduce((sum, entry) => sum + entry.nutrition.fat, 0);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-md mx-auto p-6 pb-32">
      <motion.header
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevDay} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight gradient-text mb-1">
              {isToday ? 'Today' : currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="rounded-full"
            disabled={isToday}
          >
            <ChevronRight className={`h-5 w-5 ${isToday ? 'opacity-30' : ''}`} />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full hover:bg-primary/10 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </motion.header>

      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <NutritionSummary
          current={totalCalories}
          goal={dailyGoal}
          label="Calories"
          unit="kcal"
        />
      </motion.section>

      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MacroDisplay
          protein={totalProtein}
          proteinGoal={macroGoals.protein}
          carbs={totalCarbs}
          carbsGoal={macroGoals.carbs}
          fat={totalFat}
          fatGoal={macroGoals.fat}
        />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="mb-5 text-lg font-semibold text-foreground">Recent Entries</h2>
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <motion.div
              className="rounded-2xl border-2 border-dashed border-border/50 p-12 text-center backdrop-blur-sm bg-card/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4 opacity-20">🍽️</div>
              <p className="text-muted-foreground text-sm">
                No food tracked for this day.
              </p>
              {isToday && (
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Tap the + button to add your first entry
                </p>
              )}
            </motion.div>
          ) : (
            filteredEntries.map((entry) => (
              <FoodEntryItem
                key={entry.id}
                entry={entry}
                onDelete={handleDeleteEntry}
              />
            ))
          )}
        </div>
      </motion.section>

      <motion.div
        className="fixed bottom-8 right-6 left-6 max-w-md mx-auto flex justify-end pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button
          size="icon"
          className="h-16 w-16 rounded-full shadow-2xl pointer-events-auto bg-gradient-to-br from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 hover:scale-110 hover:shadow-primary/50"
          onClick={() => setIsUploadOpen(true)}
        >
          <Plus className="h-7 w-7" />
        </Button>
      </motion.div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSave={handleSaveEntry}
      />

      <GoalCalculator
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={settings}
      />
    </main>
  );
}
