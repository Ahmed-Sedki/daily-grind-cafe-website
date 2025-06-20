
import { Coffee, Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-cafe-darkBrown text-cafe-cream py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <Link to="/" className="flex items-center gap-2 mb-6 md:mb-0">
            <Coffee size={28} className="text-cafe-cream" />
            <span className="font-serif text-xl font-bold">Daily Grind</span>
          </Link>
          
          <div className="flex space-x-6">
            <a href="https://instagram.com/ahmed.sedkii" className="hover:text-cafe-orange transition-colors" aria-label="Instagram">
              <Instagram size={24} />
            </a>
            <a href="https://facebook.com" className="hover:text-cafe-orange transition-colors" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" className="hover:text-cafe-orange transition-colors" aria-label="Twitter">
              <Twitter size={24} />
            </a>
          </div>
        </div>
        
        <div className="border-t border-cafe-brown pt-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Hours</h3>
              <p className="mb-2">Mon-Fri: 7:00 AM - 7:00 PM</p>
              <p className="mb-2">Sat: 8:00 AM - 9:00 PM</p>
              <p>Sun: 8:00 AM - 5:00 PM</p>
            </div>
            
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Contact</h3>
              <p className="mb-2">123 Coffee Street</p>
              <p className="mb-2">Downtown, City 10001</p>
              <p className="mb-2">(555) 123-4567</p>
              <p>hello@dailygrind.com</p>
            </div>
            
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-cafe-orange transition-colors">About Us</Link></li>
                <li><Link to="/menu" className="hover:text-cafe-orange transition-colors">Menu</Link></li>
                <li><Link to="/gallery" className="hover:text-cafe-orange transition-colors">Gallery</Link></li>
                <li><Link to="/faq" className="hover:text-cafe-orange transition-colors">FAQ</Link></li>
                <li><Link to="/site-map.xml" className="hover:text-cafe-orange transition-colors">Site Map</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Subscribe</h3>
              <p className="mb-4">Join our mailing list for updates, promotions, and coffee tips.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-cafe-brown text-cafe-cream px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-cafe-orange"
                />
                <button className="bg-cafe-orange text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-10 pt-6 border-t border-cafe-brown text-sm text-cafe-cream/70">
          <p>© {new Date().getFullYear()} Daily Grind Cafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
