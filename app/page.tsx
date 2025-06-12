// app/page.tsx
import Hero from "./sections/Hero";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import InstagramFeed from "./sections/InstagramFeed";
import Testimonials from "./components/Testimonials";
import About from "./sections/About";
import Contact from "./components/Contact";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <Portfolio />
      <InstagramFeed />
      <Testimonials />
      <About />
      <Contact />
    </main>
  );
}