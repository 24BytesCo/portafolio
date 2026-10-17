"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Video de YouTube con carga diferida: hasta que no se pulsa, la página solo
 * trae una imagen local. El iframe de YouTube arrastra cerca de un megabyte
 * y varias peticiones a terceros, así que montarlo de entrada hundiría el
 * rendimiento de un artículo que se lee, no se ve.
 */
export function VideoYouTube({
  id,
  titulo,
  miniatura,
  pie,
  ancho = 1280,
  alto = 720,
}: {
  id: string;
  titulo: string;
  miniatura: string;
  pie?: string;
  ancho?: number;
  alto?: number;
}) {
  const [activo, setActivo] = useState(false);

  return (
    <figure className="figura video-yt">
      <div className="figura-marco video-yt-marco">
        {activo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={titulo}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivo(true)}
            aria-label={`Reproducir el video: ${titulo}`}
          >
            <Image
              src={miniatura}
              alt=""
              width={ancho}
              height={alto}
              sizes="(min-width: 1024px) 880px, 100vw"
            />
            <span className="video-yt-play" aria-hidden="true">
              <svg viewBox="0 0 68 48" width="68" height="48">
                <path
                  d="M66.5 7.7a8.6 8.6 0 0 0-6-6C55.2 0 34 0 34 0S12.8 0 7.5 1.6a8.6 8.6 0 0 0-6 6A89.6 89.6 0 0 0 0 24a89.6 89.6 0 0 0 1.5 16.3 8.6 8.6 0 0 0 6 6C12.8 48 34 48 34 48s21.2 0 26.5-1.7a8.6 8.6 0 0 0 6-6A89.6 89.6 0 0 0 68 24a89.6 89.6 0 0 0-1.5-16.3z"
                  fill="#f00"
                />
                <path d="M27 34V14l18 10z" fill="#fff" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {pie ? <figcaption>{pie}</figcaption> : null}
    </figure>
  );
}
