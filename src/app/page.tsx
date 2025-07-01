import Container from "@/components/Container";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits/Benefits";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import AdminAccess from "@/components/AdminAccess";
import Section from "@/components/Section";
import Pricing from "@/components/Pricing/Pricing";

export default function HomePage() {
  return (
    <>
      <Container>
        <Hero />
        <Benefits />
        <Section
          id="pricing"
          title="Bảng giá"
          description="Đơn giản, trong suốt. Không có bất ngờ."
        >
          <Pricing />
        </Section>

        <Section
          id="testimonials"
          title="Những gì khách hàng nói về chúng tôi"
          description="Nghe những gì khách hàng nói về chúng tôi."
        >
          <Testimonials />
        </Section>
        <Stats />
        <FAQ />
        <CTA />
      </Container>
      <AdminAccess />
    </>
  );
}
