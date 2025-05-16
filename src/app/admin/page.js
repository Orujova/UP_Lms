import { redirect } from "next/navigation";

export default function Page() {
  redirect("/admin/dashboard");
  return (
    <main>
      <div></div>
    </main>
  );
}
