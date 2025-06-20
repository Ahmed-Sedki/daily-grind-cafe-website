import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import menuService from "@/services/menu.service";
import { Link } from "react-router-dom";

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
  
  // Check if we have featured items from API
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
          <div className="text-center py-12">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-serif font-bold text-cafe-brown mb-2">Menu is Empty</h3>
              <p className="text-cafe-brown text-sm">
                No featured menu items are currently available. Please check back later or contact us for more information.
              </p>
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
