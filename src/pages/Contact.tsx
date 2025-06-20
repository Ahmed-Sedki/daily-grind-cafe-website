
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import qaService from "@/services/qa.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import ContactForm from "@/components/ContactForm";

// Validation schema for question form
const questionFormSchema = z.object({
  question: z.string().min(5, { message: "Question must be at least 5 characters" }),
  name: z.string().optional()
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

const Contact = () => {
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const { toast } = useToast();
  
  // Get FAQs
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await qaService.getQAItems(1, 5);
      return response.data.qaItems;
    },
  });
  
  // Question form setup
  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question: "",
      name: ""
    },
  });
  
  // Handle question submission
  const handleQuestionSubmit = async () => {
    try {
      const values = questionForm.getValues();
      
      if (!values.question || values.question.length < 5) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid question (at least 5 characters)",
        });
        return;
      }
      
      await qaService.submitQuestion(values.question, values.name || "Anonymous");
      setQuestionSubmitted(true);
      toast({
        title: "Question Submitted",
        description: "Thank you for your question! We'll review it and add it to our FAQ.",
      });
      questionForm.setValue("question", "");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your question. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-800 mb-6 text-center">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            <div>
              <h2 className="text-2xl font-semibold text-amber-700 mb-4">Get in Touch</h2>
              
              <ContactForm />
              
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-amber-700 mb-4">Have a Question?</h2>
                
                <FormProvider {...questionForm}>
                  <div className="space-y-4">
                    <div>
                      <Textarea 
                        placeholder="Ask us anything!" 
                        className="min-h-20"
                        {...questionForm.register("question")}
                      />
                      {questionForm.formState.errors.question && (
                        <p className="text-red-500 text-sm mt-1">
                          {questionForm.formState.errors.question.message}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleQuestionSubmit} 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={questionSubmitted}
                    >
                      {questionSubmitted ? "Question Submitted" : "Submit Question"}
                    </Button>
                  </div>
                </FormProvider>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-amber-700 mb-4">Visit Us</h2>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">L Café</CardTitle>
                  <CardDescription>Our Location</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">123 Coffee Street</p>
                  <p className="mb-2">Café District</p>
                  <p className="mb-2">City, State 12345</p>
                  <p className="mb-4">United States</p>
                  
                  <p className="font-medium">Hours:</p>
                  <p className="mb-1">Monday - Friday: 7am - 8pm</p>
                  <p className="mb-1">Saturday: 8am - 9pm</p>
                  <p>Sunday: 9am - 6pm</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Contact Info</CardTitle>
                  <CardDescription>Reach out directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">
                    <span className="font-medium">Phone:</span> (555) 123-4567
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Email:</span> hello@lcafe.com
                  </p>
                  <p>
                    <span className="font-medium">Social:</span> @lcafe
                  </p>
                </CardContent>
              </Card>
              
              <h2 className="text-2xl font-semibold text-amber-700 mt-8 mb-4">Frequently Asked Questions</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs?.map((faq) => (
                    <Card key={faq._id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-amber-800">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {(!faqs || faqs.length === 0) && (
                    <p className="text-gray-500 italic">No FAQs available at the moment.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
