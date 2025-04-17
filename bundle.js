const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun } = docx;

document.getElementById('datetime').innerText = "Datum in ura: " + new Date().toLocaleString();
let entries = [];

function addEntry() {
  const fileInput = document.getElementById('imageInput');
  const comment = document.getElementById('comment').value;
  const file = fileInput.files[0];
  if (!file || !comment) {
    alert('Dodaj sliko in komentar');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    entries.push({ image: e.target.result, comment: comment });
    updateEntryList();
    fileInput.value = '';
    document.getElementById('comment').value = '';
  };
  reader.readAsDataURL(file);
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
  const company = document.getElementById('companyName').value;
  const author = document.getElementById('authorName').value;
  const date = new Date().toLocaleString();
  const status = document.getElementById('statusMessage');
  status.textContent = "";

  if (!company || !author || entries.length === 0) {
    alert('Vnesi vse podatke in vsaj eno sliko s komentarjem.');
    return;
  }

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: company, heading: "Heading1" }),
        new Paragraph({ text: "Datum in ura: " + date }),
        ...entries.flatMap(e => [
          new Paragraph({ children: [new ImageRun({ data: dataURLtoBlob(e.image), transformation: { height: 226 } })], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new TextRun({ text: "Komentar:", bold: true }), new TextRun({ text: " " + e.comment })] }),
          new Paragraph({ text: "" })
        ]),
        new Paragraph({ text: "Pripravil: " + author })
      ]
    }]
  });

  Packer.toBlob(doc).then(blob => {
    const fileName = "porocilo_" + Date.now() + ".docx";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // iOS workaround: ročno dodajanje v DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    status.textContent = "Poročilo je bilo pripravljeno.";
  }).catch(err => {
    alert("Napaka pri pripravi poročila: " + err.message);
  });
}

function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(",");
  const byteString = atob(parts[1]);
  const mimeString = parts[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}