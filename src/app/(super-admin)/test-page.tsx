import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TestPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") redirect("/login");
  
  return <div>Test: {auth.name}</div>;
}
