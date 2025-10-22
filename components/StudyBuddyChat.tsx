import React, { useState, useEffect, useRef } from 'react';
import { Question, UserAnswer } from '../types';
import { XIcon } from './icons';
import { createStudyBuddyChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import Logo from './Logo';

interface StudyBuddyChatProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  userAnswer: UserAnswer;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const StudyBuddyChat: React.FC<StudyBuddyChatProps> = ({ isOpen, onClose, question, userAnswer }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setMessages([]);
      setIsLoading(true);
      
      // Initialize chat session
      try {
          chatRef.current = createStudyBuddyChat(question, userAnswer || "No answer provided");
          // Send an initial message to get the conversation started
          const getInitialResponse = async () => {
              const result = await chatRef.current?.sendMessageStream("Hello!");
              if(result) {
                let text = '';
                for await (const chunk of result) {
                    text += chunk.text;
                    setMessages([{ role: 'model', text: text }]);
                }
              }
              setIsLoading(false);
          }
          getInitialResponse();
      } catch (error) {
          console.error("Failed to initialize study buddy:", error);
          setMessages([{ role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
          setIsLoading(false);
      }
    }
  }, [isOpen, question, userAnswer]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;
    
    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const result = await chatRef.current.sendMessageStream(input);
        let text = '';
        setMessages(prev => [...prev, { role: 'model', text: ''}]); // Add empty model message
        for await (const chunk of result) {
            text += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = text;
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => [...prev, { role: 'model', text: "I encountered an error. Please try again." }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-slate-700">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" fillColor="#e2e8f0"/>
            <div>
              <h2 className="text-lg font-bold text-white">AI Study Buddy</h2>
              <p className="text-sm text-slate-400">Discussing your answer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-700 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow p-4 overflow-y-auto bg-slate-800/50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
              </div>
            ))}
             {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                       <div className="flex items-center justify-center space-x-1">
                           <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                           <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></div>
                       </div>
                    </div>
                </div>
             )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-500"
              disabled={isLoading}
            />
            <button type="submit" className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full transition-transform transform hover:scale-110 disabled:bg-none disabled:bg-slate-700 disabled:text-slate-500 disabled:scale-100" disabled={isLoading || !input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default StudyBuddyChat;