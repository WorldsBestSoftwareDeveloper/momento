import { MessageCircle, Send } from "lucide-react";

export function MatchChatPreview() {
  return (
    <aside className="chat-preview" aria-label="Match conversation preview">
      <div className="panel-title"><MessageCircle size={17} /><div><strong>Match chat</strong><span>Watching together</span></div></div>
      <div className="chat-lines">
        <p><b>Amara</b> That finish changed everything.</p>
        <p><b>Nico</b> The reaction at 58′ is the one.</p>
      </div>
      <div className="chat-composer"><span>Say something…</span><Send size={14} /></div>
    </aside>
  );
}
