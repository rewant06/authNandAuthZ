// apps/client/components/Hero.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Rocket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Particle = {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
  size?: string;
};

const generateParticle = (): Particle => {
  const left = `${(Math.random() * 100).toFixed(6)}%`;
  const top = `${(Math.random() * 100).toFixed(6)}%`;
  const animationDelay = `${(Math.random() * 2.5).toFixed(3)}s`;
  const animationDuration = `${(3 + Math.random() * 4).toFixed(3)}s`; // 3s - 7s
  const sizePx = (2 + Math.random() * 6).toFixed(1); // 2 - 8 px
  return { left, top, animationDelay, animationDuration, size: `${sizePx}px` };
};

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  // particles generated only on client to avoid SSR mismatch
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setIsVisible(true);

    // generate particles on client only
    const p: Particle[] = Array.from({ length: 20 }).map(() => generateParticle());
    setParticles(p);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient mesh background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "var(--gradient-mesh)",
          animation: "float 20s ease-in-out infinite",
        }}
      />

      {/* Small randomized particles (client-only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute bg-primary/30 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
              transform: "translate(-50%, -50%)",
            }}
            aria-hidden
          />
        ))}
      </div>

      {/* Large deterministic orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div
            className={`flex justify-center mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect border-primary/30 shadow-lg">
              <Sparkles className="h-4 w-4 text-primary animate-glow" />
              <span className="text-sm font-semibold text-gradient">100% Free Forever</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>

          {/* Main Heading */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center mb-6 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="block mb-2 text-gradient">Your Vision,</span>
            <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
              Our Responsibility
            </span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-lg md:text-xl lg:text-2xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Transform your boldest ideas into stunning reality with our comprehensive suite of{" "}
            <span className="text-primary font-semibold">completely free</span> development and design
            services.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary via-accent to-primary text-white hover:opacity-90 transition-all text-base md:text-lg px-8 py-6 rounded-full shadow-lg shadow-elevated hover:scale-105 group bg-[length:200%_auto] animate-shimmer"
            >
              <Link href="/get-started" aria-label="Start your project free">
                Start Your Project Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="glass-effect hover:bg-primary/10 text-base md:text-lg px-8 py-6 rounded-full border-2 hover:border-primary/50 transition-all group"
            >
              <Link href="/services" aria-label="Explore services">
                Explore Services
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* ... Feature cards / rest of hero (keep your existing markup) ... */}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;

