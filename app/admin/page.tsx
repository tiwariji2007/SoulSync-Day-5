
import { Suspense } from "react";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { user } from "@/src/db/auth-schema";
import { userRoles } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

async function AdminDashboard() {
  // Step 1: Check who is logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Step 2: Check the user's role
  const [userRole] = await db
    .select({
      role: userRoles.role,
    })
    .from(userRoles)
    .where(eq(userRoles.userId, session.user.id))
    .limit(1);

  // Step 3: Reject users without admin privileges
  if (userRole?.role !== "admin") {
    notFound();
  }

  // Step 4: Load registered users
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user);

  // Step 5: Display admin dashboard
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          SoulSync Admin Dashboard
        </h1>

        <p className="mb-8 text-slate-600">
          Manage and view registered users.
        </p>

        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Total Registered Users
          </h2>

          <p className="mt-2 text-4xl font-bold text-blue-600">
            {users.length}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-900">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">User ID</th>
              </tr>
            </thead>

            <tbody>
              {users.map((person) => (
                <tr
                  key={person.id}
                  className="border-t border-slate-200 text-slate-700"
                >
                  <td className="p-4">{person.name}</td>
                  <td className="p-4">{person.email}</td>
                  <td className="p-4">{person.id}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="p-6 text-slate-600">
              No registered users found.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen p-8">
          Loading admin dashboard...
        </main>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
