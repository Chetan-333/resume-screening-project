import { redirect } from "next/navigation";

// Login is the entry point of the app.
export default function RootPage() {
  redirect("/login");
}
