import { redirect } from "next/navigation";

// Dashboard route redirects to home page which contains the dashboard
export default function DashboardPage() {
  redirect("/");
}
