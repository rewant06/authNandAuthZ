// app/page.tsx
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Services from "@/components/Services";
// Footer is missing — if you want it, paste the Lovable Footer and I will convert it
// import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Testimonials />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Index;
