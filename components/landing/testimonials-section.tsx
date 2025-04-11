import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "ResearchMind has completely transformed how I approach literature reviews. What used to take weeks now takes days.",
      author: "Dr. Sarah Johnson",
      role: "Professor of Computer Science",
      avatar: "SJ",
    },
    {
      quote:
        "The AI summaries are incredibly accurate and save me hours of reading time. I can focus on analyzing rather than just collecting information.",
      author: "Michael Chen",
      role: "PhD Candidate",
      avatar: "MC",
    },
    {
      quote:
        "As a research librarian, I recommend ResearchMind to all our graduate students. It's like having a research assistant available 24/7.",
      author: "Emily Rodriguez",
      role: "Academic Librarian",
      avatar: "ER",
    },
  ]

  return (
    <section className="py-20 bg-brand-light/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-block rounded-lg bg-brand-light px-3 py-1 text-sm text-primary">Testimonials</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Trusted by Researchers Worldwide</h2>
          <p className="text-muted-foreground md:text-lg max-w-2xl">
            See what academics and researchers are saying about ResearchMind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background">
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/40 mb-4" />
                <p className="text-lg italic">{testimonial.quote}</p>
              </CardContent>
              <CardFooter className="flex items-center space-x-4 pt-4 border-t">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
