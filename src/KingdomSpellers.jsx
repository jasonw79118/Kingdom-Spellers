import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// --------------- WORD LISTS -----------------
const easyWords = [
  "ago","apple","are","arm","ate","away","baby","bank","bark","base","bath","bay",
  "belong","bench","bent","bird","bite","boot","born","both","brave","broke","brow",
  "bucket","bunch","burst","candy","care","cash","chop","class","coat","cold","come",
  "dash","feel","feet","filled","fine","five","fresh","funny","fuzzy","game","gave",
  "give","hands","have","hens","holly","just","king","lamp","land","lend","look",
  "lump","lunch","many","maple","mask","meal","meet","mice","mile","milk","mind",
  "mine","moon","mouth","muddy","mumps","paper","pine","planet","race","ranch","rode",
  "sang","school","sharp","show","sister","sleep","smile","soda","soon","stairs",
  "start","stunt","swing","three","torch","tree","truck","try","week","went","were",
  "west","when","where","why","wing","wink","wipe","wish","your","zoo"
];

const normalWords = [
  "absent","adding","ahead","airline","allow","always","maze","amber","among","amount",
  "angel","anger","ankle","apart","arch","arrest","awake","awful","babble","babies",
  "bait","ballroom","banner","batter","beak","beam","beat","begin","benches","biting",
  "bloom","body","bolt","bones","branch","bulge","bunk","better","button","called",
  "cannot","carpet","cattle","cents","chair","chance","chart","cheeks","cheer","chew",
  "child","chill","church","classroom","cliff","clog","clown","club","coin","color",
  "comes","crate","crop","crush","curly","dainty","damp","dance","dark","deer",
  "dishes","dizzy","drench","dusty","ear","earth","eaten","eggs","ever","eye","faces",
  "fare","farmer","fatter","fawn","fifty","film","flag","flock","fluffy","frame",
  "freeze","gate","gift","grinning","gripe","grumble","grumpy","guppy","hammer",
  "harbor","harvest","hatch","holiday","host","huge","human","hungry","inside","jacket",
  "joint","joke","jot","jungle","kingdom","ladder","leader","lean","lesson","listed",
  "loss","loud","loves","lush","maker","maybe","mumble","munch","never","news","number",
  "nurse","oil","open","package","paddle","paint","plates","platter","played","please",
  "police","poodle","pound"
];

