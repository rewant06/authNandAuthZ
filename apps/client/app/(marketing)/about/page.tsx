"use client";

import { Target, Heart, Zap, Users, Lightbulb, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Mesh (Consistent with Hero) */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none -z-10"
        style={{
          background: "var(--gradient-mesh)",
          animation: "float 20s ease-in-out infinite",
        }}
      />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                About <span className="text-gradient">HelpingBots</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We are a collective of dreamers and builders, dedicated to the belief that <span className="text-primary font-medium">innovation should be affordable</span>.
              </p>
            </div>

            {/* Manifesto Section */}
            <div className="glass-effect p-8 md:p-12 rounded-3xl border border-border/50 shadow-elevated mb-16 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-foreground/90 leading-relaxed mb-6 text-lg">
                  HelpingBots was founded on a radical premise: <strong>Great ideas shouldn&apos;t die in a notebook because of budget constraints.</strong>
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  We are a team of senior developers, designers, and strategists who have seen too many brilliant startups fail simply because they couldn&apos;t afford an MVP. We exist to bridge that gap. By providing professional-grade software development completely affordable, we empower entrepreneurs to focus on what matters most: <strong>their vision.</strong>
                </p>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "Our Mission",
                  desc: "To democratize access to elite software engineering, ensuring financial barriers never stop a world-changing idea.",
                  color: "from-primary/20 to-accent/20",
                  iconColor: "text-primary"
                },
                {
                  icon: Heart,
                  title: "Our Values",
                  desc: "Generosity is our currency. We believe in open collaboration, code quality, and the transformative power of giving back.",
                  color: "from-accent/20 to-secondary/20",
                  iconColor: "text-accent"
                },
                {
                  icon: Zap,
                  title: "Our Velocity",
                  desc: "Affordable doesn't mean slow. We operate with Agile methodologies to deliver production-ready scalable code at startup speed.",
                  color: "from-secondary/20 to-primary/20",
                  iconColor: "text-secondary"
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl glass-effect border border-border hover:border-primary/50 transition-all duration-300 hover-lift animate-fade-in"
                  style={{ animationDelay: `${200 + (index * 100)}ms` }}
                >
                  <div className={`p-3 w-fit rounded-xl bg-gradient-to-br ${item.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Team / Culture Teaser (Bonus Section) */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: "500ms" }}>
               {[
                 { label: "Global Team", icon: Globe },
                 { label: "Open Source", icon: Users },
                 { label: "Innovation", icon: Lightbulb },
                 { label: "Community", icon: Heart },
               ].map((stat, i) => (
                 <Card key={i} className="bg-transparent border-none shadow-none text-center">
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <stat.icon className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                      <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                    </CardContent>
                 </Card>
               ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;