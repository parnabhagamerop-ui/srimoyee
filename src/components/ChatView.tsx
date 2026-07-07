import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Trash2, Heart, HelpCircle, AlertCircle, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PRESET_QUESTIONS = [
  { text: "Cramps thamanor upay ki? 🩹", query: "Cramps komate ki korte pari? Kono ghoroya tips thakle bolo." },
  { text: "What to eat during periods? 🍫", query: "What are the best comfort foods and healthy things to eat during periods to reduce pain or bloating?" },
  { text: "Eto mood swing keno hoy? 🍂", query: "Amari eto mood swings ar khub rag ba kanna uthche keno? Ami nijeke kemne calm rakhbo?" },
  { text: "Period skip hobar karon? 📅", query: "What are the common reasons for delayed or missed periods, and when should I consult a doctor?" }
];

// Helper to play a cute synthesized cartoon giggle sound effect
const playCartoonGiggle = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // triangle sounds soft, cute, and woody
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + duration);
      
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    // Play sweet rapid ascending/alternating tones for a cartoon giggle "hihihi!"
    const now = ctx.currentTime;
    playTone(523.25, now, 0.08);       // C5
    playTone(659.25, now + 0.08, 0.08);  // E5
    playTone(587.33, now + 0.16, 0.08);  // D5
    playTone(783.99, now + 0.24, 0.12);  // G5
  } catch (e) {
    console.error("Audio Synthesis failed:", e);
  }
};

