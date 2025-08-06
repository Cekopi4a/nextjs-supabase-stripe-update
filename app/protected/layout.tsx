// app/protected/layout.tsx - Responsive Layout със Sidebar надясно
import Content from "@/components/content";
import ProtectedSidebar from "@/components/protected-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Content>
      <div className="flex w-full h-full">
        {/* Main Content - разширява се автоматично */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        
        {/* Sidebar надясно */}
        <div className="hidden lg:block">
          <ProtectedSidebar />
        </div>
      </div>
      
      {/* Mobile Sidebar (може да добавим по-късно overlay) */}
      <div className="lg:hidden">
        {/* Тук може да добавим mobile menu toggle */}
      </div>
    </Content>
  );
}