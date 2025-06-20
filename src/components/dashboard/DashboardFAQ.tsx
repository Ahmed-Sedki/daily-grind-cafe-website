
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  HelpCircle,
  Search,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import qaService, { QAItem } from "@/services/qa.service";
import QAItemForm from "./QAItemForm";
import DeleteQAItemDialog from "./DeleteQAItemDialog";
import ApproveQAItemDialog from "./ApproveQAItemDialog";
import { Separator } from "@/components/ui/separator";

const DashboardFAQ = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState("published");
  
  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for editing/creating
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<QAItem | null>(null);
  
  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItemQuestion, setSelectedItemQuestion] = useState("");

  // Fetch FAQ items based on current tab
  const { data, isLoading, isError } = useQuery({
    queryKey: ['qa-items', currentPage, activeTab],
    queryFn: async () => {
      const approved = activeTab === "published" ? "true" : "false";
      const response = await qaService.getQAItems(currentPage, 10, approved);
      return response.data;
    },
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setSearchQuery("");
  };

  // Handle item editing
  const handleEditItem = (item: QAItem) => {
    setEditingItem(item);
    setIsCreating(false);
  };

  // Handle item deletion
  const handleDeleteClick = (id: string, question: string) => {
    setSelectedItemId(id);
    setSelectedItemQuestion(question);
    setDeleteDialogOpen(true);
  };

  // Handle item approval
  const handleApproveClick = (id: string, question: string) => {
    setSelectedItemId(id);
    setSelectedItemQuestion(question);
    setApproveDialogOpen(true);
  };

  // Handle form success and cleanup
  const handleFormSuccess = () => {
    setIsCreating(false);
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: ['qa-items'] });
    queryClient.invalidateQueries({ queryKey: ['qa-categories'] });
  };

  // Handle dialog success
  const handleDialogSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['qa-items'] });
  };

  // Filter items based on search query
  const filteredItems = searchQuery.trim() 
    ? data?.qaItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.answer && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : data?.qaItems;

  // Render the form for creating/editing an item
  if (isCreating || editingItem) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsCreating(false);
              setEditingItem(null);
            }}
            className="mr-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isCreating ? "Create New FAQ Item" : "Edit FAQ Item"}
          </h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <QAItemForm
              qaItem={editingItem || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsCreating(false);
                setEditingItem(null);
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">FAQ Management</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add New Question
        </Button>
      </div>
      
      <Tabs 
        defaultValue="published" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="published" className="px-4">
              Published FAQ
            </TabsTrigger>
            <TabsTrigger value="pending" className="px-4">
              Pending Questions
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Card className="mt-2">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700"></div>
              </div>
            ) : isError ? (
              <div className="py-8 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600">Failed to load FAQ items. Please try again.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['qa-items'] })}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Question</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Category</th>
                        {activeTab === "pending" && (
                          <th className="px-4 py-3 text-left text-gray-700 font-medium">Submitted By</th>
                        )}
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Sort Order</th>
                        <th className="px-4 py-3 text-right text-gray-700 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredItems && filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium">{item.question}</div>
                              {activeTab === "published" && (
                                <div className="text-gray-500 text-sm mt-1 line-clamp-2">
                                  {item.answer}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {item.category ? (
                                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                                  {item.category}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            {activeTab === "pending" && (
                              <td className="px-4 py-3 text-sm">
                                {item.submittedBy || "Anonymous"}
                              </td>
                            )}
                            <td className="px-4 py-3 text-sm">
                              {item.sortOrder !== undefined ? item.sortOrder : "-"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end space-x-2">
                                {activeTab === "published" ? (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => handleApproveClick(item._id, item.question)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteClick(item._id, item.question)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={activeTab === "pending" ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                            {searchQuery ? (
                              <>
                                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>No results found for "{searchQuery}"</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setSearchQuery("")}
                                  className="mt-2"
                                >
                                  Clear search
                                </Button>
                              </>
                            ) : activeTab === "pending" ? (
                              <>
                                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>No pending questions found</p>
                              </>
                            ) : (
                              <>
                                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>No FAQ items found</p>
                                <Button 
                                  onClick={() => setIsCreating(true)}
                                  className="mt-2"
                                >
                                  Create your first FAQ item
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-2 border-t">
                    <span className="text-sm text-gray-600">
                      Page {data.currentPage} of {data.totalPages}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={currentPage === data.totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
      
      <DeleteQAItemDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        qaItemId={selectedItemId}
        qaItemQuestion={selectedItemQuestion}
        onSuccess={handleDialogSuccess}
      />
      
      <ApproveQAItemDialog
        isOpen={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        qaItemId={selectedItemId}
        qaItemQuestion={selectedItemQuestion}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default DashboardFAQ;
