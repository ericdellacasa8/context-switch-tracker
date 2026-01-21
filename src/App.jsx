import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

// Simple sound synthesis for the beep
const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

function App() {
  const [sessionState, setSessionState] = useState('idle'); // idle, running, summary
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [switchCount, setSwitchCount] = useState(0);
  const [lastSwitchTime, setLastSwitchTime] = useState(null);
  const timerRef = useRef(null);
  const wasHiddenRef = useRef(false);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (sessionState !== 'running') return;

      if (document.hidden) {
        wasHiddenRef.current = true;
      } else {
        // Returned to tab
        if (wasHiddenRef.current) {
          setSwitchCount(prev => prev + 1);
          setLastSwitchTime(Date.now());
          playBeep();
          wasHiddenRef.current = false;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionState]);

  // Timer logic
  useEffect(() => {
    if (sessionState === 'running') {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionState, startTime]);

  const startSession = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setSwitchCount(0);
    setSessionState('running');
    wasHiddenRef.current = false;
  };

  const stopSession = () => {
    setSessionState('summary');
  };

  const resetApp = () => {
    setSessionState('idle');
    setElapsedTime(0);
    setSwitchCount(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cyber-black font-mono relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-neonGreen via-cyber-neonBlue to-cyber-neonPink opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyber-neonBlue rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyber-neonPink rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

      <div className="z-10 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyber-neonGreen to-cyber-neonBlue mb-2">
            FOCUS TRACE
          </h1>
          <p className="text-cyber-dim text-sm uppercase tracking-widest">Context Switch Tracker</p>
        </div>

        {/* IDLE STATE */}
        {sessionState === 'idle' && (
          <div className="bg-cyber-dark border border-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gray-900 rounded-full flex items-center justify-center border border-gray-700">
                <Activity className="w-8 h-8 text-cyber-neonGreen" />
              </div>
              <div>
                <p className="text-gray-400 mb-2">Ready to track your focus?</p>
                <p className="text-xs text-cyber-dim">Leaving the tab triggers a context switch event.</p>
              </div>
              <button 
                onClick={startSession}
                className="w-full py-4 bg-cyber-neonGreen text-black font-bold text-lg rounded-xl hover:shadow-neon-green transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                START SESSION
              </button>
            </div>
          </div>
        )}

        {/* RUNNING STATE */}
        {sessionState === 'running' && (
          <div className="space-y-6">
            <div className="bg-cyber-dark border border-cyber-neonBlue/30 p-8 rounded-2xl shadow-neon-blue/10 relative overflow-hidden">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-neonBlue/5 to-transparent h-2 w-full animate-scan pointer-events-none"></div>
              
              <div className="text-center mb-8">
                <span className="inline-block px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs font-bold tracking-wider animate-pulse mb-4">
                  RECORDING ACTIVE
                </span>
                <div className="font-mono text-6xl font-bold tracking-wider tabular-nums text-white">
                  {formatTime(elapsedTime)}
                </div>
                <p className="text-cyber-dim mt-2 text-xs">SESSION DURATION</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <div className="text-3xl font-bold text-cyber-neonPink mb-1">{switchCount}</div>
                  <div className="text-xs text-gray-500 uppercase">Switches</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <div className="text-xs text-gray-500 uppercase mt-1">Last Switch</div>
                  <div className="text-sm font-bold text-cyber-neonBlue mt-1">
                    {lastSwitchTime ? new Date(lastSwitchTime).toLocaleTimeString() : '--:--'}
                  </div>
                </div>
              </div>

              <button 
                onClick={stopSession}
                className="w-full py-4 bg-transparent border-2 border-red-500 text-red-500 font-bold text-lg rounded-xl hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5 fill-current" />
                STOP SESSION
              </button>
            </div>
          </div>
        )}

        {/* SUMMARY STATE */}
        {sessionState === 'summary' && (
          <div className="bg-cyber-dark border border-gray-800 p-8 rounded-2xl shadow-2xl relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-cyber-neonGreen"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-cyber-neonPink"></div>
            
            <h2 className="text-2xl font-bold text-white mb-6 text-center">SESSION REPORT</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border-l-4 border-cyber-neonBlue">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Total Time</span>
                </div>
                <span className="text-xl font-bold font-mono text-white">{formatTime(elapsedTime)}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border-l-4 border-cyber-neonPink">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Context Switches</span>
                </div>
                <span className="text-xl font-bold font-mono text-cyber-neonPink">{switchCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border-l-4 border-cyber-neonGreen">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Focus Score</span>
                </div>
                <span className="text-xl font-bold font-mono text-cyber-neonGreen">
                  {switchCount === 0 ? '100%' : Math.max(0, 100 - (switchCount * 5)) + '%'}
                </span>
              </div>
            </div>

            <button 
              onClick={resetApp}
              className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              NEW SESSION
            </button>
          </div>
        )}

      </div>
      
      {/* Footer */}
      <div className="fixed bottom-4 text-center w-full text-xs text-gray-700 pointer-events-none">
        CONTEXT SWITCH TRACKER v1.0 • SYSTEM ACTIVE
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400px); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;