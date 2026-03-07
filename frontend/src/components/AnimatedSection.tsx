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
          // Disconnect after first intersection → better performance
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,              // trigger when 10% visible
        rootMargin: "0px 0px -50px 0px", // trigger a bit earlier
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
      // observer.disconnect(); // optional – already disconnected on intersection
    };
  }, []); // empty deps → runs once on mount

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
        willChange: "opacity, transform", // hint to browser for better perf
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;