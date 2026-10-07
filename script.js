// ---------- English Correction Tool ----------
// Simple, rule-based grammar and formatting fixes.
// Works fully offline in the browser — no API key needed.

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const changesList = document.getElementById("changesList");
const status = document.getElementById("status");
const rajEmail = document.getElementById("rajEmail");

document.getElementById("correctBtn").addEventListener("click", correctText);
document.getElementById("clearBtn").addEventListener("click", clearAll);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("emailBtn").addEventListener("click", sendToRaj);

// Load a sample into the input box when a sample button is clicked
document.querySelectorAll(".sample-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    inputText.value = btn.getAttribute("data-text");
    outputText.value = "";
    changesList.innerHTML = "";
    showStatus('Sample loaded. Now click "Correct Text".', false);
    inputText.focus();
  });
});

// Common misspellings and casual words -> correct form
const WORD_FIXES = {
  "teh": "the",
  "recieve": "receive",
  "recieved": "received",
  "seperate": "separate",
  "definately": "definitely",
  "occured": "occurred",
  "untill": "until",
  "wich": "which",
  "becuase": "because",
  "alot": "a lot",
  "thier": "their",
  "youre": "you're",
  "cant": "can't",
  "dont": "don't",
  "doesnt": "doesn't",
  "wont": "won't",
  "isnt": "isn't",
  "wasnt": "wasn't",
  "wouldnt": "wouldn't",
  "couldnt": "couldn't",
  "shouldnt": "shouldn't",
  "im": "I'm",
  "ive": "I've",
  "ill": "I'll",
  "pls": "please",
  "plz": "please",
  "thx": "thanks",
  "u": "you",
  "ur": "your",
  "r": "are",
  "n": "and",
  "gonna": "going to",
  "wanna": "want to",
  "kinda": "kind of",
  "gud": "good",
  "nite": "night",
  "tmrw": "tomorrow",
  "msg": "message",
};

function correctText() {
  const raw = inputText.value;
  if (!raw.trim()) {
    showStatus("Please paste some text first.", true);
    return;
  }

  const changes = [];
  let text = raw;

  // 1. Normalize spacing: collapse multiple spaces into one
  if (/ {2,}/.test(text)) {
    text = text.replace(/ {2,}/g, " ");
    changes.push("Removed extra spaces between words.");
  }

  // 2. Remove spaces before punctuation ( word , -> word, )
  if (/\s+([.,!?;:])/.test(text)) {
    text = text.replace(/\s+([.,!?;:])/g, "$1");
    changes.push("Removed spaces before punctuation.");
  }

  // 3. Ensure a single space after punctuation (word.Next -> word. Next)
  if (/([.,!?;:])([A-Za-z])/.test(text)) {
    text = text.replace(/([.,!?;:])([A-Za-z])/g, "$1 $2");
    changes.push("Added a space after punctuation.");
  }

  // 4. Fix common misspellings and casual words (case-insensitive, whole words)
  const wordChanges = new Set();
  text = text.replace(/\b([A-Za-z']+)\b/g, (match) => {
    const lower = match.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(WORD_FIXES, lower)) {
      wordChanges.add(`"${match}" → "${WORD_FIXES[lower]}"`);
      return matchCase(match, WORD_FIXES[lower]);
    }
    return match;
  });
  wordChanges.forEach((c) => changes.push("Fixed word: " + c));

  // 5. Capitalize "i" used as a pronoun
  const beforeI = text;
  text = text.replace(/\bi\b/g, "I");
  if (text !== beforeI) changes.push('Capitalized the pronoun "I".');

  // 6. Capitalize the first letter of each sentence
  const beforeCap = text;
  text = capitalizeSentences(text);
  if (text !== beforeCap) changes.push("Capitalized the start of sentences.");

  // 7. Add a full stop at the end if there is no ending punctuation
  const trimmed = text.trim();
  if (trimmed && !/[.!?]$/.test(trimmed)) {
    text = trimmed + ".";
    changes.push("Added a full stop at the end.");
  } else {
    text = trimmed;
  }

  outputText.value = text;
  renderChanges(changes);
  showStatus("Done! Review the corrected text below.", false);
}

// Keep original capitalization style when replacing a word
function matchCase(original, replacement) {
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// Capitalize the first letter after sentence-ending punctuation and at the start
function capitalizeSentences(text) {
  return text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, pre, letter) => {
    return pre + letter.toUpperCase();
  });
}

function renderChanges(changes) {
  changesList.innerHTML = "";
  if (changes.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No changes needed — your text already looks good!";
    changesList.appendChild(li);
    return;
  }
  changes.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = c;
    changesList.appendChild(li);
  });
}

function clearAll() {
  inputText.value = "";
  outputText.value = "";
  changesList.innerHTML = "";
  showStatus("", false);
  inputText.focus();
}

function copyOutput() {
  if (!outputText.value.trim()) {
    showStatus("Nothing to copy yet. Correct some text first.", true);
    return;
  }
  navigator.clipboard
    .writeText(outputText.value)
    .then(() => showStatus("Copied to clipboard!", false))
    .catch(() => {
      // Fallback for older browsers
      outputText.select();
      document.execCommand("copy");
      showStatus("Copied to clipboard!", false);
    });
}

function sendToRaj() {
  const body = outputText.value.trim();
  if (!body) {
    showStatus("Correct some text before sending.", true);
    return;
  }
  const email = rajEmail.value.trim();
  if (!email) {
    showStatus("Please enter Mr. Raj's email address.", true);
    return;
  }
  const subject = encodeURIComponent("Corrected text");
  const mailtoBody = encodeURIComponent(body);
  window.location.href = `mailto:${email}?subject=${subject}&body=${mailtoBody}`;
  showStatus("Opening your email app...", false);
}

function showStatus(message, isError) {
  status.textContent = message;
  status.style.color = isError ? "#dc2626" : "#16a34a";
}
