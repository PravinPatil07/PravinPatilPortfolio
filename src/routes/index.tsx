import { About } from "@/components/site/About";
import { Certifications } from "@/components/site/Certifications";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Freelance } from "@/components/site/Freelance";
import { WebDev } from "@/components/site/WebDev";

import { GithubDashboard } from "@/components/site/GithubDashboard";
import { Hero } from "@/components/site/Hero";
import { HuggingFace } from "@/components/site/HuggingFace";
import { Nav } from "@/components/site/Nav";
import { NeuralBackground } from "@/components/site/NeuralBackground";
import { Projects } from "@/components/site/Projects";
import { RobotBackground } from "@/components/site/RobotBackground";
import { Skills } from "@/components/site/Skills";
import { PROFILE } from "@/lib/profile";
import { getGithubData, getHfData } from "@/lib/portfolio.functions";
import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Pravin Patil — AI & Machine Learning Engineer";
const DESCRIPTION =
  "Portfolio of Pravin Patil, AI / ML engineer building deep learning, LLM and computer vision systems. Live GitHub repositories and Hugging Face Spaces, updated automatically.";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [github, hf] = await Promise.all([getGithubData(), getHfData()]);
    return { github, hf };
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Pravin Patil, AI Engineer, Machine Learning Engineer, Deep Learning, LLM Engineer, Computer Vision, Full Stack Developer, Hugging Face, portfolio",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://avatars.githubusercontent.com/u/162779622?v=4" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "https://avatars.githubusercontent.com/u/162779622?v=4" },
    ],
    links: [{ rel: "canonical", href: "https://pravinpatil.netlify.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: PROFILE.fullName,
          alternateName: PROFILE.name,
          jobTitle: PROFILE.roles.join(", "),
          email: `mailto:${PROFILE.email}`,
          description: PROFILE.summary,
          sameAs: [
            PROFILE.links.github,
            PROFILE.links.linkedin,
            PROFILE.links.huggingface,
            PROFILE.links.website,
          ],
          knowsAbout: [
            "Artificial Intelligence",
            "Machine Learning",
            "Deep Learning",
            "Large Language Models",
            "Computer Vision",
            "Full Stack Development",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { github, hf } = Route.useLoaderData();

  return (
    <div className="relative min-h-screen">
      <NeuralBackground />
      <RobotBackground />

      <Nav />
      <main>
        <h1 className="sr-only">
          {PROFILE.fullName} — AI Engineer, Machine Learning Engineer and Full Stack Developer
        </h1>
        <Hero github={github} hf={hf} />
        <About github={github} />
        <Skills github={github} />
        <Projects github={github} />
        <WebDev />
        <Freelance />

        <HuggingFace hf={hf} />
        <GithubDashboard github={github} />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
