import ResourceCard from "@/components/ResourceCard";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { getSubjectResources } from "@/services/subject";
import { redirect } from "next/navigation";


export default async function SubjectPage(
    { params }: { params: Promise<{ subjectName: string }> }
) {
    const {subjectName} = await params;

    const userId = await getUserFromToken();

    if (!userId) {
        redirect("/login");
    }

    const resources = await getSubjectResources(userId, subjectName);

    return (
        <>

            <h1
                style={{
                    marginBottom: "2rem"
                }}
            >
                {decodeURIComponent(subjectName)} Resources
            </h1>

            {resources.length === 0 && (
                    <p>
                        No resources available
                    </p>
                )}

            {resources.map((resource) => (

                <ResourceCard
                    key={resource._id}
                    resource={resource}
                />

            ))}

        </>
    );
}