"use client";
import { Target, Heart, Zap } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
              About <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">HelpingBots</span>
            </h1>
            
            <p className="text-lg text-muted-foreground text-center mb-12">
              Empowering innovators with free, professional development services
            </p>

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-foreground/80 leading-relaxed mb-6">
                HelpingBots was founded on a simple belief: great ideas shouldn't be limited by budget constraints. 
                We're a team of passionate developers and designers dedicated to helping entrepreneurs, startups, 
                and innovators turn their visions into reality—completely free of charge.
              </p>
              
              <p className="text-foreground/80 leading-relaxed">
                Our mission is to democratize access to professional software development and design services, 
                ensuring that anyone with a brilliant idea can bring it to life without financial barriers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors">
                <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  To make professional development services accessible to everyone, regardless of their financial situation.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors">
                <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Our Values</h3>
                <p className="text-sm text-muted-foreground">
                  We believe in generosity, quality, and the power of technology to transform lives and businesses.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors">
                <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Our Approach</h3>
                <p className="text-sm text-muted-foreground">
                  Fast, efficient, and focused on delivering exceptional results that exceed expectations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
