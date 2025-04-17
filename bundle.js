const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun } = docx;

document.getElementById('datetime').innerText = "Datum in ura: " + new Date().toLocaleString();

let entries = [];

function addEntry() {
  const fileInput = document.getElementById('imageInput');
  const comment = document.getElementById('comment').value;
  if (!fileInput.files[0] || !comment) return alert('Dodaj sliko in komentar');

  const reader = new FileReader();
  reader.onload = function(e) {
    entries.push({ image: e.target.result, comment: comment });
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

function clearSignature() {
  const canvas = document.getElementById('signaturePad');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function finishReport() {
  const company = document.getElementById('companyName').value;
  const author = document.getElementById('authorName').value;
  const date = new Date().toLocaleString();
  const canvas = document.getElementById('signaturePad');
  const signatureDataUrl = canvas.toDataURL();

  if (!company || !author || entries.length === 0) return alert('Manjkajo podatki.');

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: company, heading: "Heading1" }),
        new Paragraph({ text: "Datum in ura: " + date }),
        ...entries.flatMap(e => [
          new Paragraph({ children: [new ImageRun({ data: dataURLtoBlob(e.image), transformation: { height: 226 } })], alignment: AlignmentType.CENTER }),
          new Paragraph({
            children: [new TextRun({ text: "Komentar:", bold: true }), new TextRun({ text: " " + e.comment })]
          }),
          new Paragraph({ text: "" })
        ]),
        new Paragraph({ text: "Pripravil: " + author }),
        new Paragraph({
          children: [new ImageRun({ data: dataURLtoBlob(signatureDataUrl), transformation: { height: 100 } })]
        })
      ]
    }]
  });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "porocilo.docx";
    a.click();
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

// podpis s prstom
const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
let drawing = false;
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', () => drawing = true);
canvas.addEventListener('touchend', () => drawing = false);
canvas.addEventListener('touchcancel', () => drawing = false);
canvas.addEventListener('touchmove', drawTouch);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function drawTouch(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}