// Helper to play a start-recording indicator chirp
const playStartChirp = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey beautiful! 🍓 I'm Pavoo, your cute AI cycle assistant. 🩺✨ Tomar period, cramps, mood swings, khabar, ba cycle niye jekono prosno thakle amake ask koro! I'm here to give you cozy tips and comfort! 🩸🍫 Remind rekhoni, ami cute mascot kintu - khub beshi somossa hole real doctor dekhano bhalo! 💕",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem('pavoo_voice_enabled');
    return saved !== 'false'; // default is true (enabled)
  });
  const [isListening, setIsListening] = useState(false);
  const [micLang, setMicLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clear speech feedback after a few seconds
  useEffect(() => {
    if (speechFeedback) {
      const timer = setTimeout(() => {
        setSpeechFeedback('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [speechFeedback]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = micLang;
      
      rec.onstart = () => {
        setIsListening(true);
        setSpeechFeedback('Listening... speak now! 🎙️✨');
        playStartChirp();
      };
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => {
            const space = prev.trim() ? ' ' : '';
            return prev + space + transcript;
          });
          setSpeechFeedback('Captured successfully! 🎉💖');
        }
      };
      
      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
        if (err.error === 'no-speech') {
          setSpeechFeedback('No voice detected! Speak closer to the microphone 🎙️❤️');
        } else if (err.error === 'not-allowed') {
          setSpeechFeedback('Mic access blocked! Please enable microphone in address bar 🔒🎙️');
        } else if (err.error === 'aborted') {
          setSpeechFeedback('Voice listening cancelled.');
        } else {
          setSpeechFeedback('Could not hear clearly! Please try again 🌸');
        }
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = rec;
    }
  }, [micLang]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Oops! Speech Recognition isn't fully supported in your current browser session. Please try Google Chrome! 🌸");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis?.cancel(); // Mute assistant if speaking
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start SpeechRecognition:", e);
      }
    }
  };

  // Perform Cartoon Text-to-Speech speaking with laughter
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Play the physical cute giggles sound effect!
    playCartoonGiggle();
    
    // Clean text of symbols and emojis to prevent reading them aloud
    let cleanText = text
      .replace(/\*\*?/g, '') // remove markdown bold stars
      .replace(/🍓|🩸|✨|🧸|🍫|🌸|🩺|🩹|👑|🐱|🥑|🦄|💕|📅|🍂|🩹|💭|🔌|💻/g, '')
      .replace(/[#:*-]/g, ' ')
      .trim();

    // Cartoonish giggles list to say aloud
    const cartoonLaughs = [
      "Hehehe! Hihi! ",
      "Hehe, hihi! ",
      "Hihihi! ",
      "Hehehe, "
    ];
    const prefix = cartoonLaughs[Math.floor(Math.random() * cartoonLaughs.length)];
    const textToSpeak = prefix + cleanText + " ... hihihi!";

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set cute cartoonish high pitch and lively speed
    utterance.pitch = 1.6; // High pitch
    utterance.rate = 1.05;  // Energetic rate

    const hasBengali = /[\u0980-\u09FF]/.test(text);
    if (hasBengali) {
      utterance.lang = 'bn-BD';
    } else {
      utterance.lang = 'en-US';
    }

    // Try finding a suitable local voice
    const voices = window.speechSynthesis.getVoices();
    const suitableVoice = voices.find(v => 
      hasBengali 
        ? v.lang.startsWith('bn')
        : (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('siri'))
    );
    if (suitableVoice) {
      utterance.voice = suitableVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Keep only the last 15 messages to stay within prompt limits
      const chatHistory = [...messages, userMessage].slice(-15).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      const responseText = data.text || "Oops, my strawberry signal got weak! 🍓 Can you ask again, sweetheart?";
      
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      }]);

      // Speak aloud!
      speakText(responseText);
    } catch (error) {
      console.error("Chat API error:", error);
      const errorText = "Oh no! My brain fuzzy connection failed! 🔌 Please check your network and make sure the GEMINI_API_KEY is added in Secrets! 🥺🍓 Let's try again in a bit!";
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: errorText,
        timestamp: new Date()
      }]);
      speakText(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Pavoo r sathe chat history clear korte চাও? 🍓")) {
      window.speechSynthesis?.cancel();
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Chat restarted! 🍓 Ask me anything you want about menstrual health, comfort foods, or cozy habits! ✨🩸",
          timestamp: new Date()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-[#FFFFFF] border-bubbly rounded-3xl overflow-hidden bubbly-shadow">
      
      {/* Bot Header Info */}
      <div className="bg-[#FFCAD4] px-4 py-3 border-b-4 border-[#3D0C11] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#3D0C11] flex items-center justify-center text-xl shadow-sm relative overflow-hidden">
            🍓
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-[#3D0C11] rounded-full"></span>
          </div>
          <div>
            <h3 className="font-mono text-sm font-black text-[#3D0C11] leading-none">Pavoo's Cozy Corner</h3>
            <span className="text-[9px] font-sans font-bold text-[#FF7597] uppercase tracking-wide">AI Cycle Health Bot 🩺</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mute/Unmute toggle for cartoon speaking */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !voiceEnabled;
              setVoiceEnabled(nextVal);
              localStorage.setItem('pavoo_voice_enabled', String(nextVal));
              if (!nextVal) {
                window.speechSynthesis?.cancel();
              } else {
                playCartoonGiggle();
              }
            }}
            title={voiceEnabled ? "Mute Pavoo's Voice 🔊" : "Unmute Pavoo's Voice 🔇"}
            className={`p-1.5 rounded-xl transition-all border-2 active:border-[#3D0C11] cursor-pointer ${
              voiceEnabled ? 'text-pink-600 bg-pink-100/50 border-[#3D0C11]' : 'text-gray-400 bg-gray-50 border-transparent'
            }`}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={handleClearChat}
            title="Clear Chat"
            className="p-1.5 hover:bg-white/50 text-[#3D0C11] rounded-xl transition-all cursor-pointer border-2 border-transparent active:border-[#3D0C11]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFDFE]">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar Mini Indicator */}
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#FFCAD4] border border-[#3D0C11] text-[11px] flex items-center justify-center shadow-sm shrink-0">
                      🍓
                    </div>
                  )}
                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#9BF6FF] border border-[#3D0C11] text-[11px] flex items-center justify-center shadow-sm shrink-0">
                      👑
                    </div>
                  )}

                  {/* Speech Bubble */}
                  <div
                    className={`p-3 rounded-2xl border-2 border-[#3D0C11] text-xs font-medium leading-relaxed bubbly-shadow-sm relative group ${
                      isUser
                        ? 'bg-[#B9FBC0] text-[#3D0C11] rounded-tr-none'
                        : 'bg-[#FFCAD4]/30 text-[#3D0C11] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      {/* Read-aloud speaker trigger on bubble */}
                      {!isUser && window.speechSynthesis && (
                        <button
                          type="button"
                          onClick={() => speakText(msg.content)}
                          title="Read this out loud 📣"
                          className="p-0.5 text-pink-600 hover:text-pink-800 transition-colors cursor-pointer"
                        >
                          <Volume2 size={10} />
                        </button>
                      )}
                      <span className="block text-[8px] opacity-60 ml-auto font-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* AI Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#FFCAD4] border border-[#3D0C11] text-xs flex items-center justify-center shrink-0">
              🍓
            </div>
            <div className="bg-[#FDFFB6] border-2 border-[#3D0C11] bubbly-shadow-sm p-3 rounded-2xl rounded-tl-none text-xs text-[#3D0C11] flex items-center gap-2 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7597] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7597]"></span>
              </span>
              Pavoo is thinking of cute tips... 💭
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-[#FFFDFE] border-t-2 border-dashed border-[#3D0C11]/20 flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pq.query)}
              className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#FDFFB6] hover:bg-[#FDFFB6]/80 text-[#3D0C11] border border-[#3D0C11] rounded-full cursor-pointer transition-all active:scale-95"
            >
              {pq.text}
            </button>
          ))}
        </div>
      )}

      {/* Voice Assistant Feedback Banner */}
      {speechFeedback && (
        <div className="px-3 py-1.5 bg-[#FDFFB6] text-[10px] text-center border-t-2 border-dashed border-[#3D0C11]/20 text-[#3D0C11] font-mono font-bold flex items-center justify-center gap-1.5">
          <span className="animate-pulse">🎙️ {speechFeedback}</span>
        </div>
      )}

      {/* Input Form Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 bg-[#FFFFFF] border-t-3 border-[#3D0C11] flex gap-1.5 items-center"
      >
        {/* Cute Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? "Stop listening 🛑" : "Talk to Pavoo with Mic 🎙️"}
          className={`p-2.5 border-2 border-[#3D0C11] rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 ${
            isListening 
              ? 'bg-rose-500 text-white animate-pulse' 
              : 'bg-[#FDFFB6] text-[#3D0C11] hover:bg-[#FDFFB6]/90'
          }`}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        {/* Dynamic speech language tag toggle */}
        {speechSupported && (
          <button
            type="button"
            onClick={() => setMicLang(prev => prev === 'bn-BD' ? 'en-US' : 'bn-BD')}
            title="Toggle speaking language (Bangla / English)"
            className="px-1.5 py-2.5 bg-pink-100 hover:bg-[#FFCAD4] text-[#3D0C11] border-2 border-[#3D0C11] rounded-xl text-[9px] font-mono font-black shrink-0 transition-colors active:scale-90"
          >
            {micLang === 'bn-BD' ? '🇧🇩 BN' : '🇺🇸 EN'}
          </button>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={isListening ? "Listening... say something! 🎤✨" : "Pavoo k cramps ba mood niye bolun... 🌸"}
          className="flex-1 bg-[#FFF0F5]/50 border-2 border-[#3D0C11] rounded-xl px-2.5 py-2 text-xs font-medium focus:outline-none focus:bg-white text-[#3D0C11] placeholder-[#3D0C11]/50"
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-3.5 py-2 bg-[#FFCAD4] hover:bg-[#FFCAD4]/90 text-[#3D0C11] border-2 border-[#3D0C11] rounded-xl bubbly-shadow-sm flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5"
        >
          <Send size={13} className="mr-1 shrink-0" />
          <span className="font-mono text-xs font-black">Send</span>
        </button>
      </form>

      {/* Disclaimer disclaimer */}
      <div className="bg-[#FFF0F5] px-3 py-1 text-[8px] text-center border-t border-[#3D0C11]/10 text-gray-500 flex items-center justify-center gap-1">
        <AlertCircle size={10} className="text-[#FF7597]" />
        <span>Pavoo is an AI companion & is not a replacement for medical advice. Please check with a doctor for serious issues.</span>
      </div>
    </div>
  );
}
