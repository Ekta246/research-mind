import { BookOpen, Search, FileText, MessageSquare, Upload, Sparkles, FolderKanban, Share2 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Smart Paper Search",
      description:
        "Find relevant papers across multiple sources including Semantic Scholar, arXiv, and more with our intelligent search engine.",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Paper Summaries",
      description:
        "Get AI-generated summaries of research papers to quickly understand key findings and methodologies.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Research Assistant Chatbot",
      description: "Ask questions about papers, get explanations, and receive research guidance from our AI assistant.",
    },
    {
      icon: <Upload className="h-10 w-10 text-primary" />,
      title: "PDF Upload & Analysis",
      description: "Upload your own PDFs for analysis, annotation, and integration with your research projects.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "Comparative Analysis",
      description: "Compare multiple papers to identify similarities, differences, and research gaps.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Literature Review Generator",
      description: "Automatically generate comprehensive literature reviews from your selected papers.",
    },
    {
      icon: <FolderKanban className="h-10 w-10 text-primary" />,
      title: "Research Projects",
      description: "Organize papers into projects for better management of different research topics.",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "Export & Share",
      description: "Export your findings, summaries, and analyses in various formats or share them with colleagues.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-block rounded-lg bg-brand-light px-3 py-1 text-sm text-primary">Features</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Everything You Need for Research Excellence
          </h2>
          <p className="text-muted-foreground md:text-lg max-w-2xl">
            ResearchMind combines powerful AI with intuitive tools to transform your research workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col p-6 bg-background rounded-xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
