import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Copy, Check, Users, Gamepad2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConnectionStatus } from '@/types/game';

interface ConnectionScreenProps {
  onCreateGame: () => void;
  onJoinGameRef: React.RefObject<(code: string) => void>;
  connectionCode: string;
  status: ConnectionStatus;
  error: string | null;
}

export function ConnectionScreen({
  onCreateGame,
  onJoinGameRef,
  connectionCode,
  status,
  error
}: ConnectionScreenProps) {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(connectionCode);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Connection code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy code',
        variant: 'destructive',
      });
    }
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinGameRef.current(joinCode.trim());
    }
  };

  if (status === 'waiting_for_guest') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="w-12 h-12 text-primary animate-pulse-slow" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Waiting for Player 2</h2>
            <p className="text-muted-foreground">Share this code with your friend</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Connection Code</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono break-all bg-background p-3 rounded border">
                  {connectionCode}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Send this code via your preferred messaging app</p>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Enter Answer Connection Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                disabled={false}
                className="h-12"
              />
              <Button
                onClick={handleJoin}
                variant="outline"
                className="w-full h-12 text-lg"
                disabled={!joinCode.trim()}
              >
                Join Game
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'waiting_for_host') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="w-12 h-12 text-primary animate-pulse-slow" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Waiting for Player 1</h2>
            <p className="text-muted-foreground">Share this code with the host</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Answer Connection Code</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono break-all bg-background p-3 rounded border">
                  {connectionCode}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Send this code via your preferred messaging app</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl">
              <Gamepad2 className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            P2P Checkers
          </h1>
          <p className="text-muted-foreground">
            Play checkers with your friends using WebRTC
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={onCreateGame}
            className="w-full h-12 text-lg"
            disabled={status !== 'idle'}
          >
            Create Game
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Enter connection code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              disabled={status !== 'idle'}
              className="h-12"
            />
            <Button
              onClick={handleJoin}
              variant="outline"
              className="w-full h-12 text-lg"
              disabled={!joinCode.trim() || status !== 'idle'}
            >
              Join Game
            </Button>
          </div>
        </div>

        <div className="pt-4 text-center text-xs text-muted-foreground">
          <p>No backend required • Peer-to-peer connection</p>
        </div>
      </Card>
    </div>
  );
}
