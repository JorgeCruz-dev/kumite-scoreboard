import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

const App = () => {
  // State for scores
  const [aoPlayerScore, setAoPlayerScore] = useState(0);
  const [akaPlayerScore, setAkaPlayerScore] = useState(0);
  const [aoSenshu, setAoSenshu] = useState(false);
  const [akaSenshu, setAkaSenshu] = useState(false);

  // State for sanctions
  const [aoSanction, setAoSanction] = useState<"chukoku" | "keikoku" | "hansoku-chui" | "hansoku" | "shikaku" | null>(null);
  const [akaSanction, setAkaSanction] = useState<"chukoku" | "keikoku" | "hansoku-chui" | "hansoku" | "shikaku" | null>(null);

  // State for timer
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [minutesInput, setMinutesInput] = useState(""); // User input for minutes
  const [secondsInput, setSecondsInput] = useState(""); // User input for seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to increment scores
  const handleScore = (player: "aoPlayer" | "akaPlayer", score: "yuko" | "wazari" | "ippon" | "less") => {
    let scoreValue = 1;
    switch (score) {
      case "yuko":
        scoreValue = 1;
        break;
      case "wazari":
        scoreValue = 2;
        break;
      case "ippon":
        scoreValue = 3;
        break;
    }

    switch (player) {
      case "akaPlayer":
        setAkaPlayerScore((prev) => (score === "less" ? prev - scoreValue : prev + scoreValue));
        break;
      case "aoPlayer":
        setAoPlayerScore((prev) => (score === "less" ? prev - scoreValue : prev + scoreValue));
        break;
    }
  };

  // Function to toggle Senshu
  const handleSenshu = (player: "aoPlayer" | "akaPlayer") => {
    if (player === "aoPlayer") {
      setAoSenshu((prev) => !prev); // Toggle Ao Senshu
      if (!aoSenshu) setAkaSenshu(false); // Ensure Aka Senshu is off
    } else {
      setAkaSenshu((prev) => !prev); // Toggle Aka Senshu
      if (!akaSenshu) setAoSenshu(false); // Ensure Ao Senshu is off
    }
  };

  // Function to handle sanctions
  const handleSanction = (player: "aoPlayer" | "akaPlayer", sanction: "chukoku" | "keikoku" | "hansoku-chui" | "hansoku" | "shikaku") => {
    if (player === "aoPlayer") {
      setAoSanction((prev) => (prev === sanction ? null : sanction)); // Toggle sanction
    } else {
      setAkaSanction((prev) => (prev === sanction ? null : sanction)); // Toggle sanction
    }

    // Handle disqualifications
    if (sanction === "hansoku" || sanction === "shikaku") {
      // Stop the timer
      clearInterval(intervalRef.current!);
      setIsRunning(false);
      // Show disqualification alert
      alert(`${player === "aoPlayer" ? "Ao" : "Aka"} has been disqualified (${sanction}).`);
    }
  };

  // Function to reset scores
  const resetScores = () => {
    setAoPlayerScore(0);
    setAkaPlayerScore(0);
  };

  // Function to start the timer
  const startTimer = () => {
    if (time > 0 && !isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 0.1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100); // Update every 100ms for smoother countdown
    }
  };

  // Function to pause/resume the timer
  const togglePause = () => {
    if (isRunning) {
      clearInterval(intervalRef.current!);
      setIsRunning(false);
    } else {
      startTimer();
    }
  };

  // Function to reset the timer
  const resetTimer = () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setTime(0);
    setMinutesInput("");
    setSecondsInput("");
  };

  // Format time to MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 10); // Tenths of a second
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds}`;
  };

  // Handle input change for minutes
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinutesInput(e.target.value);
  };

  // Handle input change for seconds
  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondsInput(e.target.value);
  };

  // Set the timer based on user input
  const setTimer = () => {
    const minutes = parseInt(minutesInput, 10) || 0;
    const seconds = parseInt(secondsInput, 10) || 0;
    const totalTimeInSeconds = minutes * 60 + seconds;
    if (totalTimeInSeconds > 0) {
      setTime(totalTimeInSeconds);
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Tablero de kumite</h1>

      {/* Timer Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {/* Minutes Input */}
          <input
            type="number"
            placeholder="Minutos"
            value={minutesInput}
            onChange={handleMinutesChange}
            className="px-4 py-2 border rounded"
          />
          {/* Seconds Input */}
          <input
            type="number"
            placeholder="Segundos"
            value={secondsInput}
            onChange={handleSecondsChange}
            className="px-4 py-2 border rounded"
          />
          <button
            onClick={setTimer}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition cursor-pointer"
          >
            Agregar tiempo
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold">{formatTime(time)}</p>
          <button
            onClick={togglePause}
            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition cursor-pointer"
          >
            {isRunning ? "⏸" : "▶️"}
          </button>
          <button
            onClick={resetTimer}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition ml-2 cursor-pointer"
          >
            Resetear tiempo
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-11/12">
        {/* Grid Container */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Ao Player (Left Side) */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Ao</h2>
            <p className="text-4xl font-bold text-blue-600">{aoPlayerScore}</p>
            <button
              onClick={() => handleScore("aoPlayer", "yuko")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
            >
              Yuko
            </button>
            <button
              onClick={() => handleScore("aoPlayer", "wazari")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
            >
              Wazari
            </button>
            <button
              onClick={() => handleScore("aoPlayer", "ippon")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
            >
              Ippon
            </button>
            <button
              onClick={() => handleScore("aoPlayer", "less")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
            >
              -
            </button>

            {/* Senshu Button */}
            <button
              onClick={() => handleSenshu("aoPlayer")}
              className={clsx(
                "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-blue-600 transition cursor-pointer", // Base styles
                aoSenshu ? "bg-amber-500" : "bg-blue-500" // Conditional color
              )}
            >
              Senshu
            </button>

            {/* Sanction Buttons */}
            <div className="mt-4">
              <button
                onClick={() => handleSanction("aoPlayer", "chukoku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  aoSanction === "chukoku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Chukoku
              </button>
              <button
                onClick={() => handleSanction("aoPlayer", "keikoku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  aoSanction === "keikoku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Keikoku
              </button>
              <button
                onClick={() => handleSanction("aoPlayer", "hansoku-chui")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  aoSanction === "hansoku-chui" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Hansoku-Chui
              </button>
              <button
                onClick={() => handleSanction("aoPlayer", "hansoku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  aoSanction === "hansoku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Hansoku
              </button>
              <button
                onClick={() => handleSanction("aoPlayer", "shikaku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  aoSanction === "shikaku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Shikaku
              </button>
            </div>
          </div>

          {/* Aka Player (Right Side) */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Aka</h2>
            <p className="text-4xl font-bold text-red-600">{akaPlayerScore}</p>
            <button
              onClick={() => handleScore("akaPlayer", "yuko")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
            >
              Yuko
            </button>
            <button
              onClick={() => handleScore("akaPlayer", "wazari")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
            >
              Wazari
            </button>
            <button
              onClick={() => handleScore("akaPlayer", "ippon")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
            >
              Ippon
            </button>
            <button
              onClick={() => handleScore("akaPlayer", "less")}
              className="mt-2 px-4 py-2 mx-2 p-4 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
            >
              -
            </button>

            {/* Senshu Button */}
            <button
              onClick={() => handleSenshu("akaPlayer")}
              className={clsx(
                "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                akaSenshu ? "bg-amber-500" : "bg-red-500" // Conditional color
              )}
            >
              Senshu
            </button>

            {/* Sanction Buttons */}
            <div className="mt-4">
              <button
                onClick={() => handleSanction("akaPlayer", "chukoku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  akaSanction === "chukoku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Chukoku
              </button>
              <button
                onClick={() => handleSanction("akaPlayer", "keikoku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  akaSanction === "keikoku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Keikoku
              </button>
              <button
                onClick={() => handleSanction("akaPlayer", "hansoku-chui")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  akaSanction === "hansoku-chui" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Hansoku-Chui
              </button>
              <button
                onClick={() => handleSanction("akaPlayer", "hansoku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  akaSanction === "hansoku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Hansoku
              </button>
              <button
                onClick={() => handleSanction("akaPlayer", "shikaku")}
                className={clsx(
                  "mt-2 px-4 py-2 mx-2 p-4 text-white rounded hover:bg-red-600 transition cursor-pointer", // Base styles
                  akaSanction === "shikaku" ? "bg-red-500" : "bg-gray-500" // Conditional color
                )}
              >
                Shikaku
              </button>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetScores}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition cursor-pointer"
        >
          Resetear puntaje
        </button>
      </div>
    </div>
  );
};

export default App;