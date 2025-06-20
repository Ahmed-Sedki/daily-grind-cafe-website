
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import qaService, { QAItem } from "@/services/qa.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['qa-categories'],
    queryFn: async () => {
      const response = await qaService.getQACategories();
      return response.data;
    },
  });
  
  const { data: qaItems, isLoading: isQALoading } = useQuery({
    queryKey: ['qa-items', activeCategory],
    queryFn: async () => {
      if (activeCategory === "all") {
        const response = await qaService.getQAItems(1, 100);
        return response.data.qaItems;
      } else {
        const response = await qaService.getQAItemsByCategory(activeCategory, 1, 100);
        return response.data.qaItems;
      }
    },
  });
  
  // Filter QA items based on search query
  const filteredQAItems = searchQuery
    ? qaItems?.filter((item: QAItem) => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : qaItems;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-800 mb-6 text-center">Frequently Asked Questions</h1>
          <p className="text-lg text-center max-w-3xl mx-auto mb-10">
            Find answers to the most common questions about L Café, our menu, and our services.
          </p>
          
          <div className="mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
            </div>
          </div>
          
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
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-flow-col auto-cols-max gap-1">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {categories?.map((category: string) => (
                    <TabsTrigger key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <TabsContent value={activeCategory} className="mt-6">
                {isQALoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                  </div>
                ) : (
                  <div>
                    {filteredQAItems?.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredQAItems.map((item: QAItem) => (
                          <AccordionItem key={item._id} value={item._id}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pt-2 pb-4">
                                <p className="text-gray-700">{item.answer}</p>
                                
                                <div className="mt-4 text-right">
                                  <span className="text-xs text-gray-500">
                                    Category: {item.category}
                                  </span>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">
                          {searchQuery 
                            ? "No results found for your search." 
                            : "No questions available in this category."}
                        </p>
                        {searchQuery && (
                          <Button 
                            variant="outline" 
                            onClick={() => setSearchQuery("")}
                            className="mt-2"
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          <div className="mt-12 bg-amber-50 rounded-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Have a Question?</h2>
            <p className="mb-4">
              Can't find the answer you're looking for? Feel free to reach out to us through our contact page.
            </p>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
