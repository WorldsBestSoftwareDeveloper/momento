import { MessageCircle, Send } from "lucide-react";
import type { ReplayConversationMessage } from "@/lib/replay/types";

export function MatchChatPreview({ messages = [] }: { messages?: ReplayConversationMessage[] }) {
  return (
    <aside className="chat-preview" aria-label="Match conversation preview">
      <div className="panel-title"><MessageCircle size={17} /><div><strong>Match chat</strong><span>Watching together</span></div></div>
      <div className="chat-lines">
        {messages.length > 0 ? messages.map((message) => <p key={message.id}><b>{message.author}</b> {message.body}</p>) : <p><b>Momento</b> Conversation will appear as the replay advances.</p>}
      </div>
      <div className="chat-composer"><span>Say something…</span><Send size={14} /></div>
    </aside>
  );
}
