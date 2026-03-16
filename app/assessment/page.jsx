// app/assessment/page.jsx
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function Page() {
  redirect("/assessment/language");
}
