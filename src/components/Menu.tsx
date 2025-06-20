import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import menuService from "@/services/menu.service";
import { Link } from "react-router-dom";

interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

const menuItems: MenuItem[] = [
  {
    name: "House Blend Coffee",
    description: "Our signature medium roast with notes of chocolate and caramel",
    price: "$4.50",
    category: "coffee"
  },
  {
    name: "Single Origin Ethiopia",
    description: "Light roast with floral notes and citrus brightness",
    price: "$5.25",
    category: "coffee"
  },
  {
    name: "Cappuccino",
    description: "Espresso with steamed milk and a delicate layer of foam",
    price: "$5.00",
    category: "coffee"
  },
  {
    name: "Cold Brew",
    description: "Steeped for 24 hours, smooth and refreshing",
    price: "$5.50",
    category: "coffee"
  },
  {
    name: "Avocado Toast",
    description: "Sourdough bread with avocado, cherry tomatoes, and microgreens",
    price: "$9.75",
    category: "food"
  },
  {
    name: "Breakfast Burrito",
    description: "Free-range eggs, black beans, avocado, and house salsa",
    price: "$12.50",
    category: "food"
  },
  {
    name: "Artisan Pastry Box",
    description: "Selection of our daily baked goods, perfect for sharing",
    price: "$14.00",
    category: "food"
  },
  {
    name: "Granola Bowl",
    description: "House-made granola with Greek yogurt and seasonal fruit",
    price: "$8.75",
    category: "food"
  }
];

const Menu = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-menu'],
    queryFn: async () => {
      const response = await menuService.getFeaturedItems();
      return response.data;
    },
  });
  
  // Group menu items by category for display
  const groupedItems = data?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof data>) || {};
  
  // Get list of categories in a specific order
  const categoryOrder = ["coffee", "tea", "food", "dessert", "seasonal"];
  const orderedCategories = Object.keys(groupedItems).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );
  
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  if (isLoading) {
    return (
      <section id="menu" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mx-auto"></div>
        </div>
      </section>
    );
  }
  
  // Fallback to static data if API returns no items
  const hasItems = data && data.length > 0;
  
  return (
    <section id="menu" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Our Menu</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Carefully crafted drinks and delicious food made with seasonal ingredients
          </p>
        </div>
        
        {hasItems ? (
          <>
            {orderedCategories.map(category => (
              <div key={category} className="mb-16">
                <h3 className="text-2xl font-serif font-bold text-cafe-brown mb-6 text-center">
                  {formatCategoryName(category)}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {groupedItems[category].map(item => (
                    <Card key={item._id} className="overflow-hidden border border-cafe-lightBrown/20 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-serif font-bold text-lg text-cafe-darkBrown">{item.name}</h4>
                            <div className="flex space-x-1 mt-1">
                              {item.dietaryInfo.vegan && (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700">Vegan</Badge>
                              )}
                              {item.dietaryInfo.vegetarian && (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700">Vegetarian</Badge>
                              )}
                              {item.dietaryInfo.glutenFree && (
                                <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">Gluten Free</Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-cafe-accent font-medium">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-cafe-brown text-sm mt-2">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="mb-16">
            <h3 className="text-2xl font-serif font-bold text-cafe-brown mb-6 text-center">Coffee & Drinks</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {menuItems.filter(item => item.category === "coffee").map((item, index) => (
                <Card key={index} className="overflow-hidden border border-cafe-lightBrown/20 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-serif font-bold text-lg text-cafe-darkBrown">{item.name}</h4>
                      <span className="text-cafe-accent font-medium">{item.price}</span>
                    </div>
                    <p className="text-cafe-brown text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link 
            to="/menu" 
            className="inline-block text-cafe-brown border-b-2 border-cafe-brown hover:text-cafe-darkBrown hover:border-cafe-darkBrown transition-colors"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Menu;
