import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { Toolbar } from "../components/Toolbar";
import { Editor } from "../components/Editor";

export function DocumentPage() {
  const { documentId } = useParams();
  const socket = useSocket();
  const [doc, setDoc] = useState({ title: "", content: "", version: 1 });
  const [presence, setPresence] = useState(1);

  useEffect(() => {
    async function loadDoc() {
      const { data } = await api.get(`/documents/${documentId}`);
      setDoc(data);
    }

    loadDoc();
  }, [documentId]);

  useEffect(() => {
    if (!socket) return undefined;
    const onPresence = ({ type }) => setPresence((value) => (type === "join" ? value + 1 : Math.max(1, value - 1)));

    socket.on("presence:update", onPresence);
    return () => socket.off("presence:update", onPresence);
  }, [socket]);

  const handleRemoteUpdate = useCallback((content, version) => {
    setDoc((previous) => ({ ...previous, content, version }));
  }, []);

  const handleConflict = useCallback((content, version) => {
    setDoc((previous) => ({ ...previous, content, version }));
  }, []);

  return (
    <main className="document-page">
      <Toolbar
        title={doc.title}
        onTitleChange={(title) => setDoc((previous) => ({ ...previous, title }))}
        presenceCount={presence}
      />
      <Editor
        value={doc.content}
        onChange={(content) => setDoc((previous) => ({ ...previous, content }))}
        socket={socket}
        documentId={documentId}
        version={doc.version}
        onRemoteUpdate={handleRemoteUpdate}
        onConflict={handleConflict}
      />
    </main>
  );
}
