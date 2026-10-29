# Caio Pacheco — Portfolio

Portfólio pessoal premium, construído com Next.js (App Router), TypeScript, Tailwind CSS, GSAP, Lenis e Framer Motion. i18n completo (PT/EN) via next-intl.

## Rodando localmente

```bash
npm run dev
```

Abra [http://localhost:3000/pt](http://localhost:3000/pt) ou [http://localhost:3000/en](http://localhost:3000/en).

## Estrutura

- `app/[locale]/` — rotas (home, `/projetos`, `/projetos/[slug]`), com pathnames localizados via next-intl.
- `components/ui/` — componentes genéricos reutilizáveis.
- `components/layout/` — navbar, footer, smooth scroll provider.
- `components/sections/` — uma seção da home por arquivo.
- `components/ui/BeamFooter.tsx` — rodapé com feixe de luz e o nome gigante, letra por letra (estilos `bwf-*` em `app/globals.css`; conteúdo em `components/layout/Footer.tsx`).
- `components/sections/Testimonials.tsx` + `components/ui/Marquee.tsx` — mural 3D de depoimentos (estilos `tm-*`); novos depoimentos entram na lista `TESTIMONIALS`, no topo do arquivo.
- `lib/credentials.ts` — formação e certificados (faixa "Formação e certificações", dentro do "Sobre mim": `components/sections/CredentialsStrip.tsx`). Só dados públicos: curso, instituição, data e carga horária. **Nunca** adicione os PDFs ao projeto: eles trazem CPF, RG e outros números de documento.
- `lib/projects.ts` — dados dos projetos (bilíngue). Os campos do estudo de caso são opcionais: a página só mostra o que existe.
  Projetos feitos em equipe levam `credit` (hoje, a Forja Studio): ganham a observação "em equipe" no card e na página, com link para o
  portfólio da Forja (`FORJA_PORTFOLIO_URL` em `lib/constants.ts`).
- `messages/{pt,en}.json` — strings de UI.

## Processo (3D guiado pelo scroll)

A seção "Meu Processo" é um palco `sticky` com ~5 telas de altura: o scroll é a linha do tempo. Um núcleo de metal
líquido percorre as 5 etapas (briefing, gema, esfera polida, cubo com grade e o "ponto" da marca) enquanto o texto
muda ao redor. Tudo em WebGL2 puro, sem dependências novas. O hero (primeira tela) é a foto, com o nome grande embaixo.

- `components/sections/Process.tsx` — DOM, loop de scroll, interação (arrastar, clicar, cursor) e o texto de cada etapa.
- `lib/process-scene/` — a cena: `geometry` (malhas), `shaders`, `renderer`, `ring-texture` (inscrição do anel),
  `frames` (keyframes do scroll, em `KEYS`) e `layout` (mede o texto e acha o maior espaço livre para o objeto).
- Textos: `process.steps` e `process.scene` em `messages/{pt,en}.json`. Scroll por etapa: `SCENE_SCROLL` em `Process.tsx`.
- `prefers-reduced-motion` desliga rotação ociosa, ponteiro e transformações; a cor de destaque vem de `--color-accent`.

## Build de produção

```bash
npm run build
npm run start
```
