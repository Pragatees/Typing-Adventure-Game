import React, { useState, useEffect, useRef } from "react";
import "../../App.css";
import back from "../../images/backgrou.mp4";
import obstacle1 from "../../images/Obstacle_1.png";
import obstacle2 from "../../images/Obstacle_2.png";
import obstacle3 from "../../images/Obstacle_3.png";
import obstacle4 from "../../images/Obstacle_4.png";
import obstacle5 from "../../images/Obstacle_5.png";
import user from "../../images/boy-running.gif";
import jumpSound from "../../images/jumop.mp3";
import bgmusic from "../../images/bg_music.mp3";

const obstacles = [obstacle1, obstacle2, obstacle3, obstacle4, obstacle5];

// Level 4 specific words - all 3 letters but with increased complexity
const level4Words = [
  "raw", "dry", "spy", "cry", "fly", "pry", "try", "why", "buy", "gym",
  "hymn", "myth", "sync", "type", "very", "wave", "year", "zone", "zero",
  "yet", "web", "use", "two", "the", "tax", "sun", "run", "red", "put",
  "cat", "dog", "hat", "bat", "mat", "rat", "sat", "fat", "pat", "map",
  "lap", "nap", "tap", "cap", "gap", "yap", "zap", "jam", "ham", "ram"
];

