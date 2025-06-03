
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
        "glass-card-3d hover-lift-premium floating",
        "flex flex-col p-8 text-start",
        "max-w-[380px] sm:max-w-[380px]",
        "transition-all duration-500",
        "bg-white/5 backdrop-blur-xl border border-white/20",
        "shadow-2xl",
        href && "cursor-pointer hover:bg-white/10",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">
            {author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-bold leading-none font-heading text-foreground">
            {author.name}
          </h3>
          <p className="text-sm text-primary mt-1 font-medium">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="text-muted-foreground italic leading-relaxed text-lg">
        "{text}"
      </p>
    </Card>
  )
}
