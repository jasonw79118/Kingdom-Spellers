import React, { useState, useEffect } from "react";
import firstGradeWords from "./data/firstgradelist";
import "./index.css";

const allWords = Object.keys(firstGradeWords);

// Character image paths (from public/images)
const baseImagePath = process.env.PUBLIC_URL + "/images/";

const characterImages = {
  esquire: {
    idle: baseImagePath + "esquire_idle.png",
    cheer: baseImagePath + "esquire_cheer.png",
    cry: baseImagePath + "esquire_cry.png",
  },
  knight: {
    idle: baseImagePath + "knight_idle.png",
    cheer: baseImagePath + "knight_cheer.png",
    cry: baseImagePath + "knight_cry.png",
  },
  king: {
    idle: baseImagePath + "king_idle.png",
    cheer: baseImagePath + "king_cheer.png",
    cry: baseImagePath + "king_cry.png",
  },
};

export default function KingdomSpellers() {
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const [currentWord, setCurrentWord] = useState(
    () => allWords[Math.floor(Math.random() * allWords.length)]
  );
  const [displayLetters, setDisplayLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [characterState, setCharacterState] = useState("idle"); // idle | win | lose

  // Rank label shown in UI
  const getRankLabel = () => {
    if (xp < 50) return "Esquire";
    if (xp < 150) return "Knight";
    return "King";
  };

  // Rank key used for image lookup
  const getRankKey = () => {
    if (xp < 50) return "esquire";
    if (xp < 150) return "knight";
    return "king";
  };

  const getCharacterImage = () => {
    const rankKey = getRankKey();
    const imgs = characterImages[rankKey];
    if (characterState === "win") return imgs.cheer;
    if (characterState === "lose") return imgs.cry;
    return imgs.idle;
  };

  // Text-to-speech for current word
  const speakWord = (word) => {
    if (!word || typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Prepare letter tiles whenever the current word changes
  useEffect(() => {
    if (!currentWord) return;

    const word = currentWord.toLowerCase();
    const baseLetters = word.split("");
    const extraCount = Math.max(0, 6 - word.length);
    const extraLetters = Array.from({ length: extraCount }, () =>
      String.fromCharCode(97 + Math.floor(Math.random() * 26))
    );

    const shuffled = [...baseLetters, ...extraLetters].sort(() => Math.random() - 0.5);

    setDisplayLetters(shuffled);
    setSelectedLetters([]);
    setCharacterState("idle");
  }, [currentWord]);

  // Pick a new random word
  const newWord = () => {
    const word = allWords[Math.floor(Math.random() * allWords.length)];
    setCurrentWord(word);
  };

  // Check for correct / wrong full word
  useEffect(() => {
    if (!currentWord || gameOver) return;

    const guess = selectedLetters.join("");
    if (guess.length !== currentWord.length) return; // only check when all slots filled

    const target = currentWord.toLowerCase();

    if (guess === target) {
      // Correct
      setXp((prev) => prev + 10);
      setCharacterState("win");
      setTimeout(() => {
        if (!gameOver) {
          newWord();
        }
      }, 1200);
    } else {
      // Wrong full word -> lose one life
      setCharacterState("lose");
      setLives((prevLives) => {
        const updated = prevLives - 1;
        if (updated <= 0) {
          // Game over
          setGameOver(true);
          return 0;
        } else {
          // Still have lives: move on to a new word after a short pause
          setTimeout(() => {
            if (!gameOver) {
              newWord();
            }
          }, 1000);
          return updated;
        }
      });
    }
  }, [selectedLetters, currentWord, gameOver]);

  // Click a letter tile (select/deselect)
  const handleLetterClick = (letter) => {
    if (gameOver) return;
    if (characterState === "win" || characterState === "lose") return;

    const index = selectedLetters.indexOf(letter);
    if (index !== -1) {
      // Deselect this letter (remove first match)
      const updated = [...selectedLetters];
      updated.splice(index, 1);
      setSelectedLetters(updated);
    } else {
      // Add letter if there is still space
      if (selectedLetters.length < currentWord.length) {
        setSelectedLetters([...selectedLetters, letter]);
      }
    }
  };

  // Hearts display
  const hearts = "❤️".repeat(lives) + "🖤".repeat(3 - lives);

  // Restart game after game over
  const handleRestart = () => {
    setXp(0);
    setLives(3);
    setGameOver(false);
    setCharacterState("idle");
    setSelectedLetters([]);
    newWord();
  };

  const clue = firstGradeWords[currentWord];

  return (
    <div className="game-container">
      <h1>👑 kingdom spellers</h1>
      <p>
        xp: {xp} | rank: {getRankLabel()} | lives: {hearts}
      </p>

      <img src={getCharacterImage()} alt="character" className="character" />

      <h3 className="clue">
        clue: {clue}
        <button
          className="speaker-btn"
          onClick={() => speakWord(currentWord)}
          title="Hear word"
        >
          🔊
        </button>
      </h3>

      <div className="word-display">
        {currentWord.split("").map((_, i) => (
          <span key={i} className="letter-space">
            {selectedLetters[i] || "_"}
          </span>
        ))}
      </div>

      <div className="letters-container">
        {displayLetters.map((letter, index) => (
          <button
            key={`${letter}-${index}-${currentWord}`}
            className={`letter-button ${
              selectedLetters.includes(letter) ? "selected" : ""
            }`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>game over</h2>
            <p>you used all your hearts. want to try again?</p>
            <button onClick={handleRestart}>start over</button>
          </div>
        </div>
      )}
    </div>
  );
}

