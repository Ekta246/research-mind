"use client"

import { useState } from "react"
import { Upload, File, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

export default function UploadPaperPage() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [abstract, setAbstract] = useState("")
  const [tags, setTags] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validate file types (PDF only)
    const validFiles = selectedFiles.filter(file => 
      file.type === "application/pdf"
    )
    
    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are allowed",
        variant: "destructive"
      })
    }
    
    setFiles(validFiles)
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one PDF file to upload",
        variant: "destructive"
      })
      return
    }
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the paper",
        variant: "destructive"
      })
      return
    }
    
    // Start upload
    setIsUploading(true)
    setUploadProgress(0)
    
    // For development/demo, we'll simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const increment = Math.random() * 10;
        const newValue = prev + increment;
        return newValue >= 100 ? 99 : newValue; // Stop at 99% until actually complete
      })
    }, 300)
    
    try {
      // Process each file
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', title)
        formData.append('authors', authors)
        formData.append('abstract', abstract)
        formData.append('tags', tags)
        
        // Make API request
        const response = await fetch('/api/papers/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }
        
        const data = await response.json()
        console.log('Upload success:', data)
      }
      
      // Complete progress and show success
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setFiles([])
        setTitle("")
        setAuthors("")
        setAbstract("")
        setTags("")
        
        toast({
          title: "Upload successful",
          description: `${files.length} paper${files.length > 1 ? 's' : ''} uploaded successfully`,
          variant: "default"
        })
      }, 1000)
      
    } catch (error) {
      console.error('Upload error:', error)
      clearInterval(progressInterval)
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
      
      setIsUploading(false)
    }
  }
  
  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Papers</h1>
          <p className="text-muted-foreground">
            Upload research papers to your library for AI analysis and organization (8 papers in library)
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="paper-file">Paper File (PDF)</Label>
                <div 
                  className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById("paper-file")?.click()}
                >
                  <Input 
                    id="paper-file" 
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    disabled={isUploading}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">
                      {files.length > 0 
                        ? `${files.length} file${files.length > 1 ? 's' : ''} selected` 
                        : 'Drag and drop or click to upload'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">PDF files only (max 20MB)</p>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <File className="h-4 w-4" />
                        {file.name}
                        <span className="text-muted-foreground text-xs">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Paper title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="authors">Authors</Label>
                <Input 
                  id="authors" 
                  placeholder="Author names (comma separated)" 
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea 
                  id="abstract" 
                  placeholder="Paper abstract" 
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input 
                  id="tags" 
                  placeholder="Tags (comma separated)" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Paper
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Tips</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Ensure the paper is in PDF format and under 20MB</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Adding detailed metadata helps organize your papers better</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Use tags to categorize papers for easier searching</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <span>Processing PDFs may take a few minutes for extraction and analysis</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 