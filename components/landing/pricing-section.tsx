import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      description: "Basic research tools for casual users",
      price: "$0",
      period: "forever",
      features: [
        "10 paper searches per day",
        "5 AI summaries per month",
        "Basic chatbot assistance",
        "1 research project",
        "PDF uploads (5 per month)",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Advanced tools for serious researchers",
      price: "$19",
      period: "per month",
      features: [
        "Unlimited paper searches",
        "50 AI summaries per month",
        "Advanced chatbot with context",
        "10 research projects",
        "PDF uploads (50 per month)",
        "Literature review generation",
        "Export in multiple formats",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Academic",
      description: "Complete solution for institutions",
      price: "$49",
      period: "per month",
      features: [
        "Everything in Pro",
        "Unlimited AI summaries",
        "Unlimited research projects",
        "Unlimited PDF uploads",
        "Team collaboration",
        "API access",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-block rounded-lg bg-brand-light px-3 py-1 text-sm text-primary">Pricing</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Choose the Perfect Plan for Your Research Needs
          </h2>
          <p className="text-muted-foreground md:text-lg max-w-2xl">
            Flexible options for individual researchers, teams, and institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`flex flex-col ${plan.popular ? "border-primary shadow-lg relative" : ""}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Need a custom plan for your organization?{" "}
            <Link href="/contact" className="text-primary font-medium hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
