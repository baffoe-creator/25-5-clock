import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

// Utility function to format time in mm:ss
const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const PomodoroTimer = () => {
  // State variables
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [timerLabel, setTimerLabel] = useState('Session');
  const [isRunning, setIsRunning] = useState(false);
  
  // Audio ref
  const audioRef = useRef(null);
  
  // Timer interval ref
  const intervalRef = useRef(null);
  
  // Handle reset button click
  const handleReset = () => {
    // Stop the timer
    clearInterval(intervalRef.current);
    setIsRunning(false);
    
    // Reset all values to default
    setBreakLength(5);
    setSessionLength(25);
    setTimeLeft(25 * 60);
    setTimerLabel('Session');
    
    // Stop and rewind audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Handle break length changes
  const decrementBreak = () => {
    if (!isRunning && breakLength > 1) {
      setBreakLength(prev => prev - 1);
    }
  };
  
  const incrementBreak = () => {
    if (!isRunning && breakLength < 60) {
      setBreakLength(prev => prev + 1);
    }
  };
  
  // Handle session length changes
  const decrementSession = () => {
    if (!isRunning && sessionLength > 1) {
      setSessionLength(prev => prev - 1);
      if (timerLabel === 'Session') {
        setTimeLeft((prev - 1) * 60);
      }
    }
  };
  
  const incrementSession = () => {
    if (!isRunning && sessionLength < 60) {
      setSessionLength(prev => prev + 1);
      if (timerLabel === 'Session') {
        setTimeLeft((prev + 1) * 60);
      }
    }
  };
  
  // Handle start/stop button click
  const toggleTimer = () => {
    if (isRunning) {
      // Pause the timer
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      // Start the timer
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 0) {
            // Play the beep sound
            audioRef.current.play();
            
            // Switch between session and break
            if (timerLabel === 'Session') {
              setTimerLabel('Break');
              return breakLength * 60;
            } else {
              setTimerLabel('Session');
              return sessionLength * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  
  // Update timeLeft when sessionLength changes and timer is not running
  useEffect(() => {
    if (!isRunning && timerLabel === 'Session') {
      setTimeLeft(sessionLength * 60);
    }
  }, [sessionLength, isRunning, timerLabel]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">25 + 5 Clock</h1>
        
        <div className="flex justify-between mb-8">
          {/* Break Length Control */}
          <div className="text-center">
            <h2 id="break-label" className="text-xl font-semibold mb-2">Break Length</h2>
            <div className="flex items-center justify-center">
              <button 
                id="break-decrement" 
                onClick={decrementBreak}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                disabled={isRunning || breakLength <= 1}
              >
                -
              </button>
              <span id="break-length" className="mx-4 text-xl font-bold">{breakLength}</span>
              <button 
                id="break-increment" 
                onClick={incrementBreak}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                disabled={isRunning || breakLength >= 60}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Session Length Control */}
          <div className="text-center">
            <h2 id="session-label" className="text-xl font-semibold mb-2">Session Length</h2>
            <div className="flex items-center justify-center">
              <button 
                id="session-decrement" 
                onClick={decrementSession}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                disabled={isRunning || sessionLength <= 1}
              >
                -
              </button>
              <span id="session-length" className="mx-4 text-xl font-bold">{sessionLength}</span>
              <button 
                id="session-increment" 
                onClick={incrementSession}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                disabled={isRunning || sessionLength >= 60}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="bg-gray-200 rounded-lg p-6 mb-6 text-center">
          <h2 id="timer-label" className="text-2xl font-bold mb-2">{timerLabel}</h2>
          <div id="time-left" className="text-5xl font-mono font-bold">{formatTime(timeLeft)}</div>
        </div>
        
        {/* Timer Controls */}
        <div className="flex justify-center space-x-4">
          <button 
            id="start_stop" 
            onClick={toggleTimer}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            {isRunning ? <Pause size={20} className="mr-1" /> : <Play size={20} className="mr-1" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button 
            id="reset" 
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center"
          >
            <RefreshCw size={20} className="mr-1" />
            Reset
          </button>
        </div>
      </div>
      
      {/* Audio element for the beep sound */}
      <audio 
        id="beep" 
        ref={audioRef}
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        preload="auto"
      />
    </div>
  );
};

export default PomodoroTimer;
