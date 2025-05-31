
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "glassmorphism-card hover-lift hover-glow",
        "flex flex-col p-6 text-start",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-all duration-300",
        "border border-border/20",
        "bg-card/50 backdrop-blur-sm",
        href && "cursor-pointer hover:bg-card/70",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none font-heading text-foreground">
            {author.name}
          </h3>
          <p className="text-sm text-primary">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground italic leading-relaxed">
        "{text}"
      </p>
    </Card>
  )
}
