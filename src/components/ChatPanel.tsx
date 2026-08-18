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

export function ChatPanel({
  messages,
  onSendMessage
}: ChatPanelProps) {

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd8cf] bg-[#faf9f6] shadow-[0_12px_35px_rgba(50,45,35,0.06)]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e4e0d8] px-5 py-4">

        <div>
          <h3 className="text-sm font-semibold">
            Game chat
          </h3>

          <p className="mt-0.5 text-[11px] text-[#99938a]">
            Messages are sent peer-to-peer
          </p>
        </div>

        <MessageSquare className="h-4 w-4 text-[#918b81]" />

      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">

            <div>
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#ebe7df]">
                <MessageSquare className="h-4 w-4 text-[#918b81]" />
              </div>

              <p className="text-sm font-medium text-[#777168]">
                No messages yet
              </p>

              <p className="mt-1 text-xs text-[#aaa49a]">
                Start a conversation while you play.
              </p>
            </div>

          </div>
        ) : (
          <div className="space-y-3">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'local'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`
                    max-w-[82%] px-3.5 py-2.5
                    ${
                      message.sender === 'local'
                        ? 'rounded-2xl rounded-br-md bg-[#292722] text-white'
                        : 'rounded-2xl rounded-bl-md bg-[#ebe7df] text-[#37342f]'
                    }
                  `}
                >
                  <p className="break-words text-sm leading-5">
                    {message.text}
                  </p>

                  <p
                    className={`
                      mt-1 text-[10px]
                      ${
                        message.sender === 'local'
                          ? 'text-white/50'
                          : 'text-[#918b81]'
                      }
                    `}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e4e0d8] p-3">

        <div className="flex gap-2">

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="h-10 rounded-xl border-[#dedad2] bg-white text-sm"
          />

          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-[#292722] hover:bg-[#403c35]"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>

        </div>

      </div>

    </div>
  );
}