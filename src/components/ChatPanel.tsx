import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, MessageSquare } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'local' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-lg px-4 py-2
                  ${message.sender === 'local'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                  }
                `}
              >
                <p className="text-sm break-words">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
