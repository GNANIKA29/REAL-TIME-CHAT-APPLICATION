import React from 'react';
const EMOJIS = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😍','😘','😜','🤩','🤔','🤨','😴','😎','🤗','🙌','👍','👏','🙏','🔥','✨','💯'];
export default function EmojiPicker({ onSelect }) {
  return (
    <div className='local-emoji-picker' style={{display:'grid',gridTemplateColumns:'repeat(8,28px)',gap:6,padding:8}}>
      {EMOJIS.map(e=> <button key={e} onClick={()=> onSelect({ native: e })} style={{fontSize:18,background:'transparent',border:'none',cursor:'pointer'}}>{e}</button>)}
    </div>
  );
}