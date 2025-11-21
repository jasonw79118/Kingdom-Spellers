import React, { useState, useEffect } from "react";
import firstGradeWords from "./data/firstgradelist";
import "./index.css";

// Character images served from public/images
const characterImages = {
  esquire: {
    idle: "images/esquire_idle.png",
    dance: "images/esquire_cheer.png",
    cry: "images/esquire_cry.png",
  },
  knight: {
    idle: "images/knight_idle.png",
    dance: "images/knight_cheer.png",
    cry: "images/knight_cry.png",
  },
  king: {
    idle: "images/king_idle.png",
    dance: "images/king_cheer.png",
    cry: "images/king_cry.png",
  },
};

// 🔊 Speak the word only
const speakWord = (text) => {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.9;
  utter.pitch = 1.1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};

// Difficulty scaling based on XP
const getRevealPercent = (xp) => {
  if (xp < 15) return 0.75;  // easy
  if (xp < 40) return 0.5;   // normal
  if (xp < 80) return 0.3;   // hard
  return 0.15;               // bonkers
};

export default function KingdomSpellers() {
  const [xp, setXP] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentWord, setCurrentWord] = useState("");
  const [maskedArray, setMaskedArray] = useState([]);
  const [letterTiles, setLetterTiles] = useState([]);
  const [definition, setDefinition] = useState("");
  const [feedback, setFeedback] = useState("");
  const [characterAction, setCharacterAction] = useState("idle"); // idle | dance | cry
  const [gameOver, setGameOver] = useState(false);

  // rank derived from xp (fixed character size, just visual label)
  const rank =
    xp < 30 ? "esquire" :
    xp < 70 ? "knight" :
    "king";

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Load a new random word
  const loadWord = () => {
    const words = Object.keys(firstGradeWords);
    const word = words[Math.floor(Math.random() * words.length)];

    const revealPercent = getRevealPercent(xp);
    const revealCount = Math.max(1, Math.floor(word.length * revealPercent));

    const revealIndices = new Set();
    while (revealIndices.size < revealCount) {
      revealIndices.add(Math.floor(Math.random() * word.length));
    }

    const masked = word.split("").map((letter, i) =>
      revealIndices.has(i) ? letter : "_"
    );

    const tiles = word.split("").map((letter, index) => ({
      id: `${letter}-${index}-${Math.random()}`,
      letter,
    }));

    setCurrentWord(word);
    setMaskedArray(masked);
    setLetterTiles(shuffle(tiles));
    setDefinition(firstGradeWords[word]); // values are strings
    setFeedback("");
    setCharacterAction("idle");
  };

  // First word on mount
  useEffect(() => {
    loadWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLetterClick = (tile) => {
    if (gameOver) return;
    if (characterAction !== "idle") return;

    const blankIndex = maskedArray.indexOf("_");
    if (blankIndex === -1) return;

    const newMask = [...maskedArray];
    newMask[blankIndex] = tile.letter;
    setMaskedArray(newMask);

    setLetterTiles((prevTiles) => prevTiles.filter((t) => t.id !== tile.id));

    // If we still have blanks, don't check yet
    if (newMask.includes("_")) {
      return;
    }

    const formed = newMask.join("");

    // COMPLETE WORD: check correct vs wrong
    if (formed === currentWord) {
      setCharacterAction("dance");
      setFeedback("🎉 Correct!");
      speakWord(currentWord);
      setXP((prevXP) => prevXP + 10);

      // 1 second pause, then new word
      setTimeout(() => {
        setCharacterAction("idle");
        loadWord();
      }, 1000);
    } else {
      setCharacterAction("cry");
      setFeedback("❌ Try again!");

      setLives((prevLives) => {
        const newLives = prevLives - 1;

        if (newLives <= 0) {
          setGameOver(true);
          speakWord("game over");
          return 0;
        } else {
          // Still alive → new word after 1 second
          setTimeout(() => {
            setCharacterAction("idle");
            loadWord();
          }, 1000);
          return newLives;
        }
      });
    }
  };

  // Simple undo: remove last non-blank and return tile
  const undoLast = () => {
    if (gameOver) return;
    if (characterAction !== "idle") return;

    let lastIndex = -1;
    for (let i = maskedArray.length - 1; i >= 0; i--) {
      if (maskedArray[i] !== "_") {
        lastIndex = i;
        break;
      }
    }
    if (lastIndex === -1) return;

    const letter = maskedArray[lastIndex];
    const newMask = [...maskedArray];
    newMask[lastIndex] = "_";
    setMaskedArray(newMask);

    setLetterTiles((prev) => [
      ...prev,
      { id: `${letter}-${Math.random()}`, letter },
    ]);
  };

  const restart = () => {
    setXP(0);
    setLives(3);
    setGameOver(false);
    setCharacterAction("idle");
    setFeedback("");
    loadWord();
  };

  return (
    <div className="ks-container">
      <h1 className="ks-title">🛡️ Kingdom Spellers</h1>

      {gameOver ? (
        <div className="game-over-box">
          <h2>Game Over!</h2>
          <p>Your hearts are gone. Want to try again?</p>
          <button className="restart-btn" onClick={restart}>
            Play Again
          </button>
        </div>
      ) : (
        <>
          <div className="hud">
            <div className="stat-box">⭐ XP: {xp}</div>
            <div className="stat-box">❤️ Lives: {lives}</div>
            <div className="stat-box">🛡 Rank: {rank}</div>
          </div>

          <img
            src={characterImages[rank][characterAction]}
            alt="character"
            className="character-img"
          />

          {/* Word + Speaker */}
          <div className="word-row">
            <div className="word-display">{maskedArray.join(" ")}</div>
            <button
              className="speaker-btn"
              onClick={() => speakWord(currentWord)}
              title="Hear the word"
            >
              🔊
            </button>
          </div>

          {/* Definition */}
          <div className="definition-box">
            ℹ️ {definition}
          </div>

          {/* Letter tiles */}
          <div className="tile-grid">
            {letterTiles.map((tile) => (
              <button
                key={tile.id}
                className="letter-tile"
                onClick={() => handleLetterClick(tile)}
              >
                {tile.letter}
              </button>
            ))}
          </div>

          {/* Feedback + Undo */}
          {feedback && <div className="feedback">{feedback}</div>}

          <button className="undo-btn" onClick={undoLast}>
            ⬅ Undo
          </button>
        </>
      )}
    </div>
  );
}
