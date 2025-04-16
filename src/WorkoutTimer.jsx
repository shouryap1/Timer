import React, { useState, useEffect, useRef } from "react";
import "./WorkoutTimer.css";

const exercises = ["SLR", "Heels Slide", "4:1 Heel to Knee Press"];
const durations = [150, 120, 120]; // in seconds
const totalSets = 3;

export default function WorkoutTimer() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(durations[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  const targetTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Preload audio and handle autoplay policies
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      // Some browsers require this to be triggered by user interaction
      document.addEventListener('click', () => {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }, { once: true });
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now();
      const endTime = startTime + timeLeft * 1000;
      targetTimeRef.current = endTime;
      
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetTimeRef.current - now) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(intervalRef.current);
          handleTimerEnd();
          handleExerciseEnd();
        }
      }, 100); // More frequent checks for accuracy
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, currentExercise]);

  const handleTimerEnd = () => {
    if (navigator.vibrate) {
      navigator.vibrate(3000);
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to start
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const handleExerciseEnd = () => {
    if (currentExercise < exercises.length - 1) {
      const nextExercise = currentExercise + 1;
      setCurrentExercise(nextExercise);
      setTimeLeft(durations[nextExercise]);
      setIsRunning(false);
    } else if (currentSet < totalSets) {
      setCurrentSet((s) => s + 1);
      setCurrentExercise(0);
      setTimeLeft(durations[0]);
      setIsRunning(false);
    } else {
      setIsWorkoutComplete(true);
      setIsRunning(false);
    }
  };

  const startTimer = () => {
    if (!isWorkoutComplete) {
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const resetWorkout = () => {
    setTimeLeft(durations[currentExercise]);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const progress = ((durations[currentExercise] - timeLeft) / durations[currentExercise]) * 100;

  return (
    <div className="container">
      <h1>🏋️ Knee Exercise Motu's Timer</h1>

      <audio ref={audioRef} src="/beep_trim.wav" preload="auto" />

      {isWorkoutComplete ? (
        <div className="complete">🎉 Workout Complete!</div>
      ) : (
        <div className="status">
          <p><strong>Exercise:</strong> {exercises[currentExercise]}</p>
          <p><strong>Set:</strong> {currentSet} / {totalSets}</p>
          <p className="timer">{timeLeft}s</p>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="buttons">
        <button onClick={startTimer} className="start">Start</button>
        <button onClick={stopTimer} className="stop">Stop</button>
        <button onClick={resetWorkout} className="reset">Reset</button>
      </div>
    </div>
  );
}