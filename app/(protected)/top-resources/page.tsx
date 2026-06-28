import ResourceCard from "@/components/ResourceCard";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { getTopResources } from "@/services/top";
import { redirect } from "next/navigation";

export default async function PersonalizedPage() {

    const userId = await getUserFromToken();

    if(!userId){
        redirect("/login");
    }

    const resources = await getTopResources(userId);

    return (
        <>

            <h2
                style={{
                    marginBottom: "1rem"
                }}
            >
                Top Resources For You
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