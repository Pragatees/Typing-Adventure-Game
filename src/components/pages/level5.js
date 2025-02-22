import React, { useState, useEffect, useRef } from "react";
import "../../App.css";
import back from "../../images/bg_litegreen.mp4";
import obstacle1 from "../../images/Obstacle_1.png";
import obstacle2 from "../../images/Obstacle_2.png";
import obstacle3 from "../../images/Obstacle_3.png";
import obstacle4 from "../../images/Obstacle_4.png";
import obstacle5 from "../../images/Obstacle_5.png";
import user from "../../images/boy-running.gif";
import jumpSound from "../../images/jumop.mp3";
import bgmusic from "../../images/bg_music.mp3";

const obstacles = [obstacle1, obstacle2, obstacle3, obstacle4, obstacle5];

// Level 5 specific words - mix of 4 and 5 letters
const level5Words = [
  // 4 letter words
  "able", "bird", "calm", "dark", "echo", "find",
  // 5 letter words
  "alive", "brave", "claim", "dream", "extra"
];

function Level5Game() {
  const [obstacleList, setObstacleList] = useState([]);
  const [runnerPosition, setRunnerPosition] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [typedWord, setTypedWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(45); // Reduced time for medium level
  const [currentWord, setCurrentWord] = useState("");
  const [jumping, setJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [collisionAnimation, setCollisionAnimation] = useState(false);
  const [allWordsCompleted, setAllWordsCompleted] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [obstacleSpeed, setObstacleSpeed] = useState(1.5); // Higher base speed for Level 5
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
    const successRate = (score / (level5Words.length * 22.5)) * 100;
    const levelPassed = successRate >= 115;
    
    if (gameOver && allWordsCompleted && levelPassed && !levelUpdated) {
      updateLevelInDatabase();
    }
  }, [gameOver, allWordsCompleted, score, levelUpdated]);

  // Timer Effect
  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !allWordsCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
        // Faster speed increase for medium level
        setObstacleSpeed(prev => Math.min(prev + 0.015, 2.5));
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
      if (currentIndex >= level5Words.length) {
        setAllWordsCompleted(true);
        clearInterval(interval);
        return;
      }

      const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
      const newWord = level5Words[currentIndex];
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
    }, 2000); // Faster spawn rate for medium level

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
    
    // Enhanced combo system for Level 5
    if (newConsecutiveCorrect % 2 === 0) {
      setComboMultiplier(prev => Math.min(prev + 1, 5));
    }
    
    // Higher base points for longer words
    const basePoints = currentWord.length === 5 ? 25 : 20;
    const pointsEarned = Math.floor(basePoints * comboMultiplier);
    setScore(prevScore => prevScore + pointsEarned);
    
    setWordsCompleted((prev) => prev + 1);
    setTimeout(() => setJumping(false), 500);
    setTypedWord("");

    if (wordsCompleted + 1 === level5Words.length) {
      setAllWordsCompleted(true);
    }
  };

  const handleInputChange = (event) => {
    setTypedWord(event.target.value);
    if (event.nativeEvent.inputType === 'deleteContentBackward') {
      setConsecutiveCorrect(Math.max(0, consecutiveCorrect - 1));
      setComboMultiplier(Math.max(1, comboMultiplier - 0.5));
    }
  };

  const restartGame = () => {
    setObstacleList([]);
    setRunnerPosition(10);
    setGameOver(false);
    setTypedWord("");
    setTimeLeft(45);
    setCurrentWord("");
    setJumping(false);
    setScore(0);
    setWordsCompleted(0);
    setCollisionAnimation(false);
    setAllWordsCompleted(false);
    setConsecutiveCorrect(0);
    setComboMultiplier(1);
    setObstacleSpeed(1.5);
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

  const successRate = (score / (level5Words.length * 22.5)) * 100;
  const levelPassed = successRate >= 115;

  // Button hover styles
  const buttonBaseStyle = {
    padding: "10px 20px",
    margin: "10px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const buttonHoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

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
          color: "#4CAF50",
          fontSize: "24px",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          background: "rgba(0,0,0,0.7)",
          padding: "10px 20px",
          borderRadius: "10px",
          zIndex: "1"
        }}>
          Level 5 - Medium
        </div>

        {/* Difficulty Indicator */}
        <div style={{
          position: "absolute",
          top: "170px",
          right: "20px",
          color: "#4CAF50",
          fontSize: "18px",
          fontWeight: "bold",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "10px",
          zIndex: "1"
        }}>
          Word Length: {currentWord.length} letters
        </div>

        {/* Speed Display */}
        <div style={{
          position: "absolute",
          top: "120px",
          right: "20px",
          color: obstacleSpeed > 2 ? "#ff4444" : "#4CAF50",
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
          color: comboMultiplier > 1 ? "#4CAF50" : "white",
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
          color: timeLeft <= 15 ? "#ff4444" : "white",
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
            background: "linear-gradient(to right, #4CAF50, #45a049)",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(76,175,80,0.8)",
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
            border: "2px solid #4CAF50",
            background: "rgba(255,255,255,0.9)",
            width: "200px",
            textAlign: "center",
            zIndex: "1",
            transition: "all 0.3s ease",
          }}
          className="typing-input"
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
            <h2 style={{ color: "#4CAF50" }}>{allWordsCompleted ? "Level Complete!" : "Game Over!"}</h2>
            <p>Final Score: {score}</p>
            <p>Words Completed: {wordsCompleted}/{level5Words.length}</p>
            <p>Success Rate: {successRate.toFixed(1)}%</p>
            {levelPassed ? (
              <p style={{ color: "#4CAF50" }}>
                Level Passed! {levelUpdated ? "Progress saved!" : "Saving progress..."} 
                You can proceed to Level 6!
              </p>
            ) : (
              <p style={{ color: "#ff4444" }}>Try again to achieve 100% success rate</p>
            )}
            <button
              onClick={restartGame}
              style={{
                ...buttonBaseStyle,
                background: "linear-gradient(to right, #4CAF50, #45a049)",
                ":hover": buttonHoverStyle
              }}
              onMouseEnter={e => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Retry Level
            </button>
            {levelPassed && (
              <>
                <button
                  onClick={() => window.location.href = "/l6"}
                  style={{
                    ...buttonBaseStyle,
                    background: "linear-gradient(to right, #2196F3, #1976D2)",
                    ":hover": buttonHoverStyle
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Next Level
                </button>
                <button
                  onClick={() => window.location.href = "/levels"}
                  style={{
                    ...buttonBaseStyle,
                    background: "linear-gradient(to right, #2196F3, #1976D2)",
                    ":hover": buttonHoverStyle
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Levels Page
                </button>
              </>
            )}
            <button
              onClick={() => window.location.href = "/home"}
              style={{
                ...buttonBaseStyle,
                background: "linear-gradient(to right, #ff9800, #f57c00)",
                ":hover": buttonHoverStyle
              }}
              onMouseEnter={e => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
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
              color: "#4CAF50",
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
                text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #4CAF50, 0 0 20px #4CAF50;
              }
              to {
                text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #4CAF50, 0 0 40px #4CAF50;
              }
            }

            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }

            .typing-input:focus {
              outline: none;
              box-shadow: 0 0 10px #4CAF50;
              transform: scale(1.02);
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

            button {
              transition: all 0.3s ease !important;
            }

            button:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important;
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default Level5Game;