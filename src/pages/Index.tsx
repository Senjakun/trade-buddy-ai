import { useState, useCallback } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import TripleBubbleChat, { ChatMessage } from "@/components/TripleBubbleChat";

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
}

const Index = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Analysis",
      messages: [],
      timestamp: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  const handleNewChat = useCallback(() => {
    createNewSession();
  }, [createNewSession]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setActiveSessionId((prevId) => (prevId === id ? null : prevId));
  }, []);

  const setActiveMessages = useCallback(
    (updater: React.SetStateAction<ChatMessage[]>) => {
      // If no active session, create one first
      if (!activeSessionId) {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: "New Analysis",
          messages: [],
          timestamp: new Date(),
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === newSession.id
              ? {
                  ...s,
                  messages:
                    typeof updater === "function"
                      ? updater(s.messages)
                      : updater,
                }
              : s
          )
        );
        return;
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages:
                  typeof updater === "function"
                    ? updater(s.messages)
                    : updater,
              }
            : s
        )
      );
    },
    [activeSessionId]
  );

  const handleFirstMessage = useCallback(
    (query: string) => {
      // Update session title based on first query
      const title = query.length > 40 ? query.slice(0, 40) + "…" : query;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, title } : s
        )
      );
    },
    [activeSessionId]
  );

  // Auto-create session when user types into empty state
  const ensureSession = useCallback(() => {
    if (!activeSessionId) {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: "New Analysis",
        messages: [],
        timestamp: new Date(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      return newSession.id;
    }
    return activeSessionId;
  }, [activeSessionId]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <ChatSidebar
        sessions={sessions.map((s) => ({
          id: s.id,
          title: s.title,
          timestamp: s.timestamp,
        }))}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <TripleBubbleChat
          messages={activeMessages}
          setMessages={setActiveMessages}
          onFirstMessage={handleFirstMessage}
        />
      </main>
    </div>
  );
};

export default Index;
