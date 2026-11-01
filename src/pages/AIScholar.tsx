import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, User, HelpCircle, Loader2, Globe, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "What is the difference between Shukla and Krishna Yajurveda?",
  "Explain the significance of the Agnihotra ritual",
  "What is the Gayatri mantra and its importance?",
  "Who were the Adhvaryu priests?",
  "What philosophical concepts are found in the Isha Upanishad?",
];

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TAVILY_API_URL = 'https://api.tavily.com/search';

export default function AIScholar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const performWebSearch = async (query: string): Promise<string> => {
    const tavilyKey = import.meta.env.VITE_TAVILY_API_KEY;
    if (!tavilyKey) {
      throw new Error('Tavily API key not configured');
    }

    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${query} Yajurveda Vedic`,
        search_depth: 'basic',
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error('Web search failed');
    }

    const data = await response.json();
    const results = data.results || [];
    
    if (results.length === 0) {
      return 'No relevant web results found.';
    }

    return results
      .map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
      .join('\n\n');
  };

  const streamGroqResponse = async (
    userMessage: string, 
    webContext: string = ''
  ) => {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!groqKey) {
      return `**API Key Required**

To use the AI Scholar feature, please configure your Groq API key:

1. Create a \`.env\` file in your project root
2. Add: \`VITE_GROQ_API_KEY=your_groq_api_key\`
3. Optionally add: \`VITE_TAVILY_API_KEY=your_tavily_key\` for web search
4. Restart the development server

Get your free Groq API key at: https://console.groq.com`;
    }

    const systemPrompt = `You are an expert scholar of Yajurveda and Vedic literature. You have deep knowledge of:
- Shukla (White) Yajurveda and Krishna (Black) Yajurveda
- Satapatha Brahmana and other Brahmana texts
- Vedic rituals, mantras, and their significance
- Sanskrit terminology and translations
- Vedic philosophy and Upanishadic concepts

Provide accurate, scholarly responses. When discussing mantras, include Sanskrit terms where relevant.
Use clear, simple paragraphs by default, with Markdown for emphasis and headings when helpful. Use lists only when they improve readability. Avoid tables unless information genuinely needs a side-by-side comparison or tabular layout. Be concise but thorough, and cite sources when possible.

${webContext ? `\n\nRelevant web search results:\n${webContext}\n\nUse these sources to enhance your response where relevant.` : ''}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      let webContext = '';
      
      // Perform web search if enabled
      if (useWebSearch) {
        setIsSearching(true);
        try {
          webContext = await performWebSearch(currentInput);
        } catch (err) {
          console.error('Web search error:', err);
          toast.error('Web search failed, proceeding without it');
        }
        setIsSearching(false);
      }

      const response = await streamGroqResponse(currentInput, webContext);
      
      // Handle non-streaming response (when API key is missing)
      if (typeof response === 'string') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // Create assistant message placeholder
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantId 
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat history cleared');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="bg-gradient-hero py-8 px-4 mandala-pattern">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-foreground text-sm mb-4">
            <Bot className="w-4 h-4" />
            <span>Powered by Groq</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            AI Scholar
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ask questions about Yajurveda, Vedic rituals, and Sanskrit scriptures
          </p>
        </div>
      </section>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col py-6 px-4">
        <div className="container mx-auto flex-1 flex flex-col max-w-4xl">
          <Card className="flex-1 flex flex-col min-h-[500px]">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Clear Chat Button */}
              {messages.length > 0 && (
                <div className="flex justify-end p-3 border-b border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Chat
                  </Button>
                </div>
              )}
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Bot className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      Welcome to AI Scholar
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-8">
                      I'm here to help you explore the wisdom of Yajurveda. 
                      Ask me anything about the sacred texts, rituals, or Vedic philosophy.
                    </p>
                    
                    {/* Suggested Questions */}
                    <div className="w-full max-w-lg">
                      <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Try asking:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {suggestedQuestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleSuggestedQuestion(question)}
                          >
                            {question.length > 40 ? question.slice(0, 40) + '...' : question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-3 animate-fade-in',
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          )}
                        >
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className={cn(
                            'flex-1 rounded-xl p-4 max-w-[80%]',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-secondary'
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <div className="max-w-full overflow-x-auto">
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </p>
                          )}
                          {/* Source citation footer for assistant messages */}
                          {message.role === 'assistant' && message.content && !message.content.includes('API Key Required') && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <p className="text-xs text-muted-foreground italic">
                                Sources: Yajurveda texts (Griffith translation), Satapatha Brahmana, Vedic literature corpus
                                {useWebSearch && ' • Web search results'}
                              </p>
                            </div>
                          )}
                          <p
                            className={cn(
                              'text-xs mt-2',
                              message.role === 'user'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(isLoading || isSearching) && (
                      <div className="flex gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <Bot className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div className="bg-secondary rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">
                              {isSearching ? 'Searching the web...' : 'Thinking...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Yajurveda, rituals, mantras..."
                    className="min-h-[44px] max-h-[120px] resize-none flex-1"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant={useWebSearch ? 'default' : 'outline'}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setUseWebSearch(!useWebSearch)}
                    title={useWebSearch ? 'Web Search On' : 'Web Search Off'}
                  >
                    <Globe className="w-5 h-5" />
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  AI responses are for educational purposes. Always verify with authoritative sources.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
