import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import RolePermission from "@/models/RolePermission";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params;
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const permission = await RolePermission.findOne({
      role,
    }).lean();

    if (!permission) {
      return Response.json({ error: "Role not found" }, { status: 404 });
    }

    return Response.json(permission);
  } catch (error) {
    console.error("Error fetching role permission:", error);
    return Response.json(
      { error: "Failed to fetch role permission" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params;
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const updated = await RolePermission.findOneAndUpdate(
      { role },
      { permissions: body.permissions, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return Response.json({ error: "Role not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating role permission:", error);
    return Response.json(
      { error: "Failed to update role permission" },
      { status: 500 }
    );
  }
}
