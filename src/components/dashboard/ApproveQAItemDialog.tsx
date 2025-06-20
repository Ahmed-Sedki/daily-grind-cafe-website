
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import qaService from "@/services/qa.service";

interface ApproveQAItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qaItemId: string;
  qaItemQuestion: string;
  onSuccess: () => void;
}

const ApproveQAItemDialog = ({
  isOpen,
  onClose,
  qaItemId,
  qaItemQuestion,
  onSuccess,
}: ApproveQAItemDialogProps) => {
  const { toast } = useToast();
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    // Validate the answer field
    if (!answer.trim()) {
      setError("Please provide an answer to approve this question.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      
      // Approve the question using the updated service method
      await qaService.approveQAItem(qaItemId, answer);
      
      toast({
        title: "Question approved",
        description: "The question has been approved and added to the FAQ.",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error approving question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem approving the question.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve Question</DialogTitle>
          <DialogDescription>
            Provide an answer for this user-submitted question to approve it and add it to the FAQ.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Label className="text-base font-medium">Question:</Label>
            <p className="mt-1 text-gray-700">{qaItemQuestion}</p>
          </div>
          
          <div className="mb-2">
            <Label htmlFor="answer" className="text-base font-medium">
              Answer:
            </Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer here..."
              className="mt-1 min-h-32"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve & Publish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveQAItemDialog;
