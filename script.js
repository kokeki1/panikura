// Global variables
let slangData = [];
let isEditMode = false;
let editingEntryIndex = -1;

// Initialize the page when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  loadSlangData();
  renderSlangList();
  setupEventListeners();
  updateEntryCount();
});

// Load slang data from JSON
function loadSlangData() {
  try {
    const dataTag = document.getElementById("slang-entries");
    slangData = JSON.parse(dataTag.textContent);
  } catch (e) {
    console.error("Failed to load slang entries:", e);
    slangData = [];
  }
}

// Render the slang list
function renderSlangList() {
  const slangList = document.getElementById("slang-list");
  slangList.innerHTML = "";

  // Sort alphabetically by term
  const sortedData = [...slangData].sort((a, b) => a.term.localeCompare(b.term, 'ja'));

  sortedData.forEach((entry, originalIndex) => {
    const dt = document.createElement("dt");
    dt.innerHTML = `${entry.term}`;

    const dd = document.createElement("dd");
    dd.innerHTML = `
      <p>${entry.definition}</p>
      <p><em>Example:</em> ${entry.example}</p>
    `;

    // Add edit actions if in edit mode
    if (isEditMode) {
      dt.style.cursor = "pointer";
      dt.addEventListener("click", () => editEntry(slangData.findIndex(e => e.term === entry.term)));

      const editActions = document.createElement("div");
      editActions.className = "edit-actions show";
      editActions.innerHTML = `
        <button class="btn btn-primary" onclick="editEntry(${slangData.findIndex(e => e.term === entry.term)})">Edit</button>
        <button class="btn btn-danger" onclick="deleteEntry(${slangData.findIndex(e => e.term === entry.term)})">Delete</button>
      `;
      dd.appendChild(editActions);
    }

    slangList.appendChild(dt);
    slangList.appendChild(dd);
  });

  updateEntryCount();
}

// Setup event listeners
function setupEventListeners() {
  // Edit links
  document.getElementById("editLink").addEventListener("click", (e) => {
    e.preventDefault();
    showSecretModal();
  });

  document.getElementById("sidebarEditLink").addEventListener("click", (e) => {
    e.preventDefault();
    showSecretModal();
  });

  // Secret code modal
  document.getElementById("secretCode").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkSecretCode();
    }
  });

  // Schizo mode button (preserve original functionality)
  setupSchizoMode();
}

// Show secret code modal
function showSecretModal() {
  document.getElementById("secretModal").style.display = "flex";
  document.getElementById("secretCode").focus();
}

// Close secret code modal
function closeSecretModal() {
  document.getElementById("secretModal").style.display = "none";
  document.getElementById("secretCode").value = "";
}

// Check if secret code is correct
function checkSecretCode() {
  const code = document.getElementById("secretCode").value;
  if (code === "panikula!") {
    closeSecretModal();
    enterEditMode();
  } else {
    alert("Incorrect secret code!");
    document.getElementById("secretCode").value = "";
  }
}

// Enter edit mode
function enterEditMode() {
  isEditMode = true;
  document.getElementById("editModePanel").style.display = "block";
  document.getElementById("editLink").textContent = "Exit Edit";
  document.getElementById("editLink").onclick = exitEditMode;
  document.getElementById("sidebarEditLink").textContent = "Exit edit mode";
  document.getElementById("sidebarEditLink").onclick = exitEditMode;
  renderSlangList();
}

// Exit edit mode
function exitEditMode() {
  isEditMode = false;
  document.getElementById("editModePanel").style.display = "none";
  document.getElementById("editLink").textContent = "Edit";
  document.getElementById("editLink").onclick = () => showSecretModal();
  document.getElementById("sidebarEditLink").textContent = "Edit this page";
  document.getElementById("sidebarEditLink").onclick = () => showSecretModal();
  clearNewEntryForm();
  renderSlangList();
}

// Add new entry
function addNewEntry() {
  const term = document.getElementById("newTerm").value.trim();
  const definition = document.getElementById("newDefinition").value.trim();
  const example = document.getElementById("newExample").value.trim();

  if (!term || !definition || !example) {
    alert("Please fill in all fields!");
    return;
  }

  // Check if term already exists
  if (slangData.find(entry => entry.term.toLowerCase() === term.toLowerCase())) {
    alert("This term already exists! Please edit the existing entry or use a different term.");
    return;
  }

  slangData.push({
    term: term,
    definition: definition,
    example: example
  });

  clearNewEntryForm();
  renderSlangList();
  saveData();
}

