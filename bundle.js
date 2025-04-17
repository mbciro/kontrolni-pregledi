const { jsPDF } = window.jspdf;
document.getElementById('datetime').innerText = "Datum in ura: " + new Date().toLocaleString();
let entries = [];

function addEntry() {
  const fileInput = document.getElementById('imageInput');
  const comment = document.getElementById('comment').value.trim();
  const file = fileInput.files[0];
  const status = document.getElementById('statusMessage');
  status.textContent = "";

  if (!file || !comment) {
    alert('Dodaj sliko in komentar');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const image = new Image();
    image.onload = function() {
      entries.push({ image: e.target.result, comment: comment });
      updateEntryList();
      fileInput.value = '';
      document.getElementById('comment').value = '';
    };
    image.onerror = function() {
      alert('Slike ni bilo mogoče naložiti.');
    };
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateEntryList() {
  const container = document.getElementById('entries');
  container.innerHTML = '';
  entries.forEach((entry, index) => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `<img src="${entry.image}" /><p><strong>Komentar:</strong> ${entry.comment}</p>`;
    container.appendChild(div);
  });
}

function finishReport() {
  const company = document.getElementById('companyName').value.trim();
  const author = document.getElementById('authorName').value.trim();
  const date = new Date().toLocaleString();
  const status = document.getElementById('statusMessage');
  status.textContent = "";

  if (!company || !author || entries.length === 0) {
    alert('Vnesi vse podatke in vsaj eno sliko s komentarjem.');
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(company, 10, 20);
  doc.setFontSize(12);
  doc.text("Datum in ura: " + date, 10, 30);
  let y = 40;

  const processEntries = (i = 0) => {
    if (i >= entries.length) {
      doc.text("Pripravil: " + author, 10, y + 10);
      doc.save("porocilo.pdf");
      status.textContent = "PDF poročilo je bilo ustvarjeno.";
      return;
    }

    const entry = entries[i];
    const img = new Image();
    img.onload = () => {
      const width = 180;
      const ratio = img.height / img.width;
      const height = 80;

      if (y + height > 270) {
        doc.addPage();
        y = 20;
      }

      doc.addImage(img, 'JPEG', 15, y, width, height);
      y += height + 10;

      doc.setFont(undefined, 'bold');
      doc.text("Komentar:", 10, y);
      doc.setFont(undefined, 'normal');
      doc.text(entry.comment, 40, y);
      y += 20;

      processEntries(i + 1);
    };
    img.onerror = () => {
      alert("Napaka pri nalaganju slike.");
    };
    img.src = entry.image;
  };

  processEntries();
}