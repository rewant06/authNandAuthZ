// components/Testimonials.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Startup Founder",
    company: "TechVision Inc",
    content:
      "HelpingBots transformed our idea into a fully functional app. Their free service is incredible - we got enterprise-level quality without any cost! The team's dedication and expertise exceeded all our expectations.",
    rating: 5,
    avatar: "SJ",
    gradient: "from-primary to-primary-glow",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Small Business Owner",
    company: "EduTech Solutions",
    content:
      "The team built our entire school management system from scratch. The quality, attention to detail, and user experience exceeded all expectations. It's been a game-changer for our institution.",
    rating: 5,
    avatar: "MC",
    gradient: "from-accent to-secondary",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Creative Director",
    company: "Brand Studio",
    content:
      "Their graphic design services are top-notch. They delivered beautiful, professional designs that perfectly captured our brand vision. The creativity and polish were outstanding.",
    rating: 5,
    avatar: "ER",
    gradient: "from-secondary to-accent",
  },
  {
    id: 4,
    name: "David Kumar",
    role: "Tech Entrepreneur",
    company: "SocialHub",
    content:
      "I was skeptical about free services, but HelpingBots proved me wrong. They delivered a complex anonymous posting app with all features we needed. Absolutely phenomenal work!",
    rating: 5,
    avatar: "DK",
    gradient: "from-primary to-accent",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Don't just take our word for it - hear from the amazing people we've
            helped bring their visions to life
          </p>
        </div>

        <div
          className={`max-w-4xl mx-auto relative transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Card className="border-2 glass-effect shadow-elevated overflow-hidden relative group">
            <Quote className="absolute top-4 left-4 md:top-6 md:left-6 h-12 w-12 md:h-16 md:w-16 text-primary/10" />

            <CardContent className="p-8 md:p-12 lg:p-16 relative">
              <div className="flex justify-center mb-6 md:mb-8 gap-1">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 md:h-6 md:w-6 fill-primary text-primary animate-scale-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>

              <blockquote className="text-lg md:text-xl lg:text-2xl text-center mb-8 md:mb-10 text-foreground/90 leading-relaxed font-medium">
                "{currentTestimonial.content}"
              </blockquote>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${currentTestimonial.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg animate-scale-in`}
                >
                  {currentTestimonial.avatar}
                </div>
                <div className="text-center md:text-left">
                  <div className="font-bold text-lg md:text-xl text-foreground">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground">
                    {currentTestimonial.role}
                  </div>
                  <div className="text-xs md:text-sm text-primary font-medium">
                    {currentTestimonial.company}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 mt-8 md:mt-10">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full glass-effect border-2 hover:border-primary hover:bg-primary/10 transition-all hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-gradient-to-r from-primary to-accent"
                      : "w-2 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full glass-effect border-2 hover:border-primary hover:bg-primary/10 transition-all hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
