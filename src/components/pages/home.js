import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import frontGif from "../../images/front.gif";
import bgmusic from "../../images/newbg.mp3";
import buttonclick from "../../images/button_click.mp3";

const Home = () => {
  const bgMusicRef = useRef(null);
  const buttonClickSoundRef = useRef(null);

  useEffect(() => {
    bgMusicRef.current = new Audio(bgmusic);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.5;
    bgMusicRef.current.play().catch((error) => console.log("Autoplay blocked: ", error));

    buttonClickSoundRef.current = new Audio(buttonclick);

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleButtonClick = () => {
    if (buttonClickSoundRef.current) {
      buttonClickSoundRef.current.currentTime = 0;
      buttonClickSoundRef.current.play();
    }
  };

  return (
    <div className="home-container">
      <div className="overlay">
        <h1 className="title">Typing Adventure Game</h1>

        <div className="button-group">
          <Link to="/levels">
            <button className="animated-button" onClick={handleButtonClick}>Start Game</button>
          </Link>
          <Link to="/hp">
            <button className="animated-button" onClick={handleButtonClick}>How to Play</button>
          </Link>
          <Link to="/rules">
            <button className="animated-button" onClick={handleButtonClick}>Rules</button>
          </Link>
          <Link to="/profile">
            <button className="animated-button" onClick={handleButtonClick}>Profile</button>
          </Link>
          <button className="animated-button" onClick={() => window.close()}>Quit Game</button>
        </div>
      </div>
      <img src={frontGif} alt="Typing Adventure Front" className="background-gif" />
    </div>
  );
};

export default Home;
