'use client';

import { useEffect, useState } from 'react';
import { grpcClient } from '@/lib/grpc-client';

interface ActiveTrack {
  trackTitle: string;
  artist: string;
  timestamp: string;
}

export default function ActiveTrackDisplay() {
  const [activeTrack, setActiveTrack] = useState<ActiveTrack | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const connectToStream = () => {
      try {
        unsubscribe = grpcClient.subscribeToActiveTrack((update: ActiveTrack) => {
          setActiveTrack(update);
          setIsConnected(true);
        });

        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to stream:', error);
        setIsConnected(false);
        window.setTimeout(connectToStream, 5000);
      }
    };

    connectToStream();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!activeTrack) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <div className="text-gray-500">
          {isConnected ? 'Loading active track...' : 'Connecting to stream...'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
          <div className="space-y-1">
            <div className="text-xl font-bold truncate">
              {activeTrack.trackTitle}
            </div>
            <div className="text-sm opacity-90">
              {activeTrack.artist}
            </div>
            <div className="text-xs opacity-75">
              {new Date(activeTrack.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="flex items-end justify-center space-x-1 mt-4 h-8">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="w-1 bg-white opacity-60 rounded-full animate-pulse"
            style={{
              height: `${(Math.random() * 100).toString()}%`,
              animationDelay: `${(i * 0.1).toString()}s`,
              animationDuration: `${(0.5 + Math.random() * 0.5).toString()}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
} 