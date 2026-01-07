import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { P2PMessage, ConnectionStatus } from '@/types/game';

interface UseWebRTCReturn {
  connectionStatus: ConnectionStatus;
  createGame: () => void;
  joinGameRef: React.RefObject<(code: string) => void>;
  sendMessage: (message: P2PMessage) => void;
  connectionCode: string;
  error: string | null;
  isHost: boolean;
}

export function useWebRTC(
  onMessage: (message: P2PMessage) => void
): UseWebRTCReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionCode, setConnectionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const joinGameRef = useRef<(code: string) => void>(joinGame); // joinGame is declared below

  const sendMessage = useCallback((message: P2PMessage) => {
    if (peerRef.current && connectionStatus === 'connected') {
      try {
        peerRef.current.send(JSON.stringify(message));
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  }, [connectionStatus]);

  const createGame = useCallback(() => {
    setConnectionStatus('creating');
    setIsHost(true);
    setError(null);

    try {
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
      });

      peer.on('signal', (data) => {
        const code = JSON.stringify(data);
        setConnectionCode(code);
        setConnectionStatus('waiting_for_guest');
      });

      peer.on('connect', () => {
        console.log('Connection established (host)');
        setConnectionStatus('connected');
      });

      peer.on('data', (data) => {
        try {
          const message: P2PMessage = JSON.parse(data.toString());
          onMessage(message);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setError('Connection error occurred');
        setConnectionStatus('error');
      });

      peer.on('close', () => {
        setConnectionStatus('idle');
        setConnectionCode('');
        joinGameRef.current = joinGame;
      });

      peerRef.current = peer;

      function handleAnswerCode(code: string) {
        const signalData = JSON.parse(code);
        peerRef.current.signal(signalData);
      }
      
      joinGameRef.current = handleAnswerCode;
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game');
      setConnectionStatus('error');
    }
  }, [onMessage]);

  const joinGame_ = useCallback((code: string): void => {
    setError(null);
    setIsHost(false);

    try {
      const signalData = JSON.parse(code);

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
      });

      peer.on('signal', (data) => {
        const answerCode = JSON.stringify(data);
        setConnectionCode(answerCode);
        setConnectionStatus('waiting_for_host');
      });

      peer.on('connect', () => {
        console.log('Connection established (guest)');
        setConnectionStatus('connected');
      });

      peer.on('data', (data) => {
        try {
          const message: P2PMessage = JSON.parse(data.toString());
          onMessage(message);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setError('Connection error occurred');
        setConnectionStatus('error');
      });

      peer.on('close', () => {
        setConnectionStatus('idle');
        setConnectionCode('');
      });

      peer.signal(signalData);
      peerRef.current = peer;
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Invalid connection code');
      setConnectionStatus('error');
    }
  }, [onMessage]);

  function joinGame(code: string): void {
    joinGame_(code);
  }

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return {
    connectionStatus,
    createGame,
    joinGameRef,
    sendMessage,
    connectionCode,
    error,
    isHost
  };
}
