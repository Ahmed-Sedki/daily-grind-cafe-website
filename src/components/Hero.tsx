
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section 
      className="min-h-screen flex items-center relative"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4">
            Crafted Coffee & Community
          </h1>
          <p className="text-xl md:text-2xl text-cafe-cream mb-8">
            Where every cup tells a story and every visit feels like home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-cafe-brown text-cafe-cream hover:bg-cafe-darkBrown transition-colors px-6 py-3 rounded-md font-medium">
              Explore Our Menu
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
