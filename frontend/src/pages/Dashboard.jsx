import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { api } from "../services/api";

export function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  const loadDocs = async () => {
    const { data } = await api.get("/documents");
    setDocuments(data);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const createDocument = async () => {
    const { data } = await api.post("/documents", { title: "Untitled document" });
    navigate(`/documents/${data._id}`);
  };

  return (
    <main className="dashboard-page">
      <Sidebar documents={documents} onOpenDocument={(id) => navigate(`/documents/${id}`)} onCreateDocument={createDocument} />
      <section className="card">
        <h2>Welcome</h2>
        <p>Select a document from the sidebar.</p>
      </section>
    </main>
  );
}