function Level4Game() {
  const [obstacleList, setObstacleList] = useState([]);
  const [runnerPosition, setRunnerPosition] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [typedWord, setTypedWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState("");
  const [jumping, setJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [collisionAnimation, setCollisionAnimation] = useState(false);
  const [allWordsCompleted, setAllWordsCompleted] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [obstacleSpeed, setObstacleSpeed] = useState(1.3); // Increased base speed for Level 4
  const [levelUpdated, setLevelUpdated] = useState(false);

  const videoRef = useRef(null);
  const runnerRef = useRef(null);
  const audioRef = useRef(null);
  const bgMusicRef = useRef(null);

  // Database update function
  const updateLevelInDatabase = async () => {
    try {
      const storedUsername = localStorage.getItem('username');
      
      if (!storedUsername) {
        console.error("Username not found in localStorage");
        return;
      }
      
      const response = await fetch('http://localhost:2000/api/levelUp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: storedUsername }),
      });
      
      const data = await response.json();
      console.log("Level update response:", data);
      
      if (data.message === 'Level increased successfully') {
        console.log(`Level increased to ${data.newLevel}`);
        setLevelUpdated(true);
      } else {
        console.error("Failed to update level:", data.message);
      }
    } catch (error) {
      console.error("Error updating level:", error);
    }
  };

  // Update level in database when game is completed successfully
  useEffect(() => {
    const successRate = (score / (level4Words.length * 15)) * 100;
    const levelPassed = successRate >= 110;
    
    if (gameOver && allWordsCompleted && levelPassed && !levelUpdated) {
      updateLevelInDatabase();
    }
  }, [gameOver, allWordsCompleted, score, levelUpdated]);

  // Timer Effect
  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !allWordsCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
        // Gradually increase obstacle speed as time passes
        setObstacleSpeed(prev => Math.min(prev + 0.01, 2.0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 || allWordsCompleted) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver, allWordsCompleted]);

  // Game Initialization Effect
  useEffect(() => {
    if (gameOver || allWordsCompleted) {
      if (videoRef.current) videoRef.current.pause();
      if (runnerRef.current) runnerRef.current.style.display = "none";
      if (bgMusicRef.current) bgMusicRef.current.pause();
      return;
    }

    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.3;
      bgMusicRef.current.play();
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= level4Words.length) {
        setAllWordsCompleted(true);
        clearInterval(interval);
        return;
      }

      const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
      const newWord = level4Words[currentIndex];
      setCurrentWord(newWord);

      const newObstacle = {
        image: randomObstacle,
        word: newWord,
        position: {
          bottom: "12%",
          left: "100%",
        },
      };
      setObstacleList((prevObstacles) => [...prevObstacles, newObstacle]);
      currentIndex++;
    }, 2300); // Slightly faster obstacle spawn rate

    return () => clearInterval(interval);
  }, [gameOver, allWordsCompleted]);

  // Obstacle Movement Effect
  useEffect(() => {
    const moveObstacles = setInterval(() => {
      setObstacleList((prevObstacles) => {
        const updatedObstacles = prevObstacles.map((obstacle) => ({
          ...obstacle,
          position: {
            ...obstacle.position,
            left: `${parseFloat(obstacle.position.left) - obstacleSpeed}%`,
          },
        }));

        const updatedObstaclesAfterJump = updatedObstacles
          .map((obstacle) => {
            if (
              parseFloat(obstacle.position.left) < 15 &&
              parseFloat(obstacle.position.left) > 0 &&
              obstacle.word.trim().toLowerCase() === typedWord.trim().toLowerCase()
            ) {
              handleWordMatch();
              return null;
            }
            return obstacle;
          })
          .filter(Boolean);

        const collisionDetected = updatedObstaclesAfterJump.some(
          (obstacle) =>
            parseFloat(obstacle.position.left) < 15 &&
            parseFloat(obstacle.position.left) > 0 &&
            runnerPosition <= 15
        );

        if (collisionDetected) {
          setCollisionAnimation(true);
          setConsecutiveCorrect(0);
          setComboMultiplier(1);
          setTimeout(() => {
            setCollisionAnimation(false);
            setGameOver(true);
          }, 500);
          return [];
        }

        return updatedObstaclesAfterJump.filter(
          (obstacle) => parseFloat(obstacle.position.left) > -20
        );
      });
    }, 30);

    return () => clearInterval(moveObstacles);
  }, [typedWord, gameOver, runnerPosition, obstacleSpeed]);

  // Jumping Effect
  useEffect(() => {
    if (jumping) {
      setRunnerPosition(40);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.2;
        audioRef.current.play();
      }
    } else {
      setRunnerPosition(10);
    }
  }, [jumping]);

  const handleWordMatch = () => {
    setJumping(true);
    const newConsecutiveCorrect = consecutiveCorrect + 1;
    setConsecutiveCorrect(newConsecutiveCorrect);
    
    // Increased combo multiplier for Level 4
    if (newConsecutiveCorrect % 3 === 0) {
      setComboMultiplier(prev => Math.min(prev + 0.75, 4));
    }
    
    const pointsEarned = Math.floor(15 * comboMultiplier); // Increased base points
    setScore(prevScore => prevScore + pointsEarned);
    
    setWordsCompleted((prev) => prev + 1);
    setTimeout(() => setJumping(false), 500);
    setTypedWord("");

    if (wordsCompleted + 1 === level4Words.length) {
      setAllWordsCompleted(true);
    }
  };

  const handleInputChange = (event) => {
    setTypedWord(event.target.value);
    if (event.nativeEvent.inputType === 'deleteContentBackward') {
      setConsecutiveCorrect(0);
      setComboMultiplier(1);
    }
  };

  const restartGame = () => {
    setObstacleList([]);
    setRunnerPosition(10);
    setGameOver(false);
    setTypedWord("");
    setTimeLeft(60);
    setCurrentWord("");
    setJumping(false);
    setScore(0);
    setWordsCompleted(0);
    setCollisionAnimation(false);
    setAllWordsCompleted(false);
    setConsecutiveCorrect(0);
    setComboMultiplier(1);
    setObstacleSpeed(1.3);
    setLevelUpdated(false);

    if (videoRef.current) {
      videoRef.current.play();
    }
    if (runnerRef.current) {
      runnerRef.current.style.display = "block";
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play();
    }
  };

  // Increased success rate requirement for Level 4
  const successRate = (score / (level4Words.length * 15)) * 100;
  const levelPassed = successRate >= 110; // Higher requirement for passing

  return (
    <div className="App" style={{ backgroundColor: "black", height: "100vh" }}>
      <div className="game-container" style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        margin: "0",
        overflow: "hidden",
      }}>
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        >
          <source src={back} type="video/mp4" />
        </video>

        {/* Game Interface Elements */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#FFD700",
          fontSize: "24px",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          background: "rgba(0,0,0,0.7)",
          padding: "10px 20px",
          borderRadius: "10px",
          zIndex: "1"
        }}>
          Level 4
        </div>

        {/* Speed Display */}
        <div style={{
          position: "absolute",
          top: "120px",
          right: "20px",
          color: obstacleSpeed > 1.5 ? "#ff4444" : "white",
          fontSize: "20px",
          fontWeight: "bold",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "10px",
          zIndex: "1"
        }}>
          Speed: {obstacleSpeed.toFixed(1)}x
        </div>

        {/* Combo Display */}
        <div style={{
          position: "absolute",
          top: "70px",
          right: "20px",
          color: comboMultiplier > 1 ? "#FFD700" : "white",
          fontSize: "20px",
          fontWeight: "bold",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "10px",
          zIndex: "1",
          animation: comboMultiplier > 1 ? "pulse 1s infinite" : "none"
        }}>
          Combo: x{comboMultiplier.toFixed(1)}
        </div>

        {/* Stats Display */}
        <div style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          color: timeLeft <= 10 ? "#ff4444" : "white",
          fontSize: "20px",
          fontWeight: "bold",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "10px",
          zIndex: "1"
        }}>
          Time: {timeLeft}s
        </div>

        <div style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          fontSize: "20px",
          fontWeight: "bold",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "10px",
          zIndex: "1"
        }}>
          Score: {score}
        </div>

        {/* Current Word Display */}
        <div className="word-display" style={{
          position: "absolute",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "24px",
          color: "white",
          textAlign: "center",
          zIndex: "1"
        }}>
          <span style={{
            display: "inline-block",
            padding: "5px 15px",
            background: "linear-gradient(to right, #ff6600, #ff3300)",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(255,102,0,0.8)",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
          }}>
            {currentWord.toUpperCase()}
          </span>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={typedWord}
          onChange={handleInputChange}
          placeholder="Type the word..."
          style={{
            position: "absolute",
            top: "130px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px",
            fontSize: "18px",
            borderRadius: "5px",
            border: "2px solid #FF6600",
            background: "rgba(255,255,255,0.9)",
            width: "200px",
            textAlign: "center",
            zIndex: "1"
          }}
          disabled={gameOver}
          autoFocus
        />

        {/* Game Over Screen */}
        {gameOver && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.9)",
            padding: "20px",
            borderRadius: "15px",
            color: "white",
            textAlign: "center",
            zIndex: "2"
          }}>
            <h2>{allWordsCompleted ? "Level Complete!" : "Game Over!"}</h2>
            <p>Final Score: {score}</p>
            <p>Words Completed: {wordsCompleted}/{level4Words.length}</p>
            <p>Success Rate: {successRate.toFixed(1)}%</p>
            {levelPassed ? (
              <p style={{ color: "#4CAF50" }}>
                Level Passed! {levelUpdated ? "Progress saved!" : "Saving progress..."} 
                You can proceed to Level 5!
              </p>
            ) : (
              <p style={{ color: "#ff4444" }}>Try again to achieve 110% success rate</p>
            )}
            <button
              onClick={restartGame}
              style={{
                padding: "10px 20px",
                margin: "10px",
                background: "linear-gradient(to right, #4CAF50, #45a049)",
                border: "none",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer"
              }}
            >
              Retry Level
            </button>
            {levelPassed && (
              <>
                <button
                  onClick={() => window.location.href = "/l5"}
                  style={{
                    padding: "10px 20px",
                    margin: "10px",
                    background: "linear-gradient(to right, #2196F3, #1976D2)",
                    border: "none",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Next Level
                </button>
                <button
                  onClick={() => window.location.href = "/levels"}
                  style={{
                    padding: "10px 20px",
                    margin: "10px",
                    background: "linear-gradient(to right, #2196F3, #1976D2)",
                    border: "none",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Levels Page
                </button>
              </>
            )}
            <button
              onClick={() => window.location.href = "/home"}
              style={{
                padding: "10px 20px",
                margin: "10px",
                background: "linear-gradient(to right, #ff9800, #f57c00)",
                border: "none",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer"
              }}
            >
              Main Menu
            </button>
          </div>
        )}

        {/* Obstacles */}
        {obstacleList.map((obstacle, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              bottom: obstacle.position.bottom,
              left: obstacle.position.left,
              transition: "left 0.03s linear",
            }}
          >
            <div style={{
              textAlign: "center",
              color: "#FF6600",
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "120px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)"
            }}>
              {obstacle.word.toUpperCase()}
            </div>
            <img
              src={obstacle.image}
              alt="obstacle"
              style={{
                width: "80px",
                height: "120px",
                position: "absolute",
                bottom: `${(runnerPosition / 10) - 40}px`,
              }}
            />
          </div>
        ))}

        {/* Runner */}
        <div
          ref={runnerRef}
          style={{
            position: "absolute",
            bottom: `${runnerPosition}%`,
            left: "10%",
            transition: "bottom 0.3s",
            animation: collisionAnimation ? "shake 0.1s" : "none",
            zIndex: "1"
          }}
        >
          <img
            src={user}
            alt="runner"
            style={{
              width: "100px",
              height: "175px"
            }}
          />
        </div>

        {/* Audio Elements */}
        <audio ref={audioRef} src={jumpSound} preload="auto"></audio>
        <audio ref={bgMusicRef} src={bgmusic} loop preload="auto"></audio>

        {/* Animation Styles */}
        <style>
          {`
            @keyframes shake {
              0% { transform: translateX(0); }
              25% { transform: translateX(-10px); }
              50% { transform: translateX(10px); }
              75% { transform: translateX(-10px); }
              100% { transform: translateX(0); }
            }

            @keyframes glow {
              from {
                text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff6600, 0 0 20px #ff6600;
              }
              to {
                text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff6600, 0 0 40px #ff6600;
              }
            }

            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }

            .typing-input:focus {
              outline: none;
              box-shadow: 0 0 10px #FF6600;
            }

            .obstacle-container {
              position: absolute;
              transition: all 0.03s linear;
            }

            .runner img {
              transition: transform 0.3s ease-in-out;
            }

            .runner img:hover {
              transform: scale(1.05);
            }

            @keyframes progressFill {
              from { width: 0%; }
              to { width: 100%; }
            }

            @keyframes wordComplete {
              0% { transform: scale(1); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }

            @keyframes celebrate {
              0% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
              100% { transform: translateY(0); }
            }

            /* Hover Effects for Buttons */
            button:hover {
              transform: scale(1.05);
              transition: transform 0.2s ease-in-out;
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
            }

            button:active {
              transform: scale(0.95);
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default Level4Game;