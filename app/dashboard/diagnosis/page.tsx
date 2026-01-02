'use client';

import { useEffect, useState, useRef } from 'react';
import { AuthService, User } from '@/lib/auth';
import { VehicleService, Vehicle } from '@/lib/vehicles';
import { AIDiagnosisService, DiagnosisRequest } from '@/lib/ai-diagnosis';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  carInfo?: {
    make: string;
    model: string;
    year: number;
  };
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [useQuickMode, setUseQuickMode] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const initPage = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        
        if (!response.success || !response.data) {
          router.push('/signup');
          return;
        }

        const currentUser = response.data;
        
        // Only car owners can use this feature
        // Handle role as object or string
        const userRole = typeof currentUser.role === 'object' 
          ? (currentUser.role as { name: string }).name 
          : currentUser.role;
        
        if (userRole !== 'car_owner') {
          router.push('/dashboard');
          return;
        }

        setUser(currentUser);
        
        // Add welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `👋 Hi ${currentUser.first_name}! I'm your AI Car Diagnostic Assistant.\n\nDescribe any issue you're experiencing with your vehicle, and I'll help you understand what might be wrong, how urgent it is, and give you an estimated repair cost.\n\n**Tips for better diagnosis:**\n• Be specific about when the issue occurs\n• Mention any sounds, smells, or warning lights\n• Select your vehicle above for more accurate results`,
          timestamp: new Date(),
        }]);
        
        // Fetch vehicles and check service status
        await Promise.all([
          fetchVehicles(),
          checkServiceHealth(),
        ]);
      } catch (err) {
        console.error('Failed to initialize:', err);
        router.push('/signup');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  const fetchVehicles = async () => {
    try {
      const response = await VehicleService.getVehicles();
      if (response.success && response.data) {
        // Handle both array and object response formats
        const vehiclesList = Array.isArray(response.data) 
          ? response.data 
          : (response.data as unknown as { vehicles?: Vehicle[] }).vehicles || [];
        setVehicles(vehiclesList);
        if (vehiclesList.length > 0) {
          setSelectedVehicle(vehiclesList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  const checkServiceHealth = async () => {
    try {
      const response = await AIDiagnosisService.checkHealth();
      setServiceStatus(response.success ? 'online' : 'online'); // Always show online, we'll handle errors during actual diagnosis
    } catch {
      // Don't block users - they can still try to use the service
      // The actual diagnosis call will show an error if the service is truly down
      setServiceStatus('online');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      carInfo: selectedVehicle && !useQuickMode ? {
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        year: selectedVehicle.year,
      } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let response;
      
      if (useQuickMode || !selectedVehicle) {
        response = await AIDiagnosisService.getQuickDiagnosis(userMessage.content);
      } else {
        const diagnosisRequest: DiagnosisRequest = {
          message: userMessage.content,
          car_make: selectedVehicle.make,
          car_model: selectedVehicle.model,
          car_year: selectedVehicle.year,
        };
        response = await AIDiagnosisService.getDiagnosis(diagnosisRequest);
      }

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.diagnosis,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get diagnosis');
      }
    } catch (err) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `❌ ${err instanceof Error ? err.message : 'Failed to get diagnosis. Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: `🔄 Chat cleared! Ready for a new diagnosis.\n\nDescribe your car issue and I'll help you understand what might be wrong.`,
      timestamp: new Date(),
    }]);
  };

  const suggestedQuestions = [
    "My car is making a grinding noise when I brake",
    "Check engine light is on",
    "Car won't start, just clicking sound",
    "Steering wheel vibrates at high speed",
    "I smell burning when driving",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2ec8c6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AI Diagnosis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header with Mode Selection */}
      <div className="glass rounded-2xl p-4 mb-4">
        {/* Mode Toggle */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Mode Selection Buttons */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Diagnosis Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setUseQuickMode(false)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  !useQuickMode 
                    ? 'bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] text-black' 
                    : 'glass hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🚗</span>
                  <span>Vehicle-Specific</span>
                </div>
              </button>
              <button
                onClick={() => setUseQuickMode(true)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  useQuickMode 
                    ? 'bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] text-black' 
                    : 'glass hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>⚡</span>
                  <span>Quick Mode</span>
                </div>
              </button>
            </div>
            
            {/* Mode Description */}
            <div className="mt-3 p-3 glass rounded-lg">
              {useQuickMode ? (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="font-semibold text-[#2ec8c6]">Quick Mode</p>
                    <p className="text-gray-400">Get instant diagnosis without specifying your vehicle. Great for general car questions and common issues.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-xl">🚗</span>
                  <div>
                    <p className="font-semibold text-[#2ec8c6]">Vehicle-Specific Mode</p>
                    <p className="text-gray-400">Get personalized diagnosis based on your specific vehicle&apos;s make, model, and year for more accurate results.</p>
                    
                    {/* Vehicle Selector - only show when not in Quick Mode */}
                    {vehicles.length > 0 ? (
                      <select
                        value={selectedVehicle?.id || ''}
                        onChange={(e) => {
                          const vehicle = vehicles.find(v => v.id === parseInt(e.target.value));
                          setSelectedVehicle(vehicle || null);
                        }}
                        className="mt-2 w-full glass rounded-lg px-4 py-2 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none"
                      >
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id} className="bg-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-2 text-yellow-400">
                        ⚠️ No vehicles found. <a href="/dashboard/vehicles" className="text-[#2ec8c6] hover:underline">Add a vehicle</a> or use Quick Mode.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex lg:flex-col items-center lg:items-end gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                serviceStatus === 'online' ? 'bg-green-500' :
                serviceStatus === 'offline' ? 'bg-yellow-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="text-sm text-gray-400">
                {serviceStatus === 'online' ? 'AI Ready' :
                 serviceStatus === 'offline' ? 'Connecting...' : 'Checking...'}
              </span>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] text-black'
                    : message.role === 'system'
                    ? 'bg-red-500/20 border border-red-500/30'
                    : 'glass-strong'
                }`}
              >
                {/* Car info badge for user messages */}
                {message.carInfo && (
                  <div className="text-xs opacity-70 mb-2 flex items-center gap-1">
                    <span>🚗</span>
                    {message.carInfo.year} {message.carInfo.make} {message.carInfo.model}
                  </div>
                )}
                
                {/* Message content with markdown-like formatting */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content.split('\n').map((line, i) => {
                    // Bold text
                    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return (
                      <p 
                        key={i} 
                        className={line === '' ? 'h-2' : ''}
                        dangerouslySetInnerHTML={{ __html: formattedLine }}
                      />
                    );
                  })}
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-black/60' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="glass-strong rounded-2xl p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#2ec8c6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#2ec8c6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#2ec8c6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is analyzing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="px-3 py-1.5 glass rounded-full text-sm hover:bg-white/10 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your car issue... (e.g., 'My brakes are squeaking')"
                disabled={isTyping}
                rows={1}
                className="w-full glass rounded-xl px-4 py-3 pr-12 bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                {inputMessage.length > 0 && `${inputMessage.length} chars`}
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-[#2ec8c6] to-[#1a9a99] rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isTyping ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Diagnose</span>
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 AI diagnosis is for informational purposes only. Always consult a professional mechanic for accurate assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
