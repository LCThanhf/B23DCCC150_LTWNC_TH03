export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section>
      <p className="badge">Khu vực thành viên</p>
      {children}
    </section>
  );
}
