# ResearchMind - AI Research Assistant

ResearchMind is an intelligent AI-powered tool designed to enhance your academic research workflow. It helps researchers find, analyze, and synthesize research papers, saving hours of work and helping produce better academic results.

## 🚀 Features

- **Smart Paper Search** - Find relevant papers across multiple sources including Semantic Scholar, arXiv, and more with our intelligent search engine.
- **Paper Summaries** - Get AI-generated summaries of research papers to quickly understand key findings and methodologies.
- **Research Assistant Chatbot** - Ask questions about papers, get explanations, and receive research guidance from our AI assistant.
- **PDF Upload & Analysis** - Upload your own PDFs for analysis, annotation, and integration with your research projects.
- **Comparative Analysis** - Compare multiple papers to identify similarities, differences, and research gaps.
- **Literature Review Generator** - Automatically generate comprehensive literature reviews from your selected papers.
- **Research Projects** - Organize papers into projects for better management of different research topics.
- **Export & Share** - Export your findings, summaries, and analyses in various formats or share them with colleagues.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **UI Components**: Radix UI, Shadcn/UI
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **AI Services**: 
  - OpenAI (GPT models)
  - Anthropic (Claude)
  - Google AI
  - Local LLM support via Ollama
- **Styling**: Tailwind CSS with theming support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- (Optional) Other API keys for enhanced functionality

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/research-mind.git
cd research-mind
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your API keys and configuration values.

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📚 Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - Reusable React components
- `contexts/` - React contexts for state management
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and shared code
- `public/` - Static assets
- `styles/` - Global CSS styles
- `types/` - TypeScript type definitions
- `utils/` - Helper functions

## 🧩 Key Components

- **Dashboard** - Central hub for managing research activities
- **Search Interface** - Advanced search functionality for finding papers
- **Paper Viewer** - Read and analyze papers with AI assistance
- **Chat Interface** - Interact with the AI research assistant
- **Projects Manager** - Organize papers into research projects

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Contact

For any questions or suggestions, please reach out to [your contact information]. 