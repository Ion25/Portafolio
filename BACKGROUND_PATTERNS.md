# Patrones de Fondo para la Sección Hero

Este archivo documenta los diferentes patrones de fondo disponibles para la sección hero del portafolio.

## Patrones Disponibles

### 1. `hero-pattern` (Actual)
**Características:**
- Círculos pequeños y grandes
- Líneas diagonales suaves
- Líneas horizontales muy sutiles
- Múltiples capas para mayor textura

**Uso:**
```tsx
<section className="bg-gradient-to-b from-gray-50 to-gray-100 hero-pattern py-20">
```

### 2. `hero-pattern-minimal` 
**Características:**
- Patrón más limpio y minimalista
- Solo puntos y líneas básicas
- Ideal para un look más profesional

**Uso:**
```tsx
<section className="bg-gradient-to-b from-gray-50 to-gray-100 hero-pattern-minimal py-20">
```

### 3. `hero-pattern-hex`
**Características:**
- Patrón hexagonal sutil
- Inspirado en diseños técnicos
- Perfecto para perfiles de desarrolladores

**Uso:**
```tsx
<section className="bg-gradient-to-b from-gray-50 to-gray-100 hero-pattern-hex py-20">
```

## Cómo Cambiar el Patrón

1. Ve al archivo `src/app/page.tsx`
2. Busca la sección hero (línea ~42)
3. Reemplaza `hero-pattern` con cualquiera de los patrones disponibles:
   - `hero-pattern` (actual)
   - `hero-pattern-minimal`
   - `hero-pattern-hex`

## Personalización

Los patrones utilizan `rgba(156, 163, 175, opacity)` para mantener consistencia con el tema gris.

Para modificar la intensidad:
- Aumenta la opacidad para patrones más visibles
- Disminúyela para patrones más sutiles
- Valores recomendados: 0.03 - 0.15

## Colores Base

- `rgba(156, 163, 175, X)` = Gray-400 de Tailwind
- Las opacidades van de 0.03 a 0.15 para mantener sutileza