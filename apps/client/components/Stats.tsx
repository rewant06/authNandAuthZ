"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Code, Palette, Trophy, LucideIcon } from "lucide-react";

interface StatItem {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const statsData: StatItem[] = [
  {
    icon: Users,
    value: 1500,
    suffix: "+",
    label: "Happy Users",
    color: "from-primary to-primary-glow",
  },
  {
    icon: Code,
    value: 10,
    suffix: "+",
    label: "Projects Delivered",
    color: "from-accent to-secondary",
  },
  {
    icon: Palette,
    value: 10,
    suffix: "+",
    label: "Designs Created",
    color: "from-secondary to-accent",
  },
  {
    icon: Trophy,
    value: 100,
    suffix: "%",
    label: "Satisfaction Rate",
    color: "from-primary to-accent",
  },
];

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState<number[]>(statsData.map(() => 0));
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timers = statsData.map((stat, index) => {
      let currentStep = 0;
      return setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentValue = Math.floor(stat.value * progress);

        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = currentValue;
          return newCounts;
        });

        if (currentStep >= steps) {
          clearInterval(timers[index]);
        }
      }, interval);
    });

    return () => timers.forEach((timer) => clearInterval(timer));
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Our <span className="text-gradient">Impact</span> in Numbers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join hundreds of satisfied clients who&apos;ve brought their visions
            to life with us
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className={`group p-6 md:p-8 rounded-2xl glass-effect border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-gradient">
                  {counts[index]}
                  {stat.suffix}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
