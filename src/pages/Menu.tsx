
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import menuService, { MenuItem } from "@/services/menu.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const response = await menuService.getCategories();
      return response.data;
    },
  });
  
  const { data: allMenuItems, isLoading: isMenuLoading } = useQuery({
    queryKey: ['menu-items', activeCategory],
    queryFn: async () => {
      if (activeCategory === "all") {
        const response = await menuService.getAllItems(1, 50);
        return response.data.menuItems;
      } else if (activeCategory === "featured") {
        const response = await menuService.getFeaturedItems();
        return response.data;
      } else if (activeCategory === "seasonal") {
        const response = await menuService.getSeasonalItems();
        return response.data;
      } else {
        const response = await menuService.getItemsByCategory(activeCategory, 1, 50);
        return response.data.menuItems;
      }
    },
  });

  const renderDietaryBadges = (item: MenuItem) => {
    return (
      <div className="flex gap-2 mt-2">
        {item.dietaryInfo?.vegetarian && (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
            Vegetarian
          </Badge>
        )}
        {item.dietaryInfo?.vegan && (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
            Vegan
          </Badge>
        )}
        {item.dietaryInfo?.glutenFree && (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
            Gluten-Free
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-800 mb-6 text-center">Our Menu</h1>
          <p className="text-lg text-center max-w-3xl mx-auto mb-10">
            Discover our selection of handcrafted beverages and freshly prepared food. 
            We use only the finest ingredients to bring you a taste experience worth savoring.
          </p>
          
          {isCategoriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
          ) : (
            <Tabs 
              defaultValue="all" 
              className="w-full"
              onValueChange={setActiveCategory}
            >
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-flow-col auto-cols-max gap-1">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
                  {categories?.map((category: string) => (
                    <TabsTrigger key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <TabsContent value={activeCategory} className="mt-6">
                {isMenuLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allMenuItems?.map((item: MenuItem) => (
                      <Card key={item._id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-amber-800">{item.name}</CardTitle>
                            <span className="font-bold text-amber-900">${item.price.toFixed(2)}</span>
                          </div>
                          <CardDescription>{item.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <p className="text-gray-700">{item.description}</p>
                          {renderDietaryBadges(item)}
                        </CardContent>
                        {(item.featured || item.seasonal) && (
                          <CardFooter className="pt-0 flex gap-2">
                            {item.featured && (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                Featured
                              </Badge>
                            )}
                            {item.seasonal && (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                Seasonal
                              </Badge>
                            )}
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                    
                    {(!allMenuItems || allMenuItems.length === 0) && (
                      <p className="text-gray-500 italic col-span-2 text-center py-10">
                        No menu items available in this category.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Menu;
