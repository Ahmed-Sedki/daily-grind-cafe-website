
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const { toast } = useToast();
  
  // Form setup with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    form.setValue(name as any, value);
  };

  const handleSubmit = (values: FormValues) => {
    // Here you would normally send the data to your backend
    console.log("Form submitted:", values);
    
    // Show success toast
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    // Reset form
    form.reset();
  };

  return (
    <section id="contact" className="py-20 bg-cafe-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Have a question or want to book a private event? Send us a message!
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-cafe-brown mb-2 font-medium">
                Your Name
              </label>
              <Input
                id="name"
                name="name"
                value={form.watch("name")}
                onChange={handleChange}
                required
                className="border-cafe-lightBrown/30 focus:border-cafe-brown focus:ring-cafe-brown"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-cafe-brown mb-2 font-medium">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.watch("email")}
                onChange={handleChange}
                required
                className="border-cafe-lightBrown/30 focus:border-cafe-brown focus:ring-cafe-brown"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-cafe-brown mb-2 font-medium">
                Your Message
              </label>
              <Textarea
                id="message"
                name="message"
                value={form.watch("message")}
                onChange={handleChange}
                required
                rows={5}
                className="border-cafe-lightBrown/30 focus:border-cafe-brown focus:ring-cafe-brown"
              />
              {form.formState.errors.message && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full bg-cafe-brown text-cafe-cream hover:bg-cafe-darkBrown">
              Send Message
            </Button>
          </form>
          
          <div className="mt-12 text-center">
            <p className="text-cafe-brown">
              Prefer to call? Reach us at <a href="tel:5551234567" className="font-bold hover:text-cafe-darkBrown">(555) 123-4567</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
