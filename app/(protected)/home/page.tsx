import SubjectSection from "@/components/SubjectSection";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { redirect } from "next/navigation";
import { getHomePage } from "@/services/home";

export default async function HomePage() {
  
  const userId = await getUserFromToken();

  if(!userId){
    redirect("/login");
  }

  const subjects = await getHomePage(userId);

  return (
    <>

      {subjects.length === 0 && (
          <p>
            No resources available yet.
          </p>
        )}

      {subjects.map((subject) => (
        <SubjectSection
          key={subject.subject}
          subjectData={subject}
        />
      ))}
    </>
  );
}