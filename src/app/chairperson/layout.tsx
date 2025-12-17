
export default function ChairpersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* This layout does not have a dashboard header, so the settings page will be standalone */}
      <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
    </div>
  );
}
