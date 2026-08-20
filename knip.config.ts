import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: [
    '**/fixtures/**',
    // Contenido MDX: lo consume content-collections por glob, no por import.
    'apps/web/content/**',
    // Convención de Next para MDX, se resuelve por nombre de archivo.
    'apps/web/mdx-components.tsx',
    // Scripts operativos que se lanzan a mano con node, no desde el código.
    'tooling/scripts/**'
  ],
  // Deuda heredada del template (variantes compact/cozy sin seleccionar,
  // dependencias sobrantes del starter). Se degrada a warning para que el
  // reporte siga saliendo en el log sin bloquear el CI; saldarla por partes.
  rules: {
    files: 'warn',
    dependencies: 'warn',
    devDependencies: 'warn',
    unlisted: 'warn',
    binaries: 'warn',
    exports: 'warn',
    types: 'warn',
    duplicates: 'warn'
  },
  ignoreDependencies: [
    'prettier-plugin-*',
    'sharp',
    // TailwindCSS v4 is not detectable currently
    'tailwindcss',
    // Can't detect `pnpm with-env tsx`
    'tsx'
  ],
  workspaces: {
    '.': {
      entry: ['turbo/generators/config.ts']
    },
    'apps/web': {
      entry: ['content-collections.ts']
    },
    'packages/emails': {
      // Tests con node:test; knip no los reconoce como entrada por sí solo.
      entry: ['src/*.test.ts']
    },
    'packages/eslint-config': {
      // @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/325
      ignoreDependencies: ['@eslint/config-inspector', 'eslint-plugin-tailwindcss']
    },
    'packages/ui': {
      // @see https://github.com/shadcn-ui/ui/issues/4792
      ignoreDependencies: ['@radix-ui/react-context', '@tailwindcss/typography']
    }
  }
}

export default config