// ---------- SIMPLE DEFINITIONS FOR ALL WORDS ----------
// style: simple, kid friendly, lowercase, no periods
const definitions = {
  // easy list
  ago: "a time before now",
  apple: "a round red or green fruit",
  are: "a word that tells what things are",
  arm: "a body part used to reach",
  ate: "already had food",
  away: "not here or far from here",
  baby: "a very young child",
  bank: "a place to keep money safe",
  bark: "the sound a dog makes",
  base: "the bottom part of something",
  bath: "washing your body in water",
  bay: "water where land curves around it",
  belong: "to be part of a group or place",
  bench: "a long seat for several people",
  bent: "not straight or curved",
  bird: "an animal with feathers and wings",
  bite: "to use your teeth on something",
  boot: "a shoe that covers your ankle",
  born: "when a baby comes into the world",
  both: "two things together",
  brave: "not scared in a hard situation",
  broke: "already broken or not working",
  brow: "the part above your eyes",
  bucket: "a round container with a handle",
  bunch: "a group of things together",
  burst: "to break open suddenly",
  candy: "a sweet treat",
  care: "to help or think kindly about someone",
  cash: "money in coins and paper",
  chop: "to cut into pieces",
  class: "a group of students learning together",
  coat: "a warm jacket for outside",
  cold: "having very little heat",
  come: "to move toward a place or person",
  dash: "to run very quickly",
  feel: "to sense something in your body or heart",
  feet: "the parts of your body you stand on",
  filled: "full of something",
  fine: "okay or good enough",
  five: "the number after four",
  fresh: "new or not old",
  funny: "makes you laugh",
  fuzzy: "soft and a little hairy",
  game: "something fun you play",
  gave: "already gave something to someone",
  give: "to hand something to someone",
  hands: "body parts at the ends of your arms",
  have: "to own or hold something",
  hens: "female chickens",
  holly: "a plant with sharp green leaves and red berries",
  just: "only or exactly",
  king: "a man who rules a kingdom",
  lamp: "a light you can turn on",
  land: "ground or earth",
  lend: "to let someone borrow something",
  look: "to use your eyes to see",
  lump: "a small bump or mass",
  lunch: "a meal in the middle of the day",
  many: "a large number of things",
  maple: "a tree that can make sweet syrup",
  mask: "something that covers your face",
  meal: "food you eat at one time",
  meet: "to see someone for the first time or again",
  mice: "more than one mouse",
  mile: "a measure of distance",
  milk: "a white drink from cows",
  mind: "the part of you that thinks and feels",
  mine: "something that belongs to me",
  moon: "the bright rock that circles earth",
  mouth: "the opening on your face for eating and talking",
  muddy: "covered with wet dirt or mud",
  mumps: "a sickness that makes your cheeks swell",
  paper: "thin material used for writing or drawing",
  pine: "a tree with needles and cones",
  planet: "a large round object in space",
  race: "a contest of speed",
  ranch: "a large farm for animals",
  rode: "already rode on something",
  sang: "already sang a song",
  school: "a place where children learn",
  sharp: "having a point that can cut",
  show: "to let people see something",
  sister: "a girl who has the same parents as you",
  sleep: "to rest with your eyes closed",
  smile: "a happy look on your face",
  soda: "a sweet fizzy drink",
  soon: "in a short time",
  stairs: "steps that go up or down",
  start: "to begin something",
  stunt: "a tricky or daring action",
  swing: "a seat that moves back and forth",
  three: "the number after two",
  torch: "a stick or light used to see",
  tree: "a tall plant with a trunk and branches",
  truck: "a big vehicle for carrying things",
  try: "to attempt to do something",
  week: "seven days in a row",
  went: "already went somewhere",
  were: "past form of are",
  west: "a direction on a compass",
  when: "a word asking about time",
  where: "a word asking about place",
  why: "a word asking for a reason",
  wing: "a body part birds use to fly",
  wink: "to close and open one eye quickly",
  wipe: "to clean by rubbing",
  wish: "to hope something will happen",
  your: "shows something belongs to you",
  zoo: "a place where people see animals",

  // normal / challenge list
  absent: "not here or missing",
  adding: "putting numbers together",
  ahead: "in front or before",
  airline: "a company that flies planes",
  allow: "to let someone do something",
  always: "happens all the time",
  maze: "a puzzle with twisting paths",
  amber: "a yellow or orange color",
  among: "in the middle of others",
  amount: "how much there is",
  angel: "a kind helper from heaven",
  anger: "a strong feeling of being mad",
  ankle: "the joint above your foot",
  apart: "not together or separated",
  arch: "a curved shape over something",
  arrest: "when police stop someone for wrong",
  awake: "not sleeping",
  awful: "very bad or not nice",
  babble: "to talk in a silly mixed way",
  babies: "more than one baby",
  bait: "food used to catch fish or animals",
  ballroom: "a large room for dancing",
  banner: "a long sign with words or pictures",
  batter: "a wet mix used to bake food",
  beak: "the hard mouth of a bird",
  beam: "a long strong piece of wood or metal",
  beat: "to hit or to win against",
  begin: "to start something",
  benches: "more than one long bench",
  biting: "using teeth on something",
  bloom: "to open like a flower",
  body: "all the parts of a person or animal",
  bolt: "a metal fastener or a flash of lightning",
  bones: "hard parts inside your body",
  branch: "a part that grows from a tree trunk",
  bulge: "a rounded part that sticks out",
  bunk: "a narrow bed often stacked",
  better: "more good than before",
  button: "a small round thing to close clothes",
  called: "already named or shouted to someone",
  cannot: "not able to do something",
  carpet: "soft covering on the floor",
  cattle: "farm animals like cows",
  cents: "small money worth less than a dollar",
  chair: "a seat for one person",
  chance: "a time something might happen",
  chart: "a picture that shows information",
  cheeks: "the soft sides of your face",
  cheer: "to shout happily for someone",
  chew: "to use your teeth on food",
  child: "a young boy or girl",
  chill: "to feel a little cold",
  church: "a place where people worship god",
  classroom: "a room where students learn",
  cliff: "a high steep side of rock or land",
  clog: "to block so things cannot pass",
  clown: "a funny performer with bright clothes",
  club: "a group of people with a shared interest",
  coin: "a small round piece of money",
  color: "what red blue or green are",
  comes: "moves closer or arrives here",
  crate: "a big wooden box",
  crop: "plants grown by farmers",
  crush: "to press something flat or broken",
  curly: "having hair in round shapes",
  dainty: "small and pretty or gentle",
  damp: "a little wet",
  dance: "to move to music",
  dark: "with little or no light",
  deer: "a wild animal with hooves",
  dishes: "plates bowls and cups",
  dizzy: "feeling like things spin",
  drench: "to make something very wet",
  dusty: "covered with fine dry dirt",
  ear: "the part used for hearing",
  earth: "the planet we live on",
  eaten: "already had food",
  eggs: "round food with shells from birds",
  ever: "at any time",
  eye: "the part used to see",
  faces: "the front of heads",
  fare: "money paid to ride or travel",
  farmer: "a person who grows crops or animals",
  fatter: "more fat than before",
  fawn: "a young baby deer",
  fifty: "the number five tens",
  film: "a movie or thin coating",
  flag: "a colored cloth for a country or group",
  flock: "a group of birds or animals",
  fluffy: "soft and light like a cloud",
  frame: "a border that holds a picture",
  freeze: "to become hard from cold",
  gate: "a door in a fence",
  gift: "something given to someone",
  grinning: "smiling with teeth showing",
  gripe: "to complain about something",
  grumble: "to complain in a low voice",
  grumpy: "in a bad or grouchy mood",
  guppy: "a small colorful fish",
  hammer: "a tool for hitting nails",
  harbor: "a safe place for boats",
  harvest: "to gather grown crops",
  hatch: "to come out of an egg",
  holiday: "a special day of rest or fun",
  host: "someone who invites and welcomes guests",
  huge: "very very big",
  human: "a person or people",
  hungry: "feeling like you need food",
  inside: "in the inner part of something",
  jacket: "a short coat for your body",
  joint: "a place where two parts meet",
  joke: "something said to be funny",
  jot: "to write something down quickly",
  jungle: "a thick forest with many plants",
  kingdom: "a land ruled by a king",
  ladder: "steps used to climb up",
  leader: "a person who guides others",
  lean: "to bend your body to one side",
  lesson: "a time when you learn something",
  listed: "already written in a list",
  loss: "when something is gone or missing",
  loud: "making a strong sound",
  loves: "likes very very much",
  lush: "full of thick green plants",
  maker: "a person who makes things",
  maybe: "something that might happen",
  mumble: "to speak very quietly and unclear",
  munch: "to eat with loud little bites",
  never: "at no time ever",
  news: "information about things that happened",
  number: "a symbol that shows how many",
  nurse: "a helper who cares for sick people",
  oil: "a thick liquid used for cooking or machines",
  open: "not closed or shut",
  package: "a wrapped box or bundle",
  paddle: "a tool used to move a boat",
  paint: "colored liquid used on walls or pictures",
  plates: "flat dishes for food",
  platter: "a large flat dish for serving food",
  played: "already took part in a game",
  please: "a polite word to ask kindly",
  police: "people who keep laws and safety",
  poodle: "a type of curly haired dog",
  pound: "a unit for weight or money"
};

