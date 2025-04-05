document.addEventListener("DOMContentLoaded", () => {
  const dataTag = document.getElementById("slang-entries");
  const slangList = document.getElementById("slang-list");

  try {
    const entries = JSON.parse(dataTag.textContent);

    // Sort alphabetically by term
    entries.sort((a, b) => a.term.localeCompare(b.term));

    // Add each entry to the page
    for (const entry of entries) {
      const dt = document.createElement("dt");
      dt.innerHTML = `<strong>${entry.term}</strong>`;

      const dd = document.createElement("dd");
      dd.innerHTML = `
        ${entry.definition}<br>
        <em>Example: "${entry.example}"</em>
      `;

      slangList.appendChild(dt);
      slangList.appendChild(dd);
    }
  } catch (e) {
    console.error("Failed to load slang entries:", e);
  }
});
