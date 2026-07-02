import ResourceCard from "@/components/ResourceCard";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { redirect } from "next/navigation";
import { getBookmarkedResources } from "@/services/bookmarks";

export default async function BookmarksPage() {

    const userId = await getUserFromToken();

    if(!userId){
        redirect("/login")
    }

    const {bookmarks} = await getBookmarkedResources(userId);

    return (
        <>

            <h2
                style={{
                    marginBottom: "1.5rem"
                }}
            >
                My Bookmarks
            </h2>

            {bookmarks.length === 0 && (
                    <p>
                        You haven't bookmarked anything yet.
                    </p>
                )}

            {bookmarks.map((resource) => (

                <ResourceCard
                    key={resource._id}
                    resource={{
                        ...resource,
                        isBookmarked: true,
                        isVoted: false
                    }}
                    showVote={false}
                />

            ))}

        </>
    );
}