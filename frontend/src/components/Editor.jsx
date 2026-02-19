import { useEffect, useState } from "react";

export function Editor({ value, onChange, socket, documentId, version, onRemoteUpdate, onConflict }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (!socket || !documentId) return undefined;

    const onPatch = ({ content, version: nextVersion }) => onRemoteUpdate(content, nextVersion);
    const onConflictEvent = ({ content, serverVersion }) => onConflict(content, serverVersion);

    socket.emit("document:join", { documentId });
    socket.on("document:patch", onPatch);
    socket.on("document:conflict", onConflictEvent);

    return () => {
      socket.off("document:patch", onPatch);
      socket.off("document:conflict", onConflictEvent);
    };
  }, [socket, documentId, onRemoteUpdate, onConflict]);

  const handleChange = (event) => {
    const next = event.target.value;
    setLocalValue(next);
    onChange(next);
    socket?.emit("document:edit", {
      documentId,
      patch: { type: "replace_all" },
      nextContent: next,
      baseVersion: version
    });
  };

  return <textarea className="editor" value={localValue} onChange={handleChange} placeholder="Start writing..." />;
}
