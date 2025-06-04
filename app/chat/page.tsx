'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: "Hello! I'm your Progress Tracker AI assistant. I can help you analyze your progress, suggest improvements, set goals, and provide motivation. What would you like to know about your progress today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const getProgressContext = () => {
    try {
      const history = JSON.parse(localStorage.getItem('progressHistory') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const recentEntries = history.slice(-7); // Last 7 entries
      
      return `
Progress Tracking Context:
- Recent progress history: ${recentEntries.length > 0 ? JSON.stringify(recentEntries) : 'No saved progress yet'}
- Current date: ${today}
- Available tasks: Reading, Meditation, Exercise, Cleaning workspace, Learning coding, Drinking water
      `;
    } catch {
      return 'Progress Tracking Context: No progress history available yet.';
    }
  };

  async function sendMessage() {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    
    const contextualInput = input + "\n\n" + getProgressContext();
    setInput('');

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `You are a helpful Progress Tracker AI assistant. Help users with their daily habits and progress tracking. Answer questions about their progress data, provide motivation, suggest improvements, and help them stay on track with their goals.

User question: ${input}

Context: ${getProgressContext()}

Please provide a helpful, encouraging response focused on progress tracking and personal development:`,
          stream: false
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const assistantMessage = { role: 'assistant' as const, content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: 'assistant' as const, content: 'Sorry, there was an error processing your request. Make sure Ollama is running with the llama3 model.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  const quickQuestions = [
    "How is my overall progress this week?",
    "What habits should I focus on improving?",
    "Give me motivation to stay consistent",
    "Analyze my progress patterns",
    "What goals should I set for tomorrow?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🧠 Progress AI Assistant</h1>
            <p className="text-gray-600">Ask me anything about your progress and habits</p>
          </div>
          <Link href="/">
            <Button className="bg-gray-500 hover:bg-gray-600">
              ← Back to Tracker
            </Button>
          </Link>
        </div>

        {/* Quick Questions */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Questions:</h3>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                onClick={() => setInput(question)}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm py-1 px-3"
                disabled={loading}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-indigo-100 ml-8 border-l-4 border-indigo-500'
                    : 'bg-gray-50 mr-8 border-l-4 border-purple-500'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                    {msg.role === 'user' ? '👤 You' : '🧠 AI'}
                  </span>
                </div>
                <div className="mt-2 text-gray-800 whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="bg-gray-50 mr-8 border-l-4 border-purple-500 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">🧠 AI</span>
                  <span className="text-gray-500">Thinking...</span>
                </div>
                <div className="mt-2 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              disabled={loading}
              placeholder="Ask about your progress, habits, goals, or motivation..."
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8"
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
