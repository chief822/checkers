import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        title: 'Copied',
        description: 'Connection code copied to clipboard',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy the connection code',
        variant: 'destructive',
      });
    }
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinGameRef.current(joinCode.trim());
    }
  };

  const pageClass =
    "min-h-screen flex items-center justify-center bg-[#f4f1eb] text-[#292722] p-6";

  /*
   * PLAYER 1
   *
   * Player 1 created the game and now has the first connection code.
   * They send it to Player 2 through any external messaging app.
   */
  if (status === 'waiting_for_guest') {
    return (
      <div className={pageClass}>
        <div className="w-full max-w-md">

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#292722] text-white">
              <Users className="h-6 w-6" />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a8479]">
              P2P Checkers
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Invite a Player
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#777168]">
              Send this connection code to the person you want to play with.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ddd8cf] bg-[#faf9f6] p-6 shadow-[0_12px_40px_rgba(50,45,35,0.08)]">

            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#918b81]">
              Your connection code
            </p>

            <div className="flex gap-2">
              <code className="min-w-0 flex-1 break-all rounded-xl border border-[#dedad2] bg-white px-4 py-3 text-sm font-mono text-[#3a3732]">
                {connectionCode}
              </code>

              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="h-12 w-12 shrink-0 rounded-xl border-[#dedad2] bg-white hover:bg-[#f1eee8]"
              >
                {copied
                  ? <Check className="h-4 w-4" />
                  : <Copy className="h-4 w-4" />
                }
              </Button>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-[#8b857c]">
              Copy this code and send it to Player 2 using WhatsApp,
              Messenger, Discord, or any other messaging app.
            </p>

            <div className="my-6 h-px bg-[#e5e1da]" />

            <div className="rounded-xl border border-[#e5e1da] bg-white/70 px-4 py-4">
              <p className="text-sm font-medium text-[#292722]">
                What happens next?
              </p>

              <p className="mt-1.5 text-xs leading-5 text-[#777168]">
                Player 2 will enter your code and receive their own
                connection code. They will send that code back to you,
                and you will enter it here to finish connecting.
              </p>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#918b81]">
                Player 2's connection code
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Paste their code here"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className="h-12 rounded-xl border-[#dedad2] bg-white focus-visible:ring-[#292722]"
                />

                <Button
                  onClick={handleJoin}
                  disabled={!joinCode.trim()}
                  className="h-12 rounded-xl bg-[#292722] px-5 text-white hover:bg-[#403c35]"
                >
                  Connect
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  /*
   * PLAYER 2
   *
   * Player 2 entered Player 1's code.
   * Their WebRTC answer/credentials are now displayed.
   * They send this code back to Player 1.
   */
  if (status === 'waiting_for_host') {
    return (
      <div className={pageClass}>
        <div className="w-full max-w-md">

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#292722] text-white">
              <Users className="h-6 w-6" />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a8479]">
              P2P Checkers
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Send Your Code Back
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#777168]">
              Send this connection code back to the player who invited you.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ddd8cf] bg-[#faf9f6] p-6 shadow-[0_12px_40px_rgba(50,45,35,0.08)]">

            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#918b81]">
              Your connection code
            </p>

            <div className="flex gap-2">
              <code className="min-w-0 flex-1 break-all rounded-xl border border-[#dedad2] bg-white px-4 py-3 text-sm font-mono text-[#3a3732]">
                {connectionCode}
              </code>

              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="h-12 w-12 shrink-0 rounded-xl border-[#dedad2] bg-white hover:bg-[#f1eee8]"
              >
                {copied
                  ? <Check className="h-4 w-4" />
                  : <Copy className="h-4 w-4" />
                }
              </Button>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-[#8b857c]">
              Copy this code and send it back to Player 1 through your
              messaging app.
            </p>

            <div className="my-6 h-px bg-[#e5e1da]" />

            <div className="rounded-xl border border-[#e5e1da] bg-white/70 px-4 py-4">
              <p className="text-sm font-medium text-[#292722]">
                Almost connected
              </p>

              <p className="mt-1.5 text-xs leading-5 text-[#777168]">
                Once Player 1 enters this code, the two devices will
                establish the direct connection automatically.
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  /*
   * INITIAL SCREEN
   *
   * No connection has been started yet.
   */
  return (
    <div className={pageClass}>
      <div className="w-full max-w-md">

        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#292722] text-white shadow-lg">
            <Gamepad2 className="h-7 w-7" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#918b81]">
            Peer to peer
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Peer to Peer Checkers
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#777168]">
            Play directly with another player. No account is required.
            Just exchange two connection codes to connect.
          </p>
        </div>

        <div className="rounded-2xl border border-[#ddd8cf] bg-[#faf9f6] p-6 shadow-[0_16px_50px_rgba(50,45,35,0.09)]">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={onCreateGame}
            disabled={status !== 'idle'}
            className="h-12 w-full rounded-xl bg-[#292722] text-base font-medium text-white hover:bg-[#403c35]"
          >
            Create a game
          </Button>

          <p className="mt-2 text-center text-xs text-[#8b857c]">
            Start a game and get a code to send to your opponent.
          </p>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e2ded7]" />

            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa49a]">
              or
            </span>

            <div className="h-px flex-1 bg-[#e2ded7]" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#292722]">
              Join a game
            </p>

            <p className="mb-3 text-xs leading-5 text-[#8b857c]">
              Enter the connection code someone sent you.
            </p>

            <div className="flex gap-2">
              <Input
                placeholder="Paste connection code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                disabled={status !== 'idle'}
                className="h-12 rounded-xl border-[#dedad2] bg-white"
              />

              <Button
                onClick={handleJoin}
                variant="outline"
                disabled={!joinCode.trim() || status !== 'idle'}
                className="h-12 rounded-xl border-[#d7d2c9] bg-white px-5 hover:bg-[#f1eee8]"
              >
                Join
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-[#e5e1da] pt-5">
            <p className="text-center text-xs leading-5 text-[#99938a]">
              Connection is established directly between the two players.
              Codes are exchanged manually through your preferred messaging app.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
