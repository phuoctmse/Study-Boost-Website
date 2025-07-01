import Container from "@/components/Container";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits/Benefits";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import AdminAccess from "@/components/AdminAccess";

export default function HomePage() {
  return (
    <>
      <Container>
        <Hero />
        <Benefits />
        <Stats />
        <Testimonials />
        <FAQ />
        <CTA />
      </Container>
      <AdminAccess />
    </>
  );
}
