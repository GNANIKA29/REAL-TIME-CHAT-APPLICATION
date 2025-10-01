import React from "react";

export default function Message({ message, currentUser, onEdit, onDelete }){
  if (message.deleted) return <div className="message deleted">This message was deleted</div>;
  const isMine = message.userId === currentUser.id;
  let timeString = '-';
  if (message.timestamp) {
    const d = new Date(message.timestamp);
    timeString = isNaN(d.getTime()) ? '-' : d.toLocaleString();
  }
  return (
    <div className={"message-item " + (isMine? 'mine':'other')}>
      <div className="meta">
        <strong>{message.username}</strong>
        <span className="time">{timeString}</span>
      </div>
      <div className="text">{message.text}{message.edited && <em> (edited)</em>}</div>
      <div className="msg-actions">
        <button onClick={()=> onEdit(message.id)}>Edit</button>
        <button onClick={()=> onDelete(message.id)}>Delete</button>
      </div>
    </div>
  );
}
