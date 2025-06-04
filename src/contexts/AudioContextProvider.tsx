"use client";

import { createContext, useContext, useRef, useCallback, ReactNode } from "react";

interface AudioContextState {
  context: AudioContext | null;
  sourceNode: MediaElementAudioSourceNode | null;
  analyserNode: AnalyserNode | null;
  connectedElement: HTMLAudioElement | null;
}

interface AudioContextManager {
  initialize: (audioElement: HTMLAudioElement) => {
    context: AudioContext;
    analyser: AnalyserNode;
  };
  getAnalyser: () => AnalyserNode | null;
  getContext: () => AudioContext | null;
  isElementConnected: (element: HTMLAudioElement) => boolean;
  cleanup: () => void;
}

const AudioContextContext = createContext<AudioContextManager | undefined>(undefined);

interface AudioContextProviderProps {
  children: ReactNode;
}

export function AudioContextProvider({ children }: AudioContextProviderProps) {
  const stateRef = useRef<AudioContextState>({
    context: null,
    sourceNode: null,
    analyserNode: null,
    connectedElement: null,
  });

  const initialize = useCallback((audioElement: HTMLAudioElement): {
    context: AudioContext;
    analyser: AnalyserNode;
  } => {
    const state = stateRef.current;

    if (state.context && 
        state.connectedElement === audioElement && 
        state.analyserNode && 
        state.sourceNode &&
        state.context.state !== "closed") {
      
      if (state.context.state === "suspended") {
        void state.context.resume();
      }
      
      return {
        context: state.context,
        analyser: state.analyserNode,
      };
    }

    if (state.connectedElement !== audioElement || !state.context || state.context.state === "closed") {
      cleanup();
    }

    const context = new AudioContext();
    const analyserNode = context.createAnalyser();
    
    analyserNode.fftSize = 256;

    const sourceNode = context.createMediaElementSource(audioElement);
    
    sourceNode.connect(analyserNode);
    analyserNode.connect(context.destination);

    stateRef.current = {
      context,
      sourceNode,
      analyserNode,
      connectedElement: audioElement,
    };

    return {
      context,
      analyser: analyserNode,
    };
  }, []);

  const getAnalyser = useCallback((): AnalyserNode | null => {
    return stateRef.current.analyserNode;
  }, []);

  const getContext = useCallback((): AudioContext | null => {
    return stateRef.current.context;
  }, []);

  const isElementConnected = useCallback((element: HTMLAudioElement): boolean => {
    return stateRef.current.connectedElement === element;
  }, []);

  const cleanup = useCallback((): void => {
    const state = stateRef.current;

    if (state.sourceNode) {
      try {
        state.sourceNode.disconnect();
      } catch (error) {
        console.warn("Error disconnecting source node:", error);
      }
    }

    if (state.analyserNode) {
      try {
        state.analyserNode.disconnect();
      } catch (error) {
        console.warn("Error disconnecting analyser node:", error);
      }
    }

    if (state.context && state.context.state !== "closed") {
      void state.context.close().catch((error: unknown) => {
        console.warn("Error closing audio context:", error);
      });
    }

    stateRef.current = {
      context: null,
      sourceNode: null,
      analyserNode: null,
      connectedElement: null,
    };
  }, []);

  const contextValue: AudioContextManager = {
    initialize,
    getAnalyser,
    getContext,
    isElementConnected,
    cleanup,
  };

  return (
    <AudioContextContext.Provider value={contextValue}>
      {children}
    </AudioContextContext.Provider>
  );
}

export function useAudioContextManager(): AudioContextManager {
  const context = useContext(AudioContextContext);
  if (context === undefined) {
    throw new Error("useAudioContextManager must be used within an AudioContextProvider");
  }
  return context;
} 