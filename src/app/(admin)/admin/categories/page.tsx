import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import CategoriesContent from "./content";

export default async function CategoriesPage() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "super_admin") redirect("/admin");

  return <CategoriesContent />;
}
