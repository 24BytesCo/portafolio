import type { Post } from "@/types/post";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import TextReveal from "@/components/fancy/text-reveal";
import { formatearFecha } from "@/lib/utils";

import { cn } from "@repo/ui";
import { AspectRatio } from "@repo/ui/aspect-ratio";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardFooter } from "@repo/ui/card";
import { Icons } from "@repo/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";

interface PostCardProps extends Post {
  href: string;
  thumbnail: string;
  className?: string;
}

function PostCard({
  title,
  description,
  href,
  thumbnail,
  date,
  className,
}: PostCardProps) {
  const displayDate = React.useMemo(() => {
    try {
      if (!date) return null;
      const d = date instanceof Date ? date : new Date(date);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }, [date]);
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col justify-between border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900",
        className,
      )}
    >
      <CardContent>
        <div className="grid gap-2">
          <AspectRatio
            ratio={16 / 9}
            className="mb-2 inline-block overflow-hidden rounded-md"
          >
            <Image
              src={thumbnail || "/placeholder.svg"}
              alt={`Portada de ${title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </AspectRatio>
          <TextReveal as="h3" className="text-xl font-bold">
            {title}
          </TextReveal>
          <TextReveal
            as="p"
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {description ?? ""}
          </TextReveal>
          <TextReveal
            as="p"
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {displayDate ? formatearFecha(displayDate) : ""}
          </TextReveal>
          {/* <div className="mt-2 flex flex-wrap gap-2">
            {tags?.map((tag, index) => (
              <Badge key={`project-tag_${index}`}>{tag.label}</Badge>
            ))}
          </div> */}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="z-2 rounded-md border border-zinc-950/10 dark:border-zinc-50/10"
                asChild
              >
                <Link href={href} aria-label={`Leer entrada: ${title}`}>
                  <Icons.info />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Más detalles</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
      <Link
        href={href}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-1 block"
      />
    </Card>
  );
}

export default PostCard;