// Edit existing entry
function editEntry(index) {
  if (index < 0 || index >= slangData.length) return;

  editingEntryIndex = index;
  const entry = slangData[index];

  document.getElementById("newTerm").value = entry.term;
  document.getElementById("newDefinition").value = entry.definition;
  document.getElementById("newExample").value = entry.example;

  // Change button text and function
  const addBtn = document.querySelector(".edit-form .btn-primary");
  addBtn.textContent = "Update Entry";
  addBtn.onclick = updateEntry;
}

// Update existing entry
function updateEntry() {
  if (editingEntryIndex < 0) return;

  const term = document.getElementById("newTerm").value.trim();
  const definition = document.getElementById("newDefinition").value.trim();
  const example = document.getElementById("newExample").value.trim();

  if (!term || !definition || !example) {
    alert("Please fill in all fields!");
    return;
  }

  slangData[editingEntryIndex] = {
    term: term,
    definition: definition,
    example: example
  };

  clearNewEntryForm();
  resetAddButton();
  renderSlangList();
  saveData();
}

// Delete entry
function deleteEntry(index) {
  if (index < 0 || index >= slangData.length) return;

  if (confirm(`Are you sure you want to delete "${slangData[index].term}"?`)) {
    slangData.splice(index, 1);
    renderSlangList();
    saveData();
  }
}

// Clear new entry form
function clearNewEntryForm() {
  document.getElementById("newTerm").value = "";
  document.getElementById("newDefinition").value = "";
  document.getElementById("newExample").value = "";
  editingEntryIndex = -1;
  resetAddButton();
}

// Reset add button
function resetAddButton() {
  const addBtn = document.querySelector(".edit-form .btn-primary");
  addBtn.textContent = "Add Entry";
  addBtn.onclick = addNewEntry;
}

// Update entry count in sidebar
function updateEntryCount() {
  document.getElementById("entryCount").textContent = slangData.length;
}

