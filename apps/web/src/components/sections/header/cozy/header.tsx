"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { metadata as meta } from "@/app/config";
import MotionLink from "@/components/fancy/link";
import { links } from "@/components/sections/header/config";
import { AnimatePresence, motion } from "motion/react";

import { background, opacity } from "./anim";
import Nav from "./nav";
import styles from "./style.module.scss";

const Header = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isActive) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isActive]);

  // Escape cierra el menú sin importar dónde esté el foco
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsActive(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return (
    <motion.header
      className={styles.header}
      initial={{
        y: -80,
      }}
      animate={{
        y: 0,
      }}
      transition={{
        duration: 0.8,
      }}
    >
      <div className={styles.bar}>
        <MotionLink
          href="/"
          className="text-md inline-flex items-center justify-center font-semibold"
        >
          {meta.author.name}
        </MotionLink>
        {/* Navegación visible en escritorio: sin ella el único enlace del
            encabezado era el logo y no se veía qué secciones existen. */}
        <nav
          aria-label="Navegación principal"
          className="mr-8 hidden items-center gap-6 md:flex"
        >
          {links.map((link) => {
            const activo =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activo ? "page" : undefined}
                className={`inline-flex items-center py-2 underline-offset-8 transition-colors hover:underline ${
                  activo
                    ? "underline decoration-2"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {link.title}
              </Link>
            );
          })}
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-zinc-950 px-4 py-2 font-medium text-zinc-50 transition-opacity hover:opacity-80 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Hablemos
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={styles.el}
          aria-expanded={isActive}
          aria-controls="cozy-nav-menu"
          aria-label={isActive ? "Cerrar menú" : "Abrir menú"}
        >
          <div className={styles.label} aria-hidden="true">
            <motion.p
              variants={opacity}
              animate={!isActive ? "open" : "closed"}
            >
              Menú
            </motion.p>
            <motion.p variants={opacity} animate={isActive ? "open" : "closed"}>
              Cerrar
            </motion.p>
          </div>
          <div
            className={`${styles.burger} ${isActive ? styles.burgerActive : ""}`}
          ></div>
        </button>
      </div>
      <motion.div
        variants={background}
        initial="initial"
        animate={isActive ? "open" : "closed"}
        className={styles.background}
      ></motion.div>
      <AnimatePresence mode="wait">
        {isActive && <Nav setIsActive={setIsActive} />}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
