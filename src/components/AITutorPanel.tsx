import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ChatMessage } from "../types";

interface AITutorPanelProps {
  contextData?: {
    voltage: number;
    resistance: number;
    current: number;
    switchClosed: boolean;
  };
  onClose?: () => void;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  contextData = { voltage: 5.0, resistance: 10.0, current: 0.5, switchClosed: true },
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "tutor",
      text: `Hello! I'm **Professor AR**, your AI Science Laboratory Tutor. I'm connected to your live Ohm's Law circuit simulation. How can I assist your physical investigations today?`,
      timestamp: "Just now",
      source: "EduAR Laboratory Intelligence",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    "Why did the bulb become brighter?",
    "What happens if I increase resistance to maximum?",
    "How does the slope of the V-I graph relate to resistance?",
    "Why is the ammeter in series and voltmeter in parallel?",
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice playback using Web Speech API synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis unavailable:", e);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputPrompt("");
    setIsLoading(true);

    try {
      // Call server-side API route
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          context: contextData,
        }),
      });

      if (!response.ok) {
        throw new Error("Server API response error");
      }

      const data = await response.json();
      const tutorReply = data.reply || "Ohm's Law states V = I × R.";

      const replyMsg: ChatMessage = {
        id: `tut-${Date.now()}`,
        role: "tutor",
        text: tutorReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source || "gemini-3.7-flash",
      };

      setMessages((prev) => [...prev, replyMsg]);
      speakText(tutorReply);
    } catch (error) {
      console.warn("API request failed, using intelligent client-side fallback:", error);

      // Robust client fallback
      const q = textToSend.toLowerCase();
      let fallback = `According to Ohm's Law ($V = I \\times R$), at your current settings ($V = ${contextData.voltage}\\text{V}, R = ${contextData.resistance}\\Omega$), the current is $I = ${(contextData.voltage / contextData.resistance).toFixed(2)}\\text{ A}$.`;

      if (q.includes("bright") || q.includes("bulb")) {
        fallback = `When voltage increases while resistance stays constant, current increases according to Ohm's Law ($I = V / R$). The higher current causes greater electrical power dissipation ($P = I^2 \\times R$), causing the tungsten filament to heat up and the bulb to appear brighter in this simulation.`;
      } else if (q.includes("maximum") || q.includes("resistance")) {
        fallback = `When you increase resistance to maximum, the opposition to electron drift increases. Current decreases inversely ($I = V / R$), which dims the bulb and lowers the ammeter deflection.`;
      } else if (q.includes("slope") || q.includes("graph")) {
        fallback = `On the V-I coordinate plot, the slope ($\\Delta V / \\Delta I$) directly equals the circuit resistance in Ohms. A steeper linear line represents a higher ohmic resistance.`;
      }

      const fallbackMsg: ChatMessage = {
        id: `tut-${Date.now()}`,
        role: "tutor",
        text: fallback,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "local-physics-engine",
      };

      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] max-h-[85vh] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
      {/* Tutor Top Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white">Professor AR</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                Class 10 Physics AI
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Context-Aware Virtual Science Tutor
            </p>
          </div>
        </div>

        {/* Live Parameters Pill & Audio button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-cyan-300">
            <span>V: {contextData.voltage.toFixed(1)}V</span>
            <span>•</span>
            <span>R: {contextData.resistance.toFixed(1)}Ω</span>
            <span>•</span>
            <span>I: {contextData.current.toFixed(2)}A</span>
          </div>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            title={voiceEnabled ? "Mute tutor voice" : "Enable tutor voice readout"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isTutor = msg.role === "tutor";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isTutor ? "items-start" : "items-end justify-end"}`}
            >
              {isTutor && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-900 to-cyan-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isTutor
                    ? "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                    : "bg-blue-900 text-white rounded-tr-xs"
                }`}
              >
                {/* Formatted Content */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.text}
                </div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isTutor ? "text-slate-400" : "text-blue-200"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {msg.source}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-start animate-in fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-900 to-cyan-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
              <span>Analyzing circuit physics & formulating guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
          Ask:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 text-xs font-medium border border-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          id="ai-tutor-input-box"
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          placeholder="Ask Professor AR about Ohm's Law, bulb brightness, slope..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all"
        />
        <button
          id="ai-tutor-send-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:bg-slate-200 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};
