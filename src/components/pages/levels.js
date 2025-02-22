import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import './levels.css';
import back from "../../images/front.gif";
import bgmusic from "../../images/bg_music.mp3";

function Levels() {
  const [audio] = useState(new Audio(bgmusic));
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) return;

      try {
        const response = await axios.get(`http://localhost:2000/getusers?username=${storedUsername}`);
        console.log("API Response:", response.data);

        const userData = Array.isArray(response.data) ? response.data[0] : response.data;

        if (!userData) {
          console.error("No user data found");
          return;
        }

        const levelCount = userData.levelsCompleted;

        if (levelCount === undefined || levelCount === null) {
          console.warn("levelsCompleted is missing or null, setting default value to 0");
          setUnlockedLevel(1);
          return;
        }

        const parsedLevelCount = parseInt(levelCount, 10);
        if (isNaN(parsedLevelCount)) {
          console.error("Error: levelsCompleted is NaN, setting default value to 1");
          setUnlockedLevel(1);
        } else {
          console.log("Parsed levelsCompleted:", parsedLevelCount);
          setUnlockedLevel(parsedLevelCount + 1);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const playMusic = () => {
    audio.loop = true;
    audio.play().catch(error => console.error("Autoplay blocked:", error));
  };

  const handleLevelClick = (level) => {
    if (level > unlockedLevel) {
      setAlertMessage(`You need to complete level ${level - 1} first!`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    history.push(`/l${level}`);
  };

  const renderLevelBox = (level) => (
    <div onClick={() => handleLevelClick(level)} style={{ position: 'relative' }}>
      <div className="box" style={{
        ...boxStyle,
        opacity: level > unlockedLevel ? 0.5 : 1,
        cursor: level > unlockedLevel ? 'not-allowed' : 'pointer',
        position: 'relative'
      }}>
        Level {level}

        {/* Lock Icon for Locked Levels */}
        {level > unlockedLevel && (
          <div style={lockIconStyle}>🔒</div>
        )}

        {/* Star Icon for Completed Levels */}
        {level < unlockedLevel && (
          <div style={starIconStyle}>⭐</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="App" onClick={playMusic}>
      {/* Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        backgroundImage: `url(${back})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }} />

      {/* Alert Message */}
      {showAlert && (
        <div style={alertStyle}>
          {alertMessage}
        </div>
      )}

      <div className="content" style={contentStyle}>
        <h1 style={titleStyle}>Select Your Level</h1>

        <div className="box-container" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Easy Levels */}
          <div>
            <h2 style={{ color: '#90EE90' }}>Easy</h2>
            <div className="row" style={rowStyle}>
              {renderLevelBox(1)}
              {renderLevelBox(2)}
              {renderLevelBox(3)}
              {renderLevelBox(4)}
            </div>
          </div>

          {/* Medium Levels */}
          <div>
            <h2 style={{ color: '#FFD700' }}>Medium</h2>
            <div className="row" style={rowStyle}>
              {renderLevelBox(5)}
              {renderLevelBox(6)}
              {renderLevelBox(7)}
              {renderLevelBox(8)}
            </div>
          </div>

          {/* Hard Levels */}
          <div>
            <h2 style={{ color: '#FF6347' }}>Hard</h2>
            <div className="row" style={rowStyle}>
              {renderLevelBox(9)}
              {renderLevelBox(10)}
            </div>
          </div>
        </div>

        <Link to="/home" style={{ textDecoration: 'none' }}>
          <div style={homeButtonStyle}>Back to Home</div>
        </Link>
      </div>
    </div>
  );
}

// Styles
const boxStyle = {
  width: '80px',
  height: '80px',
  margin: '10px',
  background: 'linear-gradient(45deg, #FF5722, #FFC107)',
  color: '#ffffff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1rem',
  fontWeight: 'bold',
  borderRadius: '10px',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  cursor: 'pointer',
  animation: 'fadeIn 1s ease-in-out',
};

const lockIconStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '1.5rem',
};

const starIconStyle = {
  position: 'absolute',
  bottom: '5px',
  right: '5px',
  fontSize: '1.2rem',
  color: '#FFD700', // Gold color for the star
};

const alertStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 0, 0, 0.8)',
  color: 'white',
  padding: '15px 30px',
  borderRadius: '8px',
  zIndex: 100,
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  animation: 'fadeIn 0.3s ease-out',
};

const contentStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: `'Poppins', sans-serif`,
  color: '#ffffff',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
  position: 'relative',
  zIndex: 1,
};

const titleStyle = {
  marginBottom: '30px',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  animation: 'fadeIn 2s ease-in-out',
};

const rowStyle = {
  display: 'flex',
  marginBottom: '15px',
};

const homeButtonStyle = {
  marginTop: '20px',
  padding: '10px 20px',
  background: 'linear-gradient(45deg, #FF5722, #FF9800)',
  color: 'white',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  borderRadius: '8px',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'background 0.3s ease',
};

export default Levels;
