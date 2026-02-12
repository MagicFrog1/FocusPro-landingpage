# Configuración de RevenueCat

Esta app utiliza RevenueCat para gestionar las suscripciones premium.

## Instalación

1. Instala el paquete de RevenueCat:
```bash
npm install react-native-purchases
```

2. Para iOS, instala también las dependencias nativas:
```bash
cd ios && pod install
```

## Configuración en RevenueCat Dashboard

1. Crea una cuenta en [RevenueCat](https://www.revenuecat.com/)
2. Crea un nuevo proyecto
3. Configura los productos de suscripción en App Store Connect y Google Play Console:
   - `premium_monthly`: Suscripción mensual por 3,99€
   - `premium_annual`: Suscripción anual por 39,99€

4. En RevenueCat Dashboard:
   - Crea una Entitlement llamada `premium`
   - Asocia los productos `premium_monthly` y `premium_annual` a esta entitlement

5. Obtén tus API Keys:
   - iOS API Key: En RevenueCat Dashboard > Project Settings > API Keys
   - Android API Key: En RevenueCat Dashboard > Project Settings > API Keys

6. Actualiza `FumoBye/services/revenuecat.ts` con tus API Keys:
```typescript
const API_KEYS = {
  ios: 'tu_ios_api_key_aqui',
  android: 'tu_android_api_key_aqui',
};
```

## Uso en la App

El servicio de RevenueCat está preparado en `FumoBye/services/revenuecat.ts`. Para activar las compras reales:

1. Descomenta el código en `FumoBye/app/premium.tsx` dentro de la función `handlePurchase`
2. Asegúrate de inicializar RevenueCat en `FumoBye/app/_layout.tsx` o en el componente principal:
```typescript
import { initializeRevenueCat } from '@/services/revenuecat';

useEffect(() => {
  initializeRevenueCat().catch(console.error);
}, []);
```

## Productos Configurados

- **Mensual**: 3,99€/mes
- **Anual**: 39,99€/año (equivalente a 3,33€/mes, ahorra 17%)

## Notas

- Por ahora, la app funciona en modo demo (activa premium directamente sin compra real)
- Para producción, descomenta el código de RevenueCat y configura las API keys
- Asegúrate de probar en dispositivos reales (las compras no funcionan en simuladores)

