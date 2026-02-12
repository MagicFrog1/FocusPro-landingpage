# 📊 Cálculo de Parámetros de Progreso - FumoBye

Este documento explica detalladamente cómo se calculan todos los parámetros de progreso en la aplicación FumoBye.

## 📅 1. Días Libres de Tabaco (daysSmokeFree)

### Cálculo:
```typescript
daysSmokeFree = Math.floor((nowTs - smokeFreeStartTs) / DAY_MS) + 1
```

**Donde:**
- `nowTs`: Timestamp actual (milisegundos)
- `smokeFreeStartTs`: Timestamp cuando el usuario dejó de fumar (almacenado en `state.progress.smokeFreeStartTs`)
- `DAY_MS`: Constante = 24 * 60 * 60 * 1000 = 86,400,000 ms (1 día en milisegundos)
- Se suma `+1` para incluir el día actual

**Ejemplo:**
- Si dejaste de fumar el 1 de enero a las 10:00 AM (timestamp: 1704110400000)
- Y hoy es 5 de enero a las 3:00 PM (timestamp: 1704460800000)
- Diferencia: 1704460800000 - 1704110400000 = 35,040,000 ms
- Días: 35,040,000 / 86,400,000 = 0.405 días
- `daysSmokeFree = Math.floor(0.405) + 1 = 1 día`

**Ubicación:** `fumobye/store.tsx` línea 181-184

---

## 💰 2. Ahorro Acumulado (savedCentsNow)

### Cálculo paso a paso:

#### Paso 1: Calcular gasto diario
```typescript
packsPerDay = cigsPerDay / cigsPerPack
dailySpendCents = packsPerDay * packPriceCents
```

**Ejemplo:**
- Fumas 20 cigarrillos al día
- Cigarrillos por paquete: 20
- Precio del paquete: 500 céntimos (5€)
- `packsPerDay = 20 / 20 = 1 paquete/día`
- `dailySpendCents = 1 * 500 = 500 céntimos/día`

#### Paso 2: Calcular tasa por segundo
```typescript
rateCentsPerSecond = dailySpendCents / 86400
```

**Ejemplo:**
- `rateCentsPerSecond = 500 / 86400 = 0.005787 céntimos/segundo`
- Esto significa que cada segundo ahorras 0.005787 céntimos

#### Paso 3: Calcular ahorro acumulado
```typescript
deltaSeconds = (nowTs - baseAtTs) / 1000
savedCentsNow = baseCents + (deltaSeconds * rateCentsPerSecond)
```

**Donde:**
- `baseCents`: Ahorro base consolidado (se actualiza cuando cambian los settings)
- `baseAtTs`: Timestamp cuando se consolidó el ahorro base
- `deltaSeconds`: Segundos transcurridos desde la última consolidación

**Ejemplo:**
- Hace 3 días consolidaste 1500 céntimos como base
- Han pasado 259,200 segundos (3 días)
- `savedCentsNow = 1500 + (259200 * 0.005787) = 1500 + 1500 = 3000 céntimos = 30€`

**Ubicación:** 
- Cálculo de tasa: `fumobye/utils.ts` líneas 44-51
- Cálculo de ahorro: `fumobye/utils.ts` líneas 53-63
- Uso en store: `fumobye/store.tsx` líneas 164-175

---

## 🏥 3. Métricas de Salud (lungs, taste, oxygen, energy)

### Cálculo basado en días transcurridos:

Todas las métricas usan la función `calculateRealisticHealth()` que calcula un porcentaje de 0-100% basado en datos médicos reales.

#### 3.1. Función Pulmonar (lungs)

```typescript
hoursSinceQuit = elapsedDays * 24

if (hoursSinceQuit < 20/60) return 25%  // 20 minutos
if (elapsedDays < 2) return 25 + (elapsedDays / 2) * 5  // 25-30% en 2 días
if (elapsedDays < 14) return 30 + ((elapsedDays - 2) / 12) * 30  // 30-60% en 2 semanas
if (elapsedDays < 90) return 60 + ((elapsedDays - 14) / 76) * 25  // 60-85% en 3 meses
return 85 + ((elapsedDays - 90) / 365) * 15  // 85-100% en 1 año
```

**Curva de recuperación:**
- 20 minutos: 25%
- 2 días: 30%
- 2 semanas: 60%
- 3 meses: 85%
- 1 año: 100%

#### 3.2. Sentido del Gusto (taste)

