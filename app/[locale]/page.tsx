import { Hero } from "@/components/sections/Hero";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaSection } from "@/components/sections/CtaSection";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <ProjectsGrid />
      <CtaSection />
      {/* Services is parked for now: add <Services /> back here, and the "services" link in NAV_LINKS. */}
      <About />
      <Testimonials />
      <Process />
    </>
  );
}
