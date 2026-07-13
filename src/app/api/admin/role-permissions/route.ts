import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import RolePermission from "@/models/RolePermission";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const permissions = await RolePermission.find().lean();
    return Response.json({ permissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return Response.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "super_admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const defaultPermissions = {
      super_admin: {
        overview: true,
        finance: {
          revenue: true,
          analytics: true,
          commission_payout: true,
          payment_verification: true,
          finance_info: true,
        },
        institution: {
          all_institutions: true,
          trial_requests: true,
        },
        members: {
          approve_members: true,
          manage_users: true,
        },
        platform_features: {
          live_sessions: true,
          course_reviews: true,
          forum: true,
        },
        commerce: {
          manage_orders: true,
          manage_products: true,
          coupons_promotions: true,
        },
        content: {
          manage_courses: true,
          course_content: true,
          student_schedule: true,
          teacher_schedule: true,
          certificates: true,
          categories: true,
        },
        system: {
          manage_banners: true,
          manage_roles: true,
          activity_logs: true,
          general_settings: true,
        },
      },
      owner: {
        overview: true,
        teaching: {
          manage_students: true,
          homework: true,
          quizzes: true,
          live_class: true,
          teacher_portal: true,
          forum: true,
        },
        courses: {
          manage_courses: true,
          course_content: true,
          student_schedule: true,
          teacher_schedule: true,
          certificates: true,
        },
        members: {
          approve_members: true,
          manage_users: true,
        },
        commerce: {
          manage_orders: true,
          manage_products: true,
          coupons_promotions: true,
        },
        finance: {
          analytics: true,
          revenue: true,
          billing_invoice: true,
        },
        marketing: {
          landing_page: true,
          course_reviews: true,
          notifications: true,
          manage_banners: true,
        },
        system: {
          manage_branding: true,
        },
      },
      admin: {
        overview: true,
        teaching: {
          manage_students: true,
          homework: true,
          quizzes: true,
          live_class: true,
          teacher_portal: true,
          forum: true,
        },
        courses: {
          manage_courses: true,
          course_content: true,
          student_schedule: true,
          teacher_schedule: true,
          certificates: true,
        },
        members: {
          approve_members: true,
          manage_users: true,
        },
        commerce: {
          manage_orders: true,
          manage_products: true,
          coupons_promotions: true,
        },
        finance: {
          analytics: true,
          revenue: true,
          billing_invoice: true,
        },
        marketing: {
          landing_page: true,
          course_reviews: true,
          notifications: true,
          manage_banners: true,
        },
        system: {
          manage_branding: true,
        },
      },
      teacher: {
        teaching: {
          manage_students: true,
          homework: true,
          quizzes: true,
          live_class: true,
          teacher_portal: true,
          forum: true,
        },
        courses: {
          manage_courses: true,
          course_content: true,
          student_schedule: true,
          teacher_schedule: true,
          certificates: true,
        },
        finance: {
          analytics: true,
          revenue: true,
          billing_invoice: true,
        },
      },
      parent: {
        learning_center: {
          homework: true,
          attendance: true,
          quizzes: true,
          live_class: true,
        },
        student_schedule: true,
        certificates: true,
        invoice: true,
        forum: true,
        reviews: true,
      },
      student: {
        learning_center: {
          homework: true,
          attendance: true,
          quizzes: true,
          live_class: true,
        },
        student_schedule: true,
        certificates: true,
        invoice: true,
        forum: true,
        reviews: true,
      },
    };

    // Delete existing permissions
    await RolePermission.deleteMany({});

    // Create new permissions
    for (const [role, perms] of Object.entries(defaultPermissions)) {
      await RolePermission.create({
        role,
        permissions: perms,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error initializing permissions:", error);
    return Response.json(
      { error: "Failed to initialize permissions" },
      { status: 500 }
    );
  }
}
