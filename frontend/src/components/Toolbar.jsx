export function Toolbar({ title, onTitleChange, presenceCount }) {
  return (
    <div className="toolbar">
      <input value={title} onChange={(event) => onTitleChange(event.target.value)} className="title-input" />
      <span>{presenceCount} active collaborator(s)</span>
    </div>
  );
}
