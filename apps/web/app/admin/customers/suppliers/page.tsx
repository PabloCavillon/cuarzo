import { redirect } from "next/navigation";

// Suppliers are now managed under /admin/providers.
// Permanent redirect to keep old bookmarks working.
export default function SuppliersPage() {
  redirect("/admin/providers");
}
