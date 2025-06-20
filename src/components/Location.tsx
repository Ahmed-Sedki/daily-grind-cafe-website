
import { MapPin, Clock, PhoneCall } from "lucide-react";

const Location = () => {
  return (
    <section id="location" className="py-20 bg-cafe-brown text-cafe-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Find Us</h2>
          <p className="text-xl font-serif mb-6 max-w-2xl mx-auto">
            Conveniently located in the heart of downtown, with comfortable seating and free WiFi
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-cafe-darkBrown p-8 rounded-lg">
            <div className="flex items-start gap-4 mb-6">
              <MapPin size={24} className="text-cafe-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-bold text-xl mb-2">Address</h3>
                <p className="mb-1">123 Coffee Street</p>
                <p>Downtown, City 10001</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <Clock size={24} className="text-cafe-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-bold text-xl mb-2">Hours</h3>
                <p className="mb-1">Monday - Friday: 7:00 AM - 7:00 PM</p>
                <p className="mb-1">Saturday: 8:00 AM - 9:00 PM</p>
                <p>Sunday: 8:00 AM - 5:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <PhoneCall size={24} className="text-cafe-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-bold text-xl mb-2">Contact</h3>
                <p className="mb-1">Phone: (555) 123-4567</p>
                <p>Email: hello@Lcafecom</p>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343033!2d-74.0059556846331!3d40.74147877932915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
