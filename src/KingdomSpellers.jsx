import React, { useState, useEffect, useCallback } from "react";
import { words as wordList, definitions } from "./data/firstgradelist";
import "./index.css";

// Avatar sprite paths from public folder
const SPRITES = {
  esquire: {
    idle: `${process.env.PUBLIC_URL}/assets/images/esquire_idle.png`,
    cheer: `${process.env.PUBLIC_URL}/assets/images/esquire_cheer.png`,
    cry: `${process.env.PUBLIC_URL}/assets/images/esquire_cry.png`,
  },
  knight: {
    idle: `${process.env.PUBLIC_URL}/assets/images/knight_idle.png`,
    cheer: `${process.env.PUBLIC_URL}/assets/images/knight_cheer.png`,
    cry: `${process.env.PUBLIC_URL}/assets/images/knight_cry.png`,
  },
  king: {
    idle: `${process.env.PUBLIC_URL}/assets/images/king_idle.png`,
    cheer: `${process.env.PUBLIC_URL}/assets/images/king_cheer.png`,
    cry: `${process.env.PUBLIC_URL}/assets/images/king_cry.png`,
  },
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

const getDefinition = (word) =>
  definitions[word] || "Think about what this word means.";

// Utility: shuffle a small array
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function KingdomSpellers() {
  const [currentWord, setCurrentWord] = useState("");
  const [currentDefinition, setCurrentDefinition] = useState("");
  const [guessArray, setGuessArray] = useState([]);
  const [tiles, setTiles] = useState([]); // { id, letter }
  const [tileAssignments, setTileAssignments] = useState({}); // id -> index in word or null
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [stage, setStage] = useState(0); // 0=esquire,1=knight,2=king
  const [emojiFeedback, setEmojiFeedback] = useState("");
  const [usedWordsThisStage, setUsedWordsThisStage] = useState(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [anim, setAnim] = useState("idle"); // idle | cheer | cry

  // ---------- CHARACTER HELPERS ----------
  const stageName = stage === 0 ? "Esquire" : stage === 1 ? "Knight" : "King";

  const currentSpriteSet =
    stage === 0 ? SPRITES.esquire : stage === 1 ? SPRITES.knight : SPRITES.king;

  const avatarSrc =
    anim === "cheer"
      ? currentSpriteSet.cheer
      : anim === "cry"
      ? currentSpriteSet.cry
      : currentSpriteSet.idle;

  // ---------- CORE WORD LOGIC ----------

  // choose a new word that hasn't been used in this stage yet
  const pickNewWord = useCallback(() => {
    if (wordList.length === 0) return;

    setAnim("idle");
    setEmojiFeedback("");

    setTileAssignments({});
    setGuessArray([]);

    setTiles((prev) => prev); // just to touch state, avoids stale closure warnings

    setUsedWordsThisStage((prevSet) => {
      const used = new Set(prevSet);

      // If we've used all words, advance stage and reset used set
      if (used.size >= wordList.length) {
        const nextStage = Math.min(2, stage + 1);
        setStage(nextStage);
        used.clear();
      }

      // find candidate words not yet used in this stage
      const unusedWords = wordList.filter((w) => !used.has(w));
      const word =
        unusedWords[Math.floor(Math.random() * unusedWords.length)];

      used.add(word);

      // build tiles & guess state for this chosen word
      const lowerWord = word.toLowerCase();
      const letters = lowerWord.split("");

      // initial guess array is all underscores
      const startGuess = letters.map(() => "_");

      // required letters (unique from word)
      const uniqueLetters = Array.from(new Set(letters));

      // choose wrong letters: at least 3 incorrect tiles
      const wrongPool = ALPHABET.filter(
        (ch) => !uniqueLetters.includes(ch)
      );
      const wrongCount = Math.min(
        wrongPool.length,
        Math.max(3, 6 - uniqueLetters.length) // more wrong tiles for shorter words
      );
      const wrongLetters = shuffle(wrongPool).slice(0, wrongCount);

      const tileLetters = shuffle([...uniqueLetters, ...wrongLetters]);

      const newTiles = tileLetters.map((letter, idx) => ({
        id: `tile-${Date.now()}-${idx}`,
        letter,
      }));

      // apply all state updates connected to the new word
      setCurrentWord(lowerWord);
      setCurrentDefinition(getDefinition(lowerWord));
      setGuessArray(startGuess);
      setTiles(newTiles);
      setTileAssignments({});

      return used;
    });
  }, [stage]);

  // initial load
  useEffect(() => {
    pickNewWord();
  }, [pickNewWord]);

  // ---------- SPEECH ----------
  const speakWord = () => {
    if (!window.speechSynthesis || !currentWord) return;

    const utter = new SpeechSynthesisUtterance(currentWord);
    utter.lang = "en-US";
    utter.rate = 0.9;
    utter.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // ---------- TILE CLICK ----------
  const handleTileClick = (tileId) => {
    if (!currentWord || gameOver) return;

    setTileAssignments((prevAssign) => {
      const newAssign = { ...prevAssign };
      const targetWord = currentWord;
      const letters = targetWord.split("");

      const alreadyAssignedPositions = new Set(
        Object.values(newAssign).filter((v) => v !== null && v !== undefined)
      );

      const assignedPos = newAssign[tileId];

      if (assignedPos !== undefined && assignedPos !== null) {
        // DESELECT: remove letter from that position
        setGuessArray((prevGuess) => {
          const next = [...prevGuess];
          next[assignedPos] = "_";
          return next;
        });
        newAssign[tileId] = null;
        return newAssign;
      }

      // find the tile's letter
      const tile = tiles.find((t) => t.id === tileId);
      if (!tile) return newAssign;
      const { letter } = tile;

      // find first position in word that matches this letter and is free
      const pos = letters.findIndex(
        (ch, idx) =>
          ch === letter &&
          !alreadyAssignedPositions.has(idx) &&
          guessArray[idx] === "_"
      );

      if (pos === -1) {
        // nowhere to place this letter
        return newAssign;
      }

      // assign tile to this position
      setGuessArray((prevGuess) => {
        const next = [...prevGuess];
        next[pos] = letter;
        return next;
      });
      newAssign[tileId] = pos;
      return newAssign;
    });
  };

  // ---------- CHECK ANSWER ----------
  const handleCheck = () => {
    if (!currentWord || gameOver) return;

    const guess = guessArray.join("");
    if (guess.includes("_")) {
      // incomplete guess, do nothing special
      return;
    }

    if (guess === currentWord) {
      // correct
      setAnim("cheer");
      setEmojiFeedback("🎉 Great job!");
      setXp((prev) => prev + 10);

      // after a short pause, go to next word
      setTimeout(() => {
        setAnim("idle");
        pickNewWord();
      }, 900);
    } else {
      // wrong guess
      setAnim("cry");
      setEmojiFeedback("❌ Try again!");

      setLives((prevLives) => {
        const nextLives = prevLives - 1;
        if (nextLives <= 0) {
          // game over
          setGameOver(true);
        } else {
          // reset guess & tile usage but keep same word
          setGuessArray(currentWord.split("").map(() => "_"));
          setTileAssignments({});
        }
        return nextLives;
      });

      // let cry frame show briefly
      setTimeout(() => {
        setAnim((prevAnim) => (gameOver ? prevAnim : "idle"));
      }, 800);
    }
  };

  const handleResetGame = () => {
    setXp(0);
    setLives(3);
    setStage(0);
    setEmojiFeedback("");
    setGameOver(false);
    setUsedWordsThisStage(new Set());
    pickNewWord();
  };

  // auto-check when all positions are filled
  useEffect(() => {
    if (!currentWord || gameOver) return;
    if (!guessArray.length) return;
    if (!guessArray.includes("_")) {
      // all letters chosen, check once
      handleCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessArray]); // we intentionally only depend on guessArray

  return (
    <div className="ks-page">
      <div className="ks-game">
        <header className="ks-header">
          <h1 className="ks-title">
            <span role="img" aria-label="crown">
              👑
            </span>{" "}
            kingdom spellers
          </h1>
          <div className="ks-header-info">
            <span className="ks-header-pill">xp: {xp}</span>
            <span className="ks-header-pill">lives: {lives}</span>
            <span className="ks-header-pill">rank: {stageName}</span>
          </div>
        </header>

        <main className="ks-main">
          {/* LEFT: avatar */}
          <section className="ks-avatar-section">
            <img
              src={avatarSrc}
              alt={`${stageName} character`}
              className="ks-character"
            />
          </section>

          {/* RIGHT: puzzle */}
          <section className="ks-puzzle-section">
            <div className="ks-word-row">
              <button
                type="button"
                className="ks-speak-button"
                onClick={speakWord}
                aria-label="Hear the word"
              >
                🔊
              </button>
              <div className="ks-word-display">
                {guessArray.map((ch, idx) => (
                  <span key={idx} className="ks-letter-slot">
                    {ch === "_" ? "_" : ch}
                  </span>
                ))}
              </div>
            </div>

            <p className="ks-definition">{currentDefinition}</p>

            {emojiFeedback && (
              <p className="ks-feedback" aria-live="polite">
                {emojiFeedback}
              </p>
            )}

            <div className="ks-tiles">
              {tiles.map((tile) => {
                const isSelected =
                  tileAssignments[tile.id] !== undefined &&
                  tileAssignments[tile.id] !== null;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    className={
                      "ks-tile" + (isSelected ? " ks-tile--selected" : "")
                    }
                    onClick={() => handleTileClick(tile.id)}
                  >
                    {tile.letter}
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        {gameOver && (
          <div className="ks-overlay">
            <div className="ks-overlay-card">
              <h2>Game Over</h2>
              <p>You used all three lives. Tap below to start again.</p>
              <button
                type="button"
                className="ks-reset-button"
                onClick={handleResetGame}
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