function getDefinition(word) {
  const lower = word.toLowerCase();
  if (definitions[lower]) return definitions[lower];
  return "think about what this word means and use the letters to help you";
}

// ---------- HELPERS ----------
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// maskPercent: 0–1 (fraction of letters shown)
function maskWord(word, maskPercent) {
  const revealCount = Math.max(1, Math.floor(word.length * maskPercent));
  const indices = new Set();
  while (indices.size < revealCount) {
    indices.add(Math.floor(Math.random() * word.length));
  }
  return word.split("").map((ch, idx) => (indices.has(idx) ? ch : "_"));
}

function buildLetterChoices(word, maskedArray) {
  const missing = [];
  maskedArray.forEach((ch, idx) => {
    if (ch === "_") missing.push(word[idx]);
  });

  const choices = [...missing];
  const targetTotal = missing.length + 5; // 5 extra letters

  const banned = new Set(missing);
  while (choices.length < targetTotal) {
    const randLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!banned.has(randLetter)) choices.push(randLetter);
  }

  return shuffleArray(choices);
}

function stageFromXp(xp) {
  if (xp >= 120) return "king";
  if (xp >= 50) return "knight";
  return "esquire";
}

// sprites from public/images
const baseImagePath = process.env.PUBLIC_URL + "/images/";
const spriteMap = {
  esquire: {
    idle: baseImagePath + "esquire_idle.png",
    cheer: baseImagePath + "esquire_cheer.png",
    cry: baseImagePath + "esquire_cry.png"
  },
  knight: {
    idle: baseImagePath + "knight_idle.png",
    cheer: baseImagePath + "knight_cheer.png",
    cry: baseImagePath + "knight_cry.png"
  },
  king: {
    idle: baseImagePath + "king_idle.png",
    cheer: baseImagePath + "king_cheer.png",
    cry: baseImagePath + "king_cry.png"
  }
};

