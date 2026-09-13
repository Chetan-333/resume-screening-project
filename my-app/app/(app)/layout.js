import Sidebar from "@/app/components/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
