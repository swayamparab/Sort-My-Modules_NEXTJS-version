import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { getDashboardData } from "@/services/dashboard";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
    const userId = await getUserFromToken();

    if (!userId) {
        redirect("/login");
    }

    const dashboard = await getDashboardData(userId);

    return <DashboardClient initialData={dashboard} />;
}