// Save data to localStorage (since we can't write to files on GitHub Pages)
function saveData() {
  try {
    localStorage.setItem('panikura-wiki-data', JSON.stringify(slangData));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

// Load data from localStorage on page load
function loadSavedData() {
  try {
    const saved = localStorage.getItem('panikura-wiki-data');
    if (saved) {
      const parsedData = JSON.parse(saved);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        slangData = parsedData;
        return true;
      }
    }
  } catch (e) {
    console.warn("Could not load from localStorage:", e);
  }
  return false;
}

// Initialize with saved data if available
document.addEventListener("DOMContentLoaded", () => {
  if (!loadSavedData()) {
    loadSlangData(); // Fall back to default data
  }
  renderSlangList();
  setupEventListeners();
  updateEntryCount();
});

// Schizo mode functionality (preserved from original)
function setupSchizoMode() {
  const paranoiaPhrases = [
    "THE FEDS ARE AFTER YOU",
    "THEY ARE LISTENING",
    "THEY WANT YOU TO THINK YOU'RE CRAZY",
    "WAKE UP",
    "YOU ARE NOT SAFE",
    "TRUST NO ONE",
    "MONARCH PROTOCOL ACTIVE",
    "5G MIND CONTROL",
    "IS THIS REALITY?",
    "THEY'RE IN THE WALLS",
    "WAKE UP, AGENT",
    "JUSTO IS A LIE",
    "PORTAL OPENS TONIGHT",
    "YOU WILL NEVER REACH N1",
    "ABE IS ALIVE"
  ];

  let flickerInterval;
  let paranoiaInterval;

  document.getElementById("schizoBtn").addEventListener("click", () => {
    document.body.classList.add("schizo-mode");

    // Flickering and text-changing effects
    flickerInterval = setInterval(() => {
      const allElements = document.querySelectorAll("p, h1, h2, dt, dd, li");
      const randomText = ["パンイクラ", "？？？", "YES!!", "JUSTo", "SO-GOOD", "フニャ", "420", "GIGA", "???"];
      allElements.forEach(el => {
        if (Math.random() < 0.1) {
          el.textContent = randomText[Math.floor(Math.random() * randomText.length)];
        }
        if (Math.random() < 0.05) {
          el.style.position = "absolute";
          el.style.left = Math.random() * window.innerWidth + "px";
          el.style.top = Math.random() * window.innerHeight + "px";
          el.classList.add("schizo");
        }
      });
    }, 500);

    paranoiaInterval = setInterval(() => {
      const msg = document.createElement("div");
      msg.className = "floating-paranoia";
      msg.textContent = paranoiaPhrases[Math.floor(Math.random() * paranoiaPhrases.length)];
      msg.style.left = Math.random() * window.innerWidth + "px";
      msg.style.top = Math.random() * window.innerHeight + "px";
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 5000);
    }, 800);

    // Seizure notice after 10 seconds
    setTimeout(() => {
      const seizureNotice = document.createElement("div");
      seizureNotice.classList.add("seizure-notice");
      seizureNotice.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Seal_of_the_Central_Intelligence_Agency_%28B%26W%29.svg" alt="CIA Seal" style="max-width: 150px; max-height: 150px;">
        </div>
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">THIS DOMAIN HAS BEEN SEIZED</h1>
        <p class="glitchable">by the Central Intelligence Agency</p>
        <p class="glitchable">in cooperation with the National Security Agency and the Department of Justice</p>
        <br />
        <p class="glitchable">This site has been seized as part of a federal investigation into unauthorized activities in violation of:</p>
        <p class="glitchable"><strong>Title 18 U.S.C. § 1030 (Computer Fraud and Abuse Act)</strong></p>
        <p class="glitchable"><strong>Title 50 U.S.C. § 1801 et seq. (Foreign Intelligence Surveillance Act)</strong></p>
        <p class="glitchable"><strong>Title 18 U.S.C. § 371 (Conspiracy to Defraud the United States)</strong></p>
        <br />
        <p class="glitchable">Your digital fingerprint, IP address, and access logs have been recorded.</p>
        <p class="glitchable">This activity is now part of an open federal case file.</p>
        <p class="glitchable">You are being actively monitored.</p>
        <br />
        <p style="color:#ff5555" class="glitchable"><strong>ANY FURTHER ACTION MAY RESULT IN LEGAL CONSEQUENCES.</strong></p>
        <br />
        <p class="glitchable">Case Number: 19-482-AQ-NSA</p>
        <p class="glitchable">Tracking Session ID: <span id="session-id">${crypto.randomUUID()}</span></p>
        <br />
        <p style="color: grey; font-size: 0.8rem;">This message is fictitious and part of a satirical project.</p>
      `;
      document.body.appendChild(seizureNotice);
      seizureNotice.style.display = 'block';

      clearInterval(flickerInterval);
      clearInterval(paranoiaInterval);
      document.body.classList.remove("schizo-mode");

      const jpGlitchMap = {
        "by the Central Intelligence Agency": "中央情報局（CIA）によって",
        "in cooperation with the National Security Agency and the Department of Justice": "国家安全保障局および司法省との協力のもと",
        "This site has been seized as part of a federal investigation into unauthorized activities in violation of:": "このサイトは、以下の違反行為に関する連邦捜査の一環として押収されました：",
        "Title 18 U.S.C. § 1030 (Computer Fraud and Abuse Act)": "合衆国法典 第18編 §1030（コンピュータ詐欺および不正行為法）",
        "Title 50 U.S.C. § 1801 et seq. (Foreign Intelligence Surveillance Act)": "合衆国法典 第50編 §1801以降（外国情報監視法）",
        "Title 18 U.S.C. § 371 (Conspiracy to Defraud the United States)": "合衆国法典 第18編 §371（米国政府に対する共謀）",
        "Your digital fingerprint, IP address, and access logs have been recorded.": "あなたのデジタル指紋、IPアドレス、アクセスログは記録されました。",
        "This activity is now part of an open federal case file.": "この活動は現在、連邦捜査ファイルの一部となっています。",
        "You are being actively monitored.": "あなたは現在、監視されています。",
        "ANY FURTHER ACTION MAY RESULT IN LEGAL CONSEQUENCES.": "これ以上の行動は法的な結果を招く可能性があります。",
        "Case Number: 19-482-AQ-NSA": "事件番号: 19-482-AQ-NSA",
        "Tracking Session ID:": "追跡セッションID:"
      };

      const glitchElements = document.querySelectorAll(".seizure-notice .glitchable");

      // Start glitch loop after 4-second delay
      setTimeout(() => {
        const glitchLoop = setInterval(() => {
          const el = glitchElements[Math.floor(Math.random() * glitchElements.length)];
          if (!el) return;

          const original = el.textContent;
          const translated = jpGlitchMap[original] || original;

          el.textContent = translated;

          setTimeout(() => {
            el.textContent = original;
          }, 1000 + Math.random() * 2000);
        }, 500);
      }, 15000);
    }, 10000);
  });
}
