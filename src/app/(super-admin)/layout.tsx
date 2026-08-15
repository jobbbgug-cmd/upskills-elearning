import SuperAdminLayout from "@/app/super-admin/layout";

export default function RouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
