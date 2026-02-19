export function Sidebar({ documents, onOpenDocument, onCreateDocument }) {
  return (
    <aside className="sidebar">
      <button onClick={onCreateDocument}>New document</button>
      {documents.map((doc) => (
        <button key={doc._id} onClick={() => onOpenDocument(doc._id)} className="doc-link">
          {doc.title}
        </button>
      ))}
    </aside>
  );
}