// sounds from public/sounds (optional)
const baseSoundPath = process.env.PUBLIC_URL + "/sounds/";
const soundMap = {
  correct: baseSoundPath + "trumpet_correct.mp3",
  wrong: baseSoundPath + "drum_wrong.mp3",
  levelup: baseSoundPath + "chime_levelup.mp3"
};

const XP_PER_CORRECT = 10;
const XP_PENALTY_WRONG = 5;

// --------------- MAIN COMPONENT -----------------
export default function KingdomSpellers() {
  const [currentWord, setCurrentWord] = useState("");
  const [slots, setSlots] = useState([]); // {char, fixed, fromChoice}
  const [letterChoices, setLetterChoices] = useState([]); // {letter, used, id}
  const [definition, setDefinition] = useState("");
  const [feedback, setFeedback] = useState("");
  const [xp, setXp] = useState(0);
  const [stage, setStage] = useState("esquire"); // esquire | knight | king
  const [emotion, setEmotion] = useState("idle"); // idle | cheer | cry

  // track progression through word lists
  const [usedEasyMap, setUsedEasyMap] = useState({});
  const [usedNormalMap, setUsedNormalMap] = useState({});
  const [completedEasy, setCompletedEasy] = useState(false);
  const [completedNormal, setCompletedNormal] = useState(false);

  const playSound = useCallback((type) => {
    const src = soundMap[type];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.play().catch(() => {});
    } catch {
      // ignore audio issues
    }
  }, []);

  // decide which list and mask percent based on progress
  const startNewRound = useCallback(() => {
    // choose which word list to use
    let list;
    let mode; // "easy" | "normal" | "hard"
    if (!completedEasy) {
      list = easyWords;
      mode = "easy";
    } else if (!completedNormal) {
      list = normalWords;
      mode = "normal";
    } else {
      list = [...easyWords, ...normalWords];
      mode = "hard";
    }

    // choose mask percent (difficulty) based on progress
    let maskPercent;
    if (!completedEasy) {
      maskPercent = 0.75; // show most letters at first
    } else if (!completedNormal) {
      maskPercent = 0.5; // normal difficulty
    } else if (xp < 200) {
      maskPercent = 0.25; // hard
    } else {
      maskPercent = 0.1; // very hard
    }

    // choose a word, prefer ones not used yet in this list
    let usedMap = null;
    if (mode === "easy") usedMap = usedEasyMap;
    if (mode === "normal") usedMap = usedNormalMap;

    let pool = list;
    if (usedMap) {
      const notUsed = list.filter((w) => !usedMap[w]);
      if (notUsed.length > 0) pool = notUsed;
    }

    const word = pool[Math.floor(Math.random() * pool.length)];

    // update used map & completion flags
    if (mode === "easy") {
      const nextUsed = { ...usedEasyMap, [word]: true };
      setUsedEasyMap(nextUsed);
      if (Object.keys(nextUsed).length >= easyWords.length) {
        setCompletedEasy(true);
      }
    } else if (mode === "normal") {
      const nextUsed = { ...usedNormalMap, [word]: true };
      setUsedNormalMap(nextUsed);
      if (Object.keys(nextUsed).length >= normalWords.length) {
        setCompletedNormal(true);
      }
    }

    // create masked view and letter choices
    const maskedArray = maskWord(word, maskPercent);
    const slotObjects = maskedArray.map((ch, idx) =>
      ch === "_"
        ? { char: "", fixed: false, fromChoice: null }
        : { char: word[idx], fixed: true, fromChoice: null }
    );
    const letters = buildLetterChoices(word, maskedArray);
    const choiceObjects = letters.map((letter, idx) => ({
      letter,
      used: false,
      id: idx
    }));

    setCurrentWord(word);
    setSlots(slotObjects);
    setLetterChoices(choiceObjects);
    setDefinition(getDefinition(word));
    setFeedback("");
    setEmotion("idle");
  }, [completedEasy, completedNormal, usedEasyMap, usedNormalMap, xp]);

  // load first word
  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  // update character stage on XP change
  useEffect(() => {
    const newStage = stageFromXp(xp);
    setStage((prev) => {
      if (prev !== newStage) {
        playSound("levelup");
        setEmotion("cheer");
        return newStage;
      }
      return prev;
    });
  }, [xp, playSound]);

  const handleLetterClick = (choiceIndex) => {
    const choice = letterChoices[choiceIndex];
    if (!choice) return;

    // if not used yet → place into first empty non-fixed slot
    if (!choice.used) {
      const emptyIndex = slots.findIndex((s) => !s.fixed && s.char === "");
      if (emptyIndex === -1) return; // no room

      const newSlots = slots.map((s, idx) =>
        idx === emptyIndex ? { ...s, char: choice.letter, fromChoice: choiceIndex } : s
      );
      const newChoices = letterChoices.map((c, idx) =>
        idx === choiceIndex ? { ...c, used: true } : c
      );

      setSlots(newSlots);
      setLetterChoices(newChoices);

      // check if word is complete
      const allFilled = newSlots.every((s) => s.fixed || s.char !== "");
      if (allFilled) {
        const attempt = newSlots.map((s) => s.char).join("");
        if (attempt === currentWord) {
          setFeedback("✅ great job you spelled it correctly");
          setEmotion("cheer");
          setXp((prev) => prev + XP_PER_CORRECT);
          playSound("correct");
        } else {
          setFeedback(`❌ almost the word was ${currentWord}`);
          setEmotion("cry");
          setXp((prev) => Math.max(0, prev - XP_PENALTY_WRONG));
          playSound("wrong");
        }
      }
    } else {
      // used → unselect it and free the slot it filled
      const newSlots = slots.map((s) =>
        s.fromChoice === choiceIndex ? { ...s, char: "", fromChoice: null } : s
      );
      const newChoices = letterChoices.map((c, idx) =>
        idx === choiceIndex ? { ...c, used: false } : c
      );
      setSlots(newSlots);
      setLetterChoices(newChoices);
    }
  };

  const handleResetWord = () => {
    if (!currentWord) return;
    // just clear player choices for current word using current progress difficulty
    setFeedback("");
    setEmotion("idle");

    const totalWord = currentWord;
    let maskPercent;
    if (!completedEasy) {
      maskPercent = 0.75;
    } else if (!completedNormal) {
      maskPercent = 0.5;
    } else if (xp < 200) {
      maskPercent = 0.25;
    } else {
      maskPercent = 0.1;
    }

    const maskedArray = maskWord(totalWord, maskPercent);
    const slotObjects = maskedArray.map((ch, idx) =>
      ch === "_"
        ? { char: "", fixed: false, fromChoice: null }
        : { char: totalWord[idx], fixed: true, fromChoice: null }
    );
    const letters = buildLetterChoices(totalWord, maskedArray);
    const choiceObjects = letters.map((letter, idx) => ({
      letter,
      used: false,
      id: idx
    }));

    setSlots(slotObjects);
    setLetterChoices(choiceObjects);
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((xp / 120) * 100))
  );

  const stageLabel =
    stage === "esquire" ? "esquire" : stage === "knight" ? "knight" : "king";

  const spriteSrc =
    (spriteMap[stage] && spriteMap[stage][emotion]) ||
    (spriteMap[stage] && spriteMap[stage].idle);

  return (
    <div className="ks-root">
      <div className="ks-card">
        <header className="ks-header">
          <div>
            <h1 className="ks-title">Kingdom Spellers</h1>
            <p className="ks-subtitle">
              click the stone letters to spell the hidden word difficulty grows as you do
            </p>
          </div>
          <div className="ks-xp-panel">
            <div className="ks-xp-label">
              xp: <span>{xp}</span>
            </div>
            <div className="ks-xp-bar">
              <div
                className="ks-xp-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="ks-stage-label">
              level: <strong>{stageLabel}</strong>
            </div>
          </div>
        </header>

        <main className="ks-main">
          {/* LEFT: GAME */}
          <section className="ks-game-area">
            <div className="ks-definition">
              <h2>clue:</h2>
              <p>{definition}</p>
            </div>

            <motion.div
              className="ks-masked-word"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentWord}
            >
              {slots.map((s, i) => (
                <span
                  key={i}
                  className={`ks-letter-slot ${
                    !s.fixed && !s.char ? "ks-letter-blank" : ""
                  }`}
                >
                  {s.char}
                </span>
              ))}
            </motion.div>

            <div className="ks-letter-grid">
              {letterChoices.map((choice, idx) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`ks-letter-tile ${
                    choice.used ? "ks-letter-used" : ""
                  }`}
                  onClick={() => handleLetterClick(idx)}
                >
                  {choice.letter}
                </button>
              ))}
            </div>

            <div className="ks-buttons-row">
              <button
                type="button"
                className="ks-btn ks-btn-secondary"
                onClick={handleResetWord}
              >
                reset word
              </button>
              <button
                type="button"
                className="ks-btn ks-btn-primary"
                onClick={startNewRound}
              >
                new word
              </button>
            </div>

            {feedback && <p className="ks-feedback">{feedback}</p>}
          </section>

          {/* RIGHT: CHARACTER */}
          <aside className="ks-character-area">
            <motion.img
              key={`${stage}-${emotion}`}
              src={spriteSrc}
              alt={`${stageLabel} ${emotion}`}
              className="ks-character-img"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            />
            <div className="ks-character-caption">
              <p>{stageLabel} of the spelling kingdom</p>
              <p className="ks-character-hint">
                spell words to earn xp and help him grow from esquire to king
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