```typescript
if (hoursSinceQuit < 20) return 20%
if (hoursSinceQuit < 48) return 20 + ((hoursSinceQuit - 20) / 28) * 40  // 20-60% en 48h
if (elapsedDays < 7) return 60 + ((elapsedDays - 2) / 5) * 25  // 60-85% en 1 semana
return 85 + ((elapsedDays - 7) / 30) * 15  // 85-100% en 1 mes
```

**Recuperación rápida:**
- 20 horas: 20%
- 48 horas: 60%
- 1 semana: 85%
- 1 mes: 100%

#### 3.3. Oxígeno en Sangre (oxygen)

```typescript
if (hoursSinceQuit < 20/60) return 70%  // 20 minutos
if (hoursSinceQuit < 12) return 70 + ((hoursSinceQuit - 20/60) / (12 - 20/60)) * 20  // 70-90% en 12h
if (elapsedDays < 3) return 90 + ((elapsedDays - 0.5) / 2.5) * 8  // 90-98% en 3 días
return 98 + ((elapsedDays - 3) / 7) * 2  // 98-100% en 1 semana
```

**Mejora inmediata:**
- 20 minutos: 70%
- 12 horas: 90%
- 3 días: 98%
- 1 semana: 100%

#### 3.4. Energía (energy)

```typescript
if (elapsedDays < 1) return 45%
if (elapsedDays < 3) return 45 + ((elapsedDays - 1) / 2) * 10  // 45-55% en 3 días
if (elapsedDays < 14) return 55 + ((elapsedDays - 3) / 11) * 25  // 55-80% en 2 semanas
if (elapsedDays < 90) return 80 + ((elapsedDays - 14) / 76) * 15  // 80-95% en 3 meses
return 95 + ((elapsedDays - 90) / 365) * 5  // 95-100% en 1 año
```

**Mejora gradual:**
- 1 día: 45%
- 3 días: 55%
- 2 semanas: 80%
- 3 meses: 95%
- 1 año: 100%

**Ubicación:** `app/(tabs)/progreso.tsx` líneas 24-66

---

## ⏰ 4. Vida Ganada (lifeMinutesTotal)

### Cálculo:

```typescript
cigsAvoidedTotal = elapsedDays * cigsPerDay
lifeMinutesTotal = cigsAvoidedTotal * 11
```

**Donde:**
- `cigsAvoidedTotal`: Total de cigarrillos evitados desde que dejaste de fumar
- `lifeMinutesTotal`: Minutos de vida ganados (cada cigarrillo reduce ~11 minutos de vida según estudios médicos)

**Ejemplo:**
- 10 días sin fumar
- 20 cigarrillos al día
- `cigsAvoidedTotal = 10 * 20 = 200 cigarrillos evitados`
- `lifeMinutesTotal = 200 * 11 = 2,200 minutos = 36.67 horas = 1.53 días`

**Ubicación:** `app/(tabs)/progreso.tsx` líneas 184-192

---

## 📈 5. Desarrollo de la Gráfica de Progreso

### Paso 1: Determinar puntos de datos

```typescript
// Si tiene menos de 2 días, mostramos puntos cada 6 horas
// Si tiene más días, mostramos puntos diarios
pointCount = daysSmokeFree < 2 
  ? Math.min(8, Math.max(4, Math.floor((elapsedMs / (6 * 60 * 60 * 1000)))))
  : Math.min(30, Math.max(7, daysSmokeFree))

intervalMs = daysSmokeFree < 2 ? 6 * 60 * 60 * 1000 : DAY_MS
```

**Lógica:**
- Primeros 2 días: puntos cada 6 horas (máximo 8 puntos, mínimo 4)
- Después: puntos diarios (máximo 30 puntos, mínimo 7)

### Paso 2: Generar timestamps históricos

```typescript
endTs = nowTs
earliestWanted = endTs - (pointCount - 1) * intervalMs
minTs = Math.min(endTs, Math.max(startTs, earliestWanted))

for (let i = 0; i < pointCount; i++) {
  ts = minTs + i * intervalMs
  if (ts > nowTs) break  // No mostrar puntos futuros
  // ... calcular datos para este punto
}
```

### Paso 3: Calcular ahorro histórico para cada punto

```typescript
savedCents = calcSavedCentsNow({
  baseCents: state.progress.baseCents,
  baseAtTs: state.progress.baseAtTs,
  nowTs: ts,  // Timestamp histórico, no el actual
  rateCentsPerSecond,
})
```

**Nota importante:** Se usa `calcSavedCentsNow` con el timestamp histórico, calculando cuánto había ahorrado en ese momento del pasado.

### Paso 4: Calcular salud histórica para cada punto

