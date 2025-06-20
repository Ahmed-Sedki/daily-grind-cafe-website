
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, Menu as MenuIcon, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Menu", path: "/menu" },
  { label: "Gallery", path: "/gallery" },
  { label: "Announcements", path: "/announcements" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? "bg-white shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Coffee size={28} className={(isScrolled || !isHomePage) ? "text-cafe-darkBrown" : "text-white"} />
          <span className={`font-serif text-xl font-bold ${(isScrolled || !isHomePage) ? "text-cafe-darkBrown" : "text-white"}`}>L cafe</span>
        </Link>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                {/* Fixed the nested <a> tags issue by using only the Link component */}
                <Link to={item.path} className={navigationMenuTriggerStyle()}>
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="glass" className="hidden md:inline-flex">
              Login
            </Button>
          </Link>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                aria-label="Menu"
              >
                <MenuIcon className={(isScrolled || !isHomePage) ? "text-cafe-darkBrown" : "text-white"} />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white">
              <SheetHeader>
                <SheetTitle className="font-serif text-xl text-cafe-brown">L cafe</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {navigationItems.map((item, index) => (
                  <Link key={index} to={item.path}>
                    <Button variant="ghost" className="w-full justify-start text-cafe-brown hover:bg-cafe-cream hover:text-cafe-darkBrown">
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
