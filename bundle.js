document.getElementById('datetime').innerText = "Datum in ura: " + new Date().toLocaleString();

let entries = [];

function addEntry() {
  const fileInput = document.getElementById('imageInput');
  const comment = document.getElementById('comment').value;
  if (!fileInput.files[0] || !comment) return alert('Dodaj sliko in komentar');

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;
    entries.push({ image: imageData, comment: comment });
    updateEntryList();
    document.getElementById('imageInput').value = '';
    document.getElementById('comment').value = '';
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function updateEntryList() {
  const container = document.getElementById('entries');
  container.innerHTML = '';
  entries.forEach((entry, index) => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `<img src="${entry.image}" /><p>${entry.comment}</p>`;
    container.appendChild(div);
  });
}

function finishReport() {
  const customer = document.getElementById('customer').value;
  const datetime = new Date().toLocaleString();
  if (!customer || entries.length === 0) return alert('Manjkajo podatki.');

  let content = `Poročilo\nStranka: ${customer}\nDatum: ${datetime}\n\n`;
  entries.forEach((e, i) => {
    content += `Vnos ${i + 1}:\nKomentar: ${e.comment}\n\n`;
  });

  const blob = new Blob([content], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `porocilo_${Date.now()}.doc`;
  a.click();
}