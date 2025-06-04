'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Task {
  name: string;
  progress: number;
  icon: string;
}

interface HistoryEntry {
  date: string;
  data: Task[];
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([
    { name: "Read books consistently", progress: 0, icon: "📚" },
    { name: "Meditate daily", progress: 0, icon: "🧘" },
    { name: "Exercise daily", progress: 0, icon: "💪" },
    { name: "Clean workspace", progress: 0, icon: "🧹" },
    { name: "Do Coding", progress: 0, icon: "💻" },
    { name: "Listen Tech podcasts daily", progress: 0, icon: "🎧" },
    { name: "Family time", progress: 0, icon: "👪" },
    { name: "Drink water", progress: 0, icon: "💧" }
  ]);

  const [filterDays, setFilterDays] = useState(7);
  const [summary, setSummary] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);

  const updateProgress = (index: number, delta: number) => {
    setTasks(prev => prev.map((task, i) => 
      i === index 
        ? { ...task, progress: Math.max(0, Math.min(10, task.progress + delta)) }
        : task
    ));
  };

  const saveProgress = () => {
    const date = new Date().toISOString().split('T')[0];
    const history = JSON.parse(localStorage.getItem('progressHistory') || '[]');
    history.push({
      date,
      data: tasks.map(t => ({ name: t.name, progress: t.progress, icon: t.icon }))
    });
    localStorage.setItem('progressHistory', JSON.stringify(history));
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successDiv.textContent = `Progress saved for ${date}`;
    document.body.appendChild(successDiv);
    setTimeout(() => document.body.removeChild(successDiv), 3000);
  };

  const resetProgress = () => {
    if (confirm("Save current progress before resetting?")) {
      saveProgress();
    }
    setTasks(prev => prev.map(task => ({ ...task, progress: 0 })));
  };

  const generateSummary = () => {
    const history: HistoryEntry[] = JSON.parse(localStorage.getItem('progressHistory') || '[]');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filterDays);

    const recent = history.filter(h => new Date(h.date) >= cutoff);

    if (recent.length === 0) {
      setSummary("No data for the selected period.");
      setShowSummary(true);
      return;
    }

    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};

    recent.forEach(entry => {
      entry.data.forEach(item => {
        if (!totals[item.name]) {
          totals[item.name] = 0;
          counts[item.name] = 0;
        }
        totals[item.name] += item.progress;
        counts[item.name]++;
      });
    });

    let summaryText = `<strong>Summary (Last ${filterDays} Days):</strong><ul class="mt-2 space-y-1">`;
    Object.keys(totals).forEach(name => {
      const avg = (totals[name] / counts[name]).toFixed(1);
      const percentage = ((totals[name] / counts[name]) * 10).toFixed(0);
      summaryText += `<li class="flex justify-between"><span>${name}:</span><span>Avg ${avg}/10 (${percentage}%)</span></li>`;
    });
    summaryText += "</ul>";

    setSummary(summaryText);
    setShowSummary(true);
  };

  const renderProgressBar = (progress: number) => {
    const filled = "▓".repeat(progress);
    const empty = "░".repeat(10 - progress);
    return filled + empty;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return "text-gray-400";
    if (progress <= 3) return "text-red-500";
    if (progress <= 6) return "text-yellow-500";
    if (progress <= 9) return "text-blue-500";
    return "text-green-500";
  };

  const getTotalProgress = () => {
    const total = tasks.reduce((sum, task) => sum + task.progress, 0);
    const max = tasks.length * 10;
    return Math.round((total / max) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Progress Tracker</h1>
          <p className="text-gray-600">Track your daily habits and goals</p>
          <div className="mt-4 bg-white rounded-full p-1 inline-block shadow-sm">
            <div className="text-sm font-medium text-gray-700">
              Overall Progress: <span className="text-indigo-600 font-bold">{getTotalProgress()}%</span>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4 mb-8">
          {tasks.map((task, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{task.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{task.name}</h3>
                    <div className={`font-mono text-sm ${getProgressColor(task.progress)}`}>
                      [{renderProgressBar(task.progress)}] {task.progress}/10
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => updateProgress(index, -1)}
                    className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600"
                    disabled={task.progress === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-bold text-lg">{task.progress}</span>
                  <Button
                    onClick={() => updateProgress(index, 1)}
                    className="w-8 h-8 p-0 bg-green-500 hover:bg-green-600"
                    disabled={task.progress === 10}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar Visual */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      task.progress === 0 ? 'bg-gray-400' :
                      task.progress <= 3 ? 'bg-red-500' :
                      task.progress <= 6 ? 'bg-yellow-500' :
                      task.progress <= 9 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${task.progress * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <Button onClick={saveProgress} className="bg-blue-500 hover:bg-blue-600">
                💾 Save Progress
              </Button>
              <Button onClick={resetProgress} className="bg-orange-500 hover:bg-orange-600">
                🔄 Reset
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <label htmlFor="filter" className="text-sm font-medium text-gray-700">
                Summary:
              </label>
              <select
                id="filter"
                value={filterDays}
                onChange={(e) => setFilterDays(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Button onClick={generateSummary} className="bg-purple-500 hover:bg-purple-600">
                📈 View Summary
              </Button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {showSummary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Progress Summary</h3>
              <Button 
                onClick={() => setShowSummary(false)}
                className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100 text-sm p-1"
              >
                ✕
              </Button>
            </div>
            <div 
              className="text-gray-700" 
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          </div>
        )}

        {/* Chat Button - Floating */}
        <div className="fixed bottom-6 right-6">
          <Link href="/chat">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2">
              <span className="text-xl">🧠</span>
              <span className="font-medium">Ask AI about Progress</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
