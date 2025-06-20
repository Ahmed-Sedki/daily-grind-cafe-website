
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Menu from "@/components/Menu";
import FeaturedAnnouncements from "@/components/FeaturedAnnouncements";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Menu />
      <FeaturedAnnouncements />
      <Location />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
