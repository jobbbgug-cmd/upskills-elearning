import SuperAdminLayout from "@/app/(super-admin)/super-admin/layout";

export default function SuperAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
