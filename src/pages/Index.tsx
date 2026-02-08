import AppSidebar from "@/components/AppSidebar";
import TripleBubbleChat from "@/components/TripleBubbleChat";

const Index = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar — Node status, settings */}
      <AppSidebar />

      {/* Main chat area — full screen */}
      <main className="flex-1 flex flex-col min-w-0">
        <TripleBubbleChat />
      </main>
    </div>
  );
};

export default Index;
