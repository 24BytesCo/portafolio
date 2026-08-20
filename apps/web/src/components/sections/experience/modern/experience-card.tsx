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
  // Derivar nombre de empresa y ubicación si vienen unidos por guion o raya
  const segments = company.split(/—|–| - | -|-/);
  const companyTitle = segments[0]?.trim() || company;
  const location =
    segments.length > 1 ? segments.slice(1).join(" - ").trim() : undefined;

  return (
    <Card
      className={cn(
        "bg-background/80 flex min-h-full flex-col justify-between rounded-3xl border shadow-md backdrop-blur",
        className,
      )}
    >
      <CardContent className="p-6 md:p-8">
        {/* Encabezado: logo + empresa + meta */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {logo ? (
              <Image
                src={logo}
                alt={`${companyTitle} logo`}
                width={130}
                height={130}
                unoptimized
                className="h-auto w-[130px] rounded-md object-contain grayscale transition hover:grayscale-0"
              />
            ) : null}
            <div className="flex min-w-0 flex-col">
              <TextReveal
                as="h3"
                className="truncate text-2xl font-semibold tracking-tight md:text-3xl"
              >
                {companyTitle}
              </TextReveal>
              {location ? (
                <TextReveal as="span" className="text-muted-foreground text-sm">
                  {location}
                </TextReveal>
              ) : null}
              <TextReveal
                as="span"
                className="text-muted-foreground text-xs font-medium"
              >
                {duration}
              </TextReveal>
            </div>
          </div>
        </div>

        <hr className="border-border my-5" />

        {/* Rol */}
        <TextReveal
          as="h4"
          className="text-2xl font-extrabold tracking-tight md:text-3xl"
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
              <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-800 marker:text-zinc-400 dark:text-zinc-300">
                {items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            );
          }
          return (
            <TextReveal
              as="p"
              className="mt-3 max-w-3xl text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-300"
            >
              {description}
            </TextReveal>
          );
        })()}
      </CardContent>
    </Card>
  );
}

export default ExperienceCard;
