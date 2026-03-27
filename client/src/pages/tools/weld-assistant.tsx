import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WeldAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI welding assistant. I can help you with welding techniques, troubleshooting, material selection, and code compliance. What would you like to know?",
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (data: { question: string; conversationHistory: Array<{role: string; content: string}> }) => {
      const response = await apiRequest('POST', '/api/ai/ask-assistant', data);
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + '_assistant',
        type: 'assistant',
        content: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Send Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const history = messages
      .filter(m => m.id !== '1')
      .map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));

    setMessages(prev => [...prev, userMessage]);
    sendMutation.mutate({ question: inputMessage, conversationHistory: history });
    setInputMessage("");
  };

  const handleSuggestedQuestion = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMutation.mutate({ question, conversationHistory: [] });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Weld Assistant</h1>
              <p className="text-xs text-muted-foreground">AI-powered welding expert</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="px-6 mb-6 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex space-x-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-primary-foreground text-sm"></i>
                </div>
              )}
              
              <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-lg p-3 inline-block max-w-xs ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border border-border'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user text-secondary-foreground text-sm"></i>
                </div>
              )}
            </div>
          ))}
          
          {sendMutation.isPending && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-primary-foreground text-sm"></i>
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-lg p-3 inline-block">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-6 mb-6">
            <h3 className="font-semibold text-sm mb-3">Suggested Questions</h3>
            <div className="space-y-2">
              {[
                "How do I select the right filler metal for my project?",
                "What are the AWS D1.1 acceptance criteria for fillet welds?",
                "How can I improve my 6G pipe welding technique?",
                "What causes undercut in overhead welding?"
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3 whitespace-normal hover:bg-secondary/20 transition-colors"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input - Fixed at bottom */}
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-6">
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1"
                  placeholder="Ask me anything about welding..."
                  onKeyPress={(e) => e.key === 'Enter' && !sendMutation.isPending && handleSend()}
                  disabled={sendMutation.isPending}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || !inputMessage.trim()}
                  size="sm"
                  className="bg-primary text-primary-foreground w-10 h-10 p-0"
                  data-testid="button-send-message"
                >
                  {sendMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin text-sm"></i>
                  ) : (
                    <i className="fas fa-paper-plane text-sm"></i>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
