import React, { useEffect, useRef } from "react";
import "./rules.css"; // Ensure this file is scoped only to the rules page
import { Link } from "react-router-dom";
import bgmusic from "../../images/newbg.mp3";
import buttonclick from "../../images/button_click.mp3";

const Rules = () => {
  const bgMusicRef = useRef(null);
  const buttonClickRef = useRef(null);

  // Play background music when the component mounts
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.5; // Set volume (adjust as needed)
      bgMusicRef.current.loop = true; // Loop background music
      bgMusicRef.current.play().catch((err) => console.log("Autoplay blocked", err));
    }
  }, []);

  // Function to play button click sound
  const handleButtonClick = () => {
    if (buttonClickRef.current) {
      buttonClickRef.current.play();
    }
  };

  return (
    <div className="rules-page">
      {/* Background Music */}
      <audio ref={bgMusicRef} src={bgmusic} />

      <div className="rules-container">
        <div className="overlay">
          <h1 className="rules-title">Game Rules</h1>
          <div className="rules-content">
            <p>
              <strong>Objective:</strong> Help the runner avoid obstacles by typing the word displayed above each obstacle.
            </p>
            <ul>
              <li>Obstacles will move towards the runner from the right side of the screen.</li>
              <li>Each obstacle has a word displayed above it. You must type this word exactly into the input box.</li>
              <li>Press <strong>Enter</strong> after typing the word to make the runner jump and avoid the obstacle.</li>
              <li>If you type the word incorrectly or fail to type it before the obstacle reaches the runner, the game is over.</li>
              <li>For every correct word, the runner successfully jumps, and you earn <strong>10 points</strong>.</li>
              <li>The game lasts for <strong>30 seconds</strong>. Try to score as many points as possible before the timer runs out!</li>
            </ul>
            <p><strong>Pro Tips:</strong></p>
            <ul>
              <li>Focus on typing the displayed word quickly and accurately.</li>
              <li>Practice to improve your typing speed and reflexes!</li>
              <li>Keep an eye on the timer and aim for a high score.</li>
            </ul>
          </div>

          {/* Button Click Sound */}
          <audio ref={buttonClickRef} src={buttonclick} />

          <Link to="/home">
            <button className="back-button" onClick={handleButtonClick}>
              <span role="img" aria-label="Home">🏠</span> Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Rules;
