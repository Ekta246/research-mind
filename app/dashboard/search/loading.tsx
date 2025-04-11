import { MagnifyingAnimation } from "@/components/ui/magnifying-animation"

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <MagnifyingAnimation size="lg" text="Searching academic databases" />
    </div>
  )
}
