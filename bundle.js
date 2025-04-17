import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function App() {
  const [customerName, setCustomerName] = useState("");
  const [reportNumber] = useState(() => `POR-${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 12)}`);
  const [inspectionDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [currentComment, setCurrentComment] = useState("");
  const [currentImage, setCurrentImage] = useState(null);
  const [signature, setSignature] = useState("");

  const handleAddEntry = () => {
    if (currentImage && currentComment) {
      setEntries([...entries, { image: currentImage, comment: currentComment }]);
      setCurrentImage(null);
      setCurrentComment("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCurrentImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const exportToWord = () => {
    let doc = `Kontrolni pregled\n\n`;
    doc += `Stranka: ${customerName}\n`;
    doc += `Številka poročila: ${reportNumber}\n`;
    doc += `Datum in ura: ${inspectionDate.toLocaleString()}\n\n`;
    entries.forEach((entry, index) => {
      doc += `--- Vnos ${index + 1} ---\n`;
      doc += `Komentar: ${entry.comment}\n\n`;
    });
    doc += `Podpisal: ${signature}`;
    const blob = new Blob([doc], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportNumber}.doc`;
    a.click();
  };

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Kontrolni Pregled</h1>
      <input className="border p-2 w-full" placeholder="Ime stranke" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      <p>Številka poročila: {reportNumber}</p>
      <p>Datum in ura: {inspectionDate.toLocaleString()}</p>

      <div className="space-y-2">
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {currentImage && <img src={currentImage} alt="Predogled" className="max-h-48 object-contain" />}
        <textarea className="border p-2 w-full" placeholder="Komentar" value={currentComment} onChange={(e) => setCurrentComment(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddEntry} disabled={!currentImage || !currentComment}>Dodaj vnos</button>
      </div>

      <input className="border p-2 w-full" placeholder="Podpis" value={signature} onChange={(e) => setSignature(e.target.value)} />

      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={exportToWord} disabled={!customerName || !signature || entries.length === 0}>
        Zaključi poročilo
      </button>

      <div>
        <h2 className="font-semibold mt-4">Dodani vnosi</h2>
        {entries.map((entry, index) => (
          <div key={index} className="mt-2 border p-2 rounded">
            <img src={entry.image} alt="" className="max-h-32 object-contain" />
            <p>{entry.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
