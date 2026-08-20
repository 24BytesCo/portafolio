import type { Experience } from "@/types/experience";
import Image from "next/image";

import { cn } from "@repo/ui";
import { Card, CardContent } from "@repo/ui/card";

interface ExperienceCardProps extends Experience {
  className?: string;
}

function ExperienceCard({
  company,
  name,
  duration,
  description,
  logo,
  className,
}: ExperienceCardProps) {
  return (
    <Card
      className={cn("bg-background/60 rounded-xl border shadow-sm", className)}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {logo ? (
              <Image
                src={logo}
                alt={`${company} logo`}
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 rounded-sm object-contain grayscale transition hover:grayscale-0"
              />
            ) : null}
            <h3 className="text-lg font-semibold tracking-tight">{company}</h3>
          </div>
          <span className="text-muted-foreground text-xs font-medium">
            {duration}
          </span>
        </div>
        <h4 className="mt-3 text-2xl font-semibold tracking-tight">{name}</h4>
        <p className="mt-3 text-sm leading-relaxed">{description}</p>
        <hr className="border-border my-6 border-t" />
      </CardContent>
    </Card>
  );
}

export default ExperienceCard;
