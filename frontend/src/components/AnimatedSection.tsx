import { useRef, useEffect, useState, ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;       // in milliseconds
  className?: string;
  id?: string;
}

const AnimatedSection = ({
  children,
  delay = 0,
  className = "",
  id,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect after first intersection for better performance
          observer.disconnect();
        }
      },
      {
        threshold: 0,                      // trigger as soon as any pixel is visible
        rootMargin: "0px 0px -30px 0px",   // pre-fire 30px before element enters viewport
      }
    );

    const currentElement = ref.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // Cleanup
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`transition-[opacity,transform] duration-[600ms] ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: isVisible ? "auto" : "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;