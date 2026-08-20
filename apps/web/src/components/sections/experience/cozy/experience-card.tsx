import type { Experience } from "@/types/experience";
import Image from "next/image";
import TextReveal from "@/components/fancy/text-reveal";

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
  highlights,
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
                width={28}
                height={28}
                unoptimized
                className="h-7 w-7 rounded-sm object-contain grayscale transition hover:grayscale-0"
              />
            ) : null}
            <TextReveal
              as="h3"
              className="text-lg font-semibold tracking-tight"
            >
              {company}
            </TextReveal>
          </div>
          <TextReveal
            as="span"
            className="text-muted-foreground text-xs font-medium"
          >
            {duration}
          </TextReveal>
        </div>
        <TextReveal
          as="h4"
          className="mt-3 text-2xl font-semibold tracking-tight"
        >
          {name}
        </TextReveal>
        {(() => {
          const items = highlights?.length
            ? highlights
            : description?.includes(";")
              ? description
                  .split(";")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined;
          if (items?.length) {
            return (
              <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 marker:text-zinc-400 dark:text-zinc-400">
                {items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            );
          }
          return (
            <TextReveal
              as="p"
              className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-400"
            >
              {description}
            </TextReveal>
          );
        })()}
        <hr className="border-border my-6 border-t" />
      </CardContent>
    </Card>
  );
}

export default ExperienceCard;
