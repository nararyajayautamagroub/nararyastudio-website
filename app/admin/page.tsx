import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const modules = [
  "Products",
  "Orders",
  "Customers",
  "Requests",
  "Quotations",
  "Projects",
  "Portfolio",
  "Payments",
  "Coupons",
  "Bundles",
  "Reviews",
  "Tickets",
  "Finance",
  "Files",
  "Staff",
  "Audit Logs",
  "Settings"
] as const;

export default async function Admin() {
  const user = await getSessionUser();

  if (!user?.role) {
    redirect("/login?next=/admin");
  }

  return (
    <main className="page">
      <div className="eyebrow">MANAGEMENT</div>
      <h1>Admin Dashboard</h1>
      <p>
        Staff: <b>{user.name}</b> · Role: <b>{user.role}</b>
      </p>

      <div className="grid mt-8">
        {modules.map((module) => (
          <section className="card p-6" key={module}>
            <h2>{module}</h2>
            <p className="text-neutral-500 mt-2">
              Modul {module} tersambung ke fondasi aplikasi dan dapat
              dikembangkan lewat API/RBAC.
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
