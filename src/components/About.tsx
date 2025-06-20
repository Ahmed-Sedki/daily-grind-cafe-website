
import { Coffee, Clock, Users } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-cafe-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Our Story</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            From bean to cup, we're passionate about crafting exceptional coffee experiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-cafe-brown mb-6 leading-relaxed">
              Founded in 2015, <span className="font-bold">L cafe</span> began with a simple mission: to create a space where quality coffee meets genuine community. Our founder, Elena, traveled the world studying coffee cultures before bringing her passion back home.
            </p>
            <p className="text-cafe-brown mb-6 leading-relaxed">
              We source our beans directly from small-scale farmers, ensuring ethical practices and exceptional quality. Each batch is roasted in-house to bring out unique flavor profiles that tell the story of their origin.
            </p>
            <p className="text-cafe-brown leading-relaxed">
              More than just a cafe, we're a gathering place where neighbors become friends and every customer is part of our extended family.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-cafe-brown rounded-full flex items-center justify-center mb-4">
                <Coffee size={24} className="text-cafe-cream" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cafe-darkBrown mb-2">Artisan Coffee</h3>
              <p className="text-cafe-brown">Expertly roasted beans with distinctive flavor profiles from around the world.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-cafe-brown rounded-full flex items-center justify-center mb-4">
                <Clock size={24} className="text-cafe-cream" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cafe-darkBrown mb-2">Slow Living</h3>
              <p className="text-cafe-brown">An atmosphere that encourages you to pause, connect, and be present.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
              <div className="w-12 h-12 bg-cafe-brown rounded-full flex items-center justify-center mb-4">
                <Users size={24} className="text-cafe-cream" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cafe-darkBrown mb-2">Community First</h3>
              <p className="text-cafe-brown">We host events, workshops, and provide a space for local artists and entrepreneurs to share their craft.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
