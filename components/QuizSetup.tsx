import React, { useState, useCallback } from 'react';
import { Difficulty, QuizMode } from '../types';
import { UploadIcon, BrainIcon, ZapIcon, KeyboardIcon } from './icons';

// Make pdfjsLib available in the component
declare const pdfjsLib: any;

interface QuizSetupProps {
  onStartQuiz: (context:string, questionCount: number, difficulty: Difficulty, title: string, mode: QuizMode) => void;
  error: string | null;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ onStartQuiz, error }) => {
  const [generationType, setGenerationType] = useState<'topic' | 'pdf'>('topic');
  const [topic, setTopic] = useState('');
  const [pdfContent, setPdfContent] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [quizMode, setQuizMode] = useState<QuizMode>('study');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      setIsParsing(true);
      setLocalError(null);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ');
          }
          setPdfContent(text);
          setIsParsing(false);
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error("Error parsing PDF:", err);
        setLocalError("Failed to parse PDF file. Please try another file.");
        setIsParsing(false);
      }
    } else {
      setLocalError("Please select a valid PDF file.");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generationType === 'topic' && topic.trim()) {
      onStartQuiz(topic, questionCount, difficulty, topic, quizMode);
    } else if (generationType === 'pdf' && pdfContent) {
      onStartQuiz(pdfContent, questionCount, difficulty, fileName, quizMode);
    } else {
        setLocalError("Please provide a topic or a valid PDF file.");
    }
  };

  return (
    <div className="w-full">
      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}
      {localError && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-center">{localError}</div>}
      
      <div className="flex bg-slate-700 p-1 rounded-lg mb-6">
        <button onClick={() => setGenerationType('topic')} className={`w-1/2 py-2.5 rounded-md font-semibold transition-all ${generationType === 'topic' ? 'bg-slate-800 shadow text-white' : 'text-slate-400 hover:text-white'}`}>From Topic</button>
        <button onClick={() => setGenerationType('pdf')} className={`w-1/2 py-2.5 rounded-md font-semibold transition-all ${generationType === 'pdf' ? 'bg-slate-800 shadow text-white' : 'text-slate-400 hover:text-white'}`}>From PDF</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {generationType === 'topic' ? (
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-400 mb-2">Topic</label>
            <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The Renaissance Period" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-500" />
          </div>
        ) : (
          <div>
            <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-700/50 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer hover:bg-slate-700">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-8 h-8 mb-2 text-slate-500"/>
                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
                {fileName && <p className="text-xs text-slate-400">{fileName}</p>}
                {isParsing && <p className="text-xs text-yellow-400">Parsing PDF...</p>}
              </div>
              <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-slate-400 mb-2">Number of Questions: <span className="font-bold text-indigo-400">{questionCount}</span></label>
            <input type="range" id="questionCount" min="3" max="15" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
            <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Quiz Mode</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                <button type="button" onClick={() => setQuizMode('study')} className={`flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold transition-all ${quizMode === 'study' ? 'bg-slate-800 shadow text-white' : 'text-slate-400 hover:text-white'}`}>
                    <BrainIcon className="w-5 h-5"/> Study
                </button>
                <button type="button" onClick={() => setQuizMode('test')} className={`flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold transition-all ${quizMode === 'test' ? 'bg-slate-800 shadow text-white' : 'text-slate-400 hover:text-white'}`}>
                    <ZapIcon className="w-5 h-5"/> Test
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
                {quizMode === 'study' ? 'Get instant feedback after each question.' : 'Timed challenge with results at the end.'}
            </p>
        </div>

        <button type="submit" disabled={isParsing} className="w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:-translate-y-px shadow-lg hover:shadow-purple-500/20 disabled:bg-none disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed">
          {isParsing ? 'Processing...' : 'Generate Quiz'}
        </button>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <KeyboardIcon className="w-5 h-5" />
            <p>Pro-Tip: Use keys <span className="font-semibold text-slate-300">1-4</span> to select and <span className="font-semibold text-slate-300">Enter</span> to continue.</p>
        </div>
      </form>
    </div>
  );
};

export default QuizSetup;