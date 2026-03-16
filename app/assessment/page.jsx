// app/assessment/page.jsx
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default function Page() {
  // Redirect users to the real first step of the assessment
  redirect("/assessment/language");
}
