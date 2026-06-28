import ResourceCard from "@/components/ResourceCard";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { redirect } from "next/navigation";
import { getLatestResources } from "@/services/latest";

export default async function RecentResourcesPage() {

    const userId = await getUserFromToken();

    if(!userId){
        redirect("/login");
    }

    const resources = await getLatestResources(userId);

    return (
        <>

            <h2
                style={{
                    marginBottom: "1rem"
                }}
            >
                Latest Resources For You
            </h2>

            {resources.map((resource) => (

                <ResourceCard
                    key={resource._id}
                    resource={resource}
                />

            ))}

        </>
    );
}