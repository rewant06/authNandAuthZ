import Services from "@/components/Services";

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive range of free services designed to bring your vision to life
            </p>
          </div>
        </div>
        <Services />
      </main>
    </div>
  );
};

export default ServicesPage;
