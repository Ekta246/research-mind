"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, SkipForward } from "lucide-react"
import Image from "next/image"

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeDemo, setActiveDemo] = useState("search")

  return (
    <section id="demo" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-block rounded-lg bg-brand-light px-3 py-1 text-sm text-primary">Demo</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">See ResearchMind in Action</h2>
          <p className="text-muted-foreground md:text-lg max-w-2xl">
            Watch how ResearchMind transforms your research workflow with powerful AI capabilities
          </p>
        </div>

        <Tabs
          defaultValue="search"
          value={activeDemo}
          onValueChange={setActiveDemo}
          className="w-full max-w-4xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="search">Paper Search</TabsTrigger>
            <TabsTrigger value="summary">AI Summaries</TabsTrigger>
            <TabsTrigger value="chat">Research Chat</TabsTrigger>
          </TabsList>

          <div className="relative rounded-xl overflow-hidden border shadow-lg">
            <TabsContent value="search" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=720&width=1280"
                      alt="Paper search demo"
                      width={1280}
                      height={720}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 flex items-center justify-center"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 bg-card">
                    <h3 className="text-xl font-semibold mb-2">Intelligent Paper Search</h3>
                    <p className="text-muted-foreground">
                      Watch how ResearchMind searches across multiple academic databases to find the most relevant
                      papers for your research topic.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=720&width=1280"
                      alt="Paper summary demo"
                      width={1280}
                      height={720}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 flex items-center justify-center"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 bg-card">
                    <h3 className="text-xl font-semibold mb-2">AI-Powered Paper Summaries</h3>
                    <p className="text-muted-foreground">
                      See how ResearchMind analyzes and summarizes complex research papers in seconds, extracting key
                      findings and methodologies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=720&width=1280"
                      alt="Research chat demo"
                      width={1280}
                      height={720}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 flex items-center justify-center"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 bg-card">
                    <h3 className="text-xl font-semibold mb-2">Interactive Research Assistant</h3>
                    <p className="text-muted-foreground">
                      Experience how our AI research assistant answers your questions, explains complex concepts, and
                      helps you explore research topics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const values = ["search", "summary", "chat"]
                const currentIndex = values.indexOf(activeDemo)
                const prevIndex = (currentIndex - 1 + values.length) % values.length
                setActiveDemo(values[prevIndex])
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const values = ["search", "summary", "chat"]
                const currentIndex = values.indexOf(activeDemo)
                const nextIndex = (currentIndex + 1) % values.length
                setActiveDemo(values[nextIndex])
              }}
            >
              Next <SkipForward className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </Tabs>
      </div>
    </section>
  )
}
