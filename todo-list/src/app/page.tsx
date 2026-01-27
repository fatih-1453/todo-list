import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BentoGrid, BentoGridItem } from "@/components/layout/BentoGrid";

import { TodoWidget } from "@/components/widgets/TodoWidget";
import { ReminderWidget } from "@/components/widgets/ReminderWidget";
import { TeamCollabWidget } from "@/components/widgets/TeamCollabWidget";
import { ReportWidget } from "@/components/widgets/ReportWidget";
import { AIChatWidget } from "@/components/widgets/AIChatWidget";
import { PerformanceWidget } from "@/components/widgets/PerformanceWidget";

export default function Home() {
  return (
    <main className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-x-hidden md:overflow-hidden selection:bg-yellow-200 selection:text-black">
      {/* Sidebar - Fixed on Desktop, hidden/overlay on Mobile */}
      <Sidebar className="flex-shrink-0 z-50" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        <TopNav />

        {/* Scrollable Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 pt-2 scrollbar-none pb-24 md:pb-10">
          <BentoGrid className="max-w-full pb-10">

            {/* 1. To-Do List (Double Height) */}
            <BentoGridItem
              className="col-span-1 md:col-span-1 md:row-span-2 p-0 bg-transparent shadow-none border-none hover:shadow-none bg-white md:bg-transparent"
            >
              <div className="h-full w-full">
                <TodoWidget />
              </div>
            </BentoGridItem>

            {/* 2. Reminder */}
            <BentoGridItem
              className="col-span-1 md:col-span-1 md:row-span-1 p-0 bg-transparent shadow-none border-none hover:shadow-none"
            >
              <ReminderWidget />
            </BentoGridItem>

            {/* 3. Team Collaboration (Wide) */}
            <BentoGridItem
              className="col-span-1 md:col-span-2 md:row-span-1 p-0 bg-transparent shadow-none border-none hover:shadow-none"
            >
              <TeamCollabWidget />
            </BentoGridItem>

            {/* 4. Detailed Report */}
            <BentoGridItem
              className="col-span-1 md:col-span-1 md:row-span-1 p-0 bg-transparent shadow-none border-none hover:shadow-none"
            >
              <ReportWidget />
            </BentoGridItem>

            {/* 5. AI Chat (Wide) */}
            <BentoGridItem
              className="col-span-1 md:col-span-2 md:row-span-1 p-0 bg-transparent shadow-none border-none hover:shadow-none"
            >
              <AIChatWidget />
            </BentoGridItem>

            {/* 6. Performance */}
            <BentoGridItem
              className="col-span-1 md:col-span-1 md:row-span-1 p-0 bg-transparent shadow-none border-none hover:shadow-none"
            >
              <PerformanceWidget />
            </BentoGridItem>
          </BentoGrid>
        </div>
      </div>
    </main>
  );
}
