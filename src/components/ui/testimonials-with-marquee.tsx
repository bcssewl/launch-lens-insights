
import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "apple-section bg-gray-200/80 dark:bg-gray-900/95",
      className
    )}>
      <div className="apple-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            {title}
          </h2>
          <p className="apple-subheading">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:2rem] [gap:var(--gap)] flex-row [--duration:50s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(4)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                    className="apple-card"
                  />
                ))
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "Launch Lens transformed how we validate ideas. The AI insights are incredibly accurate and saved us months of guesswork.",
    href: "https://twitter.com/emmaai"
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "We avoided a costly mistake thanks to Launch Lens. The market analysis showed us why our initial approach wouldn't work.",
    href: "https://twitter.com/davidtech"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "Finally, a validation tool that actually works. The detailed reports give you everything you need to make informed decisions."
  }
]

export function TestimonialsSectionDemo() {
  return (
    <TestimonialsSection
      title="Trusted by developers worldwide"
      description="Join thousands of founders who validate smarter, not harder"
      testimonials={testimonials}
    />
  )
}