```typescript
historicalDays = Math.max(0, (ts - startTs) / DAY_MS)
health = calculateRealisticHealth(historicalDays, cigsPerDay, 'lungs')
```

### Paso 5: Normalizar datos para visualización

#### Para Ahorro (línea dorada):
```typescript
maxSavedCents = Math.max(1, ...points.map(p => p.savedCents))
minSavedCents = Math.min(...points.map(p => p.savedCents))

gold = points.map(p => ({
  timestamp: p.ts,
  value: maxSavedCents > minSavedCents
    ? ((p.savedCents - minSavedCents) / (maxSavedCents - minSavedCents)) * 100
    : 0
}))
```

**Normalización:** Se convierte el ahorro a un porcentaje 0-100% basado en el rango mínimo-máximo del período mostrado.

#### Para Salud (línea verde):
```typescript
green = points.map(p => ({
  timestamp: p.ts,
  value: p.health  // Ya está en porcentaje 0-100%
}))
```

**No necesita normalización:** La salud ya está calculada como porcentaje.

### Paso 6: Renderizado en gráfica

La gráfica muestra:
- **Eje X**: Timestamps (tiempo)
- **Eje Y**: Porcentajes 0-100%
- **Línea dorada**: Ahorro normalizado
- **Línea verde**: Salud pulmonar

**Ubicación:** `app/(tabs)/progreso.tsx` líneas 106-167

---

## 🔄 6. Consolidación de Ahorro (baseCents)

### ¿Cuándo se consolida?

El ahorro se consolida cuando:
1. **Se cambian los settings** (cigarrillos por día, precio del paquete, etc.)
2. **Se reinicia el progreso**

### Proceso:

```typescript
// Calcular ahorro actual antes del cambio
prevRate = calcRateCentsPerSecond(oldSettings)
currentSaved = calcSavedCentsNow({
  baseCents: oldBaseCents,
  baseAtTs: oldBaseAtTs,
  nowTs: Date.now(),
  rateCentsPerSecond: prevRate,
})

// Consolidar como nuevo base
newBaseCents = currentSaved
newBaseAtTs = Date.now()
newRate = calcRateCentsPerSecond(newSettings)
```

**Razón:** Si cambias de 20 a 10 cigarrillos al día, la tasa cambia. El ahorro acumulado hasta ese momento se guarda como base, y desde ahí se calcula con la nueva tasa.

**Ubicación:** `fumobye/store.tsx` líneas 240-257

---

## 📝 Resumen de Variables Clave

| Variable | Descripción | Ubicación |
|----------|-------------|-----------|
| `smokeFreeStartTs` | Timestamp cuando dejaste de fumar | `state.progress.smokeFreeStartTs` |
| `baseCents` | Ahorro base consolidado | `state.progress.baseCents` |
| `baseAtTs` | Timestamp de última consolidación | `state.progress.baseAtTs` |
| `rateCentsPerSecond` | Tasa de ahorro por segundo | Calculado en `store.tsx` |
| `daysSmokeFree` | Días consecutivos sin fumar | Calculado en `store.tsx` |
| `savedCentsNow` | Ahorro acumulado actual | Calculado en `store.tsx` |
| `elapsedDays` | Días transcurridos desde inicio | Calculado en componentes |

---

## 🎯 Ejemplo Completo

Supongamos que:
- Dejaste de fumar el **1 de enero a las 10:00 AM** (`smokeFreeStartTs = 1704110400000`)
- Fumabas **20 cigarrillos/día** a **5€/paquete** (500 céntimos)
- Hoy es **15 de enero a las 2:00 PM** (`nowTs = 1705328400000`)

**Cálculos:**
1. **Días libres:** `(1705328400000 - 1704110400000) / 86400000 = 14.1 días` → `14 + 1 = 15 días`
2. **Tasa:** `(20/20) * 500 / 86400 = 0.005787 céntimos/segundo`
3. **Ahorro:** Si `baseCents = 0` y `baseAtTs = smokeFreeStartTs`:
   - `deltaSeconds = (1705328400000 - 1704110400000) / 1000 = 1,218,000 segundos`
   - `savedCentsNow = 0 + (1218000 * 0.005787) = 7,049 céntimos = 70.49€`
4. **Salud pulmonar:** `elapsedDays = 14.1`
   - Está entre 14 y 90 días, fórmula: `60 + ((14.1 - 14) / 76) * 25 = 60.03%`
5. **Vida ganada:** `14.1 * 20 * 11 = 3,102 minutos = 51.7 horas = 2.15 días`

---

*Última actualización: Enero 2024*



