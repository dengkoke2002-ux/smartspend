import { useState } from "react";

export default function UploadCsv({ onImported }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/upload/csv", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setStatus(`Imported ${data.insertedCount} transactions.`);
      setFile(null);
      onImported(); // tell the dashboard to refresh
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleUpload} style={{ margin: "16px 0", display: "flex", gap: 8, alignItems: "center" }}>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={!file}>
        Import CSV
      </button>
      {status && <span>{status}</span>}
    </form>
  );
}
