import { Smartphone } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const SoftwareDevelopment = () => {
  const features = [
    { text: "Native and cross-platform Android mobile application engineering leveraging Kotlin and React Native" },
    { text: "High-performance iOS application development adhering to strict Apple Human Interface Guidelines" },
    { text: "Scalable, secure custom web applications mapping sophisticated enterprise business logic" },
    { text: "End-to-end e-commerce platform architecture handling massive transactional traffic volumes" },
    { text: "Rapid orchestration of secure RESTful and GraphQL APIs facilitating microservice communication" },
    { text: "Advanced, highly normalized database design and administration (SQL and NoSQL paradigms)" },
    { text: "Human-centric UI/UX design methodologies focusing on optimal accessibility and conversion rates" },
    { text: "Continuous DevOps integration, automated CI/CD pipelines, and rigorous long-term maintenance" },
  ];

  const detailedContent = (
    <>
      <p>
        In an era defined by digital-first interactions, off-the-shelf software often fails to address unique organizational challenges. Our Software Development division engineers bespoke web and mobile applications that are intrinsically calibrated to your strategic objectives. We adopt agile methodologies to ensure rapid prototyping, iterative improvements, and fundamentally superior end-products.
      </p>
      <p>
        We are not just coders; we are digital architects. From designing resilient, highly concurrent database schemas to rendering butter-smooth, intuitive user interfaces on both iOS and Android platforms, Vilcom guarantees an exceptional lifecycle. We employ rigorous automated testing and continuous integration (CI/CD) pipelines to deploy code safely, ensuring that your application remains fiercely competitive and highly available post-launch.
      </p>
    </>
  );

  return (
    <ServicePage
      title="Software Development"
      subtitle="Android, iOS & Enterprise Web Solutions"
      description="Catalyze your operational velocity with our custom software engineering services. From highly performant mobile applications to deeply complex enterprise web platforms, our cross-functional teams deliver secure, massively scalable, and elegantly designed digital products tailored precisely to your vision."
      detailedContent={detailedContent}
      features={features}
      technologies={["React Native", "Swift/Kotlin", "Node.js/Express", "TypeScript", "PostgreSQL", "MongoDB", "Docker/Kubernetes", "Figma Design"]}
      icon={<Smartphone className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,30%,50%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      serviceType="web_development"
    />
  );
};

export default SoftwareDevelopment;
