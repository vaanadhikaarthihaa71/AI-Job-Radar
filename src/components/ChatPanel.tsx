import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Job } from '../types/job';
import { JobStatus } from '../hooks/useJobStatus';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedJobs?: Job[];
  error?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApplyModal: (job: Job) => void;
  getJobStatus?: (id: string) => JobStatus;
}

const STARTER_QUESTIONS = [
  "Find remote ML internships",
  "Why am I a good match for this job?",
  "Show jobs requiring Python and SQL",
  "Which saved jobs should I apply to first?",
  "Summarize this opportunity",
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  onOpenApplyModal,
  getJobStatus,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Welcome to Ask Job Radar. I am your grounded career intelligence assistant. Ask me to find specific remote roles, evaluate skill alignment, or prioritize your application pipeline.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setRateLimitNotice(null);

    try {
      const historyPayload = messages
        .filter((m) => !m.error)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimitNotice(data.error || 'Rate limit exceeded (20 queries/hr). Please try again later.');
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Error (${res.status}): ${data.error || 'Failed to retrieve response from server'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            error: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply || 'No text reply returned.',
            referencedJobs: data.referencedJobs || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Network Error: ${err.message || 'Unable to connect to AI server'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="flex-1" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-label="Ask Job Radar Assistant"
        className="w-full md:max-w-xl h-full bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark border-l border-line dark:border-line-dark shadow-2xl flex flex-col font-sans"
      >
        {/* Header */}
        <div className="border-b border-line dark:border-line-dark px-5 py-4 bg-paper-subtle dark:bg-paper-dark-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-signal/10 border border-signal/30 rounded-sm flex items-center justify-center text-signal">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink dark:text-ink-dark">
                Ask Job Radar
              </h2>
              <p className="text-[11px] text-ink-muted dark:text-ink-dark-muted font-mono">
                Real-Time Career Intelligence Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome-reset',
                    role: 'assistant',
                    content: 'Chat history cleared. How can I assist with your job search today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="px-2.5 py-1 text-[11px] font-mono border border-line dark:border-line-dark hover:border-ink dark:hover:border-ink-dark text-ink-muted dark:text-ink-dark-muted rounded-sm uppercase"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark rounded-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {rateLimitNotice && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 shrink-0 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{rateLimitNotice}</span>
          </div>
        )}

        {/* Message Log Feed */}
        <div aria-live="polite" className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex flex-col space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-muted dark:text-ink-dark-muted uppercase">
                  {isUser ? (
                    <>
                      <span>You</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-signal" />
                      <span>Job Radar</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-sm border text-xs max-w-[92%] leading-relaxed ${
                    isUser
                      ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark border-ink dark:border-ink-dark'
                      : msg.error
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 font-mono'
                      : 'bg-paper-subtle/80 dark:bg-paper-dark-subtle/80 border-line dark:border-line-dark text-ink dark:text-ink-dark'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Referenced Job Cards */}
                  {msg.referencedJobs && msg.referencedJobs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-line dark:border-line-dark space-y-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-signal block">
                        Matching Opportunities ({msg.referencedJobs.length}):
                      </span>
                      <div className="space-y-1.5">
                        {msg.referencedJobs.map((job) => (
                          <div
                            key={job.id}
                            onClick={() => onOpenApplyModal(job)}
                            className="p-2.5 border border-line dark:border-line-dark bg-paper dark:bg-paper-dark hover:border-signal cursor-pointer transition-all flex items-center justify-between gap-2 group rounded-sm"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="font-semibold text-xs text-ink dark:text-ink-dark group-hover:text-signal truncate">
                                {job.title}
                              </div>
                              <div className="text-[11px] text-ink-muted dark:text-ink-dark-muted flex items-center gap-2 font-mono">
                                <span>{job.company}</span>
                                <span>·</span>
                                <span>{job.location}</span>
                                {job.is_remote && <span className="text-signal font-bold">Remote</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-sm">
                                {job.score}%
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-ink-muted dark:text-ink-dark-muted group-hover:text-signal" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-muted dark:text-ink-dark-muted uppercase">
                <Sparkles className="w-3 h-3 text-signal" />
                <span>Job Radar</span>
              </div>
              <div className="p-3 border border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle text-xs text-ink-muted dark:text-ink-dark-muted flex items-center gap-2 rounded-sm font-mono">
                <RefreshCw className="w-3.5 h-3.5 text-signal animate-spin" />
                <span>Analyzing market opportunities...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2 border-t border-line dark:border-line-dark bg-paper-subtle dark:bg-paper-dark-subtle flex items-center gap-1.5 overflow-x-auto shrink-0">
          {STARTER_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-2.5 py-1 border border-line dark:border-line-dark bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark text-[11px] hover:border-signal transition-colors whitespace-nowrap shrink-0 rounded-sm disabled:opacity-50 font-sans"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-line dark:border-line-dark bg-paper dark:bg-paper-dark flex items-center gap-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about jobs, skills, or your application pipeline..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-paper-subtle dark:bg-paper-dark-subtle border border-line dark:border-line-dark text-xs text-ink dark:text-ink-dark placeholder:text-ink-muted dark:placeholder:text-ink-dark-muted focus:outline-none focus:border-signal rounded-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-signal text-white text-xs font-semibold rounded-sm hover:bg-signal/90 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
