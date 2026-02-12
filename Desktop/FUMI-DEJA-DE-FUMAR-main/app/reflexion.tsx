import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import {
  Heart,
  Lightbulb,
  Target,
  Sparkles,
  AlertCircle,
  Activity,
  Droplet,
  Wind,
  Phone,
  Music,
  BookOpen,
  TrendingUp,
  Calendar,
  Coins,
  CheckCircle2,
  Circle,
  Moon,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { useFumoBye } from '@/fumobye/store';
import type { FumoByeMood } from '@/fumobye/types';
import { formatMoneyFromCents } from '@/fumobye/utils';

type ConsejoItem = {
  texto: string;
  icon: LucideIcon;
};

const REFLEXION_CONTENT: Record<
  FumoByeMood,
  {
    title: string;
    icon: string;
    subtitle: string;
    color: string;
    consejos: ConsejoItem[];
    distracciones: ConsejoItem[];
    motivacion: string;
  }
> = {
  zen: {
    title: 'Estado Zen',
    icon: '◉',
    subtitle: '¡Perfecto! Mantén este ritmo',
    color: '#6BA87A',
    motivacion:
      'Estás en tu mejor momento. Tu cuerpo y mente están trabajando juntos para crear una nueva versión de ti. Cada respiración profunda que das ahora es más limpia, cada latido más fuerte. Este momento de calma es tu superpoder: úsalo para construir el futuro que mereces.',
    consejos: [
      {
        texto: 'Aprovecha esta energía: tu cuerpo está en modo reparación activa. Cada minuto sin fumar fortalece tus pulmones y tu sistema cardiovascular.',
        icon: Activity,
      },
      {
        texto: 'Hidrátate conscientemente. Tu cuerpo necesita agua limpia para limpiar las toxinas que se están eliminando. Bebe un vaso ahora mismo y siente cómo nutres cada célula.',
        icon: Droplet,
      },
      {
        texto: 'Mira tu ahorro crecer en tiempo real. Ese dinero no se está quemando en humo, se está transformando en libertad, salud y oportunidades.',
        icon: TrendingUp,
      },
      {
        texto: 'Conecta con alguien cercano. Compartir tu progreso no es presumir, es inspirar. Tu historia puede cambiar la de otra persona.',
        icon: Heart,
      },
    ],
    distracciones: [
      {
        texto: 'Sal a caminar o correr. Siente cómo tu respiración mejora día a día. Cada paso es una victoria sobre el hábito anterior.',
        icon: Wind,
      },
      {
        texto: 'Lee o escucha algo que te nutra. Tu mente necesita contenido positivo tanto como tu cuerpo necesita aire limpio.',
        icon: BookOpen,
      },
      {
        texto: 'Llama a alguien que te apoye. Las conexiones humanas genuinas son más poderosas que cualquier adicción.',
        icon: Phone,
      },
      {
        texto: 'Visualiza el capricho que te comprarás con tu ahorro. No es un sueño, es una realidad que estás construyendo ahora.',
        icon: Sparkles,
      },
    ],
  },
  ansioso: {
    title: 'Estado Ansioso',
    icon: '◐',
    subtitle: 'El mono es temporal, aguanta',
    color: '#B8A070',
    motivacion:
      'Este momento de incomodidad que sientes ahora es temporal. Tu cerebro está reajustándose, aprendiendo a vivir sin nicotina. La ansiedad que sientes es la adicción desesperada intentando sobrevivir. Pero tú eres más fuerte. Piensa en todas las veces que ya has superado momentos difíciles. Esta es una más, y la estás ganando.',
    consejos: [
      {
        texto: 'Respira con intención: inhala 4 segundos, mantén 2, exhala 6. Repite 10 veces. Esta técnica activa tu sistema nervioso parasimpático y reduce la ansiedad.',
        icon: Wind,
      },
      {
        texto: 'El impulso dura máximo 15 minutos. Cuenta hacia atrás desde 100. Mientras cuentas, observa cómo el deseo se debilita. Tú eres el observador, no el impulso.',
        icon: AlertCircle,
      },
      {
        texto: 'Bebe agua fría lentamente. Siente cómo baja por tu garganta, cómo hidrata tu cuerpo. El acto de beber es una acción positiva que reemplaza el gesto de fumar.',
        icon: Droplet,
      },
      {
        texto: 'Recuerda tu "por qué". No es solo dejar de fumar, es recuperar tu salud, tu dinero, tu libertad, tu autoestima. Tu motivo es válido y poderoso.',
        icon: Lightbulb,
      },
    ],
    distracciones: [
      {
        texto: 'Muévete físicamente: 10 flexiones, 20 sentadillas, estiramientos. El movimiento libera endorfinas que combaten la ansiedad mejor que cualquier cigarro.',
        icon: Activity,
      },
      {
        texto: 'Haz algo productivo: lava platos, ordena un cajón, organiza tu espacio. La acción física redirige tu energía mental.',
        icon: Target,
      },
      {
        texto: 'Pon música que te eleve y canta o baila. El sonido y el movimiento son herramientas poderosas para cambiar tu estado emocional.',
        icon: Music,
      },
      {
        texto: 'Escribe tres cosas por las que estás agradecido hoy. La gratitud cambia la química de tu cerebro hacia estados más positivos.',
        icon: Sparkles,
      },
    ],
  },
  rojo: {
    title: 'Mono Intenso',
    icon: '▲',
    subtitle: 'STOP. Tú puedes con esto',
    color: '#C88A7A',
    motivacion:
      '¡ALTO! Detente ahora mismo. Este es el momento crítico donde se separan quienes lo logran de quienes no. Mira tu progreso: días ganados, dinero ahorrado, salud recuperándose. ¿Vas a tirar TODO eso por 5 minutos de falso alivio? NO. El tabaco no te va a ayudar, solo va a empeorar las cosas. Tú ya has demostrado que puedes hacer esto. Aguanta 5 minutos más. Luego otros 5. Eres más fuerte que este momento.',
    consejos: [
      {
        texto: 'URGENTE: El mono es una ola que pasa. Cuenta hasta 100 despacio. Mientras cuentas, el impulso se debilita. Tú eres más grande que cualquier ola.',
        icon: AlertCircle,
      },
      {
        texto: 'Mira tu ahorro exacto en este momento. Ese dinero representa horas de trabajo, sueños que puedes cumplir. ¿Un cigarro vale más que eso? NO.',
        icon: Coins,
      },
      {
        texto: 'Visualiza cómo te sentirás dentro de 30 minutos si NO fumas: orgulloso, fuerte, victorioso. Ahora visualiza cómo te sentirías si fumas: decepcionado, débil, derrotado. Elige la primera opción.',
        icon: Lightbulb,
      },
      {
        texto: 'El tabaco es una mentira. No te relaja, no te ayuda, no te da nada. Solo te quita: salud, dinero, respeto propio. No caigas en la trampa.',
        icon: Heart,
      },
    ],
    distracciones: [
      {
        texto: 'DUCHA FRÍA AHORA. El agua fría activa tu sistema nervioso y corta el impulso inmediatamente. Es tu reset de emergencia.',
        icon: Droplet,
      },
      {
        texto: 'Sal a caminar sin dinero ni tarjeta. Sin forma de comprar tabaco, tu mente se rendirá al impulso más rápido. Camina 10 minutos, cuenta tus pasos.',
        icon: Activity,
      },
      {
        texto: 'Llama a alguien AHORA. Di en voz alta: "Estoy teniendo un momento difícil y necesito hablar". Hablar rompe el aislamiento que la adicción necesita.',
        icon: Phone,
      },
      {
        texto: 'Escribe en un papel: "NO voy a fumar porque..." y completa la frase con todas tus razones. Leer tus propias palabras es poderoso.',
        icon: Target,
      },
    ],
  },
};

// Consejos adicionales para cada estado de ánimo
const EXTRA_CONSEJOS: Record<FumoByeMood, ConsejoItem[][]> = {
  zen: [
    [
      { texto: 'Celebra este momento. Tómate unos minutos para reconocer lo lejos que has llegado. Eres más fuerte de lo que pensabas.', icon: Sparkles },
      { texto: 'Planifica tu próximo capricho con el dinero que estás ahorrando. Visualizar la recompensa refuerza tu motivación.', icon: Target },
      { texto: 'Medita o haz ejercicios de respiración profunda. Aprovecha esta calma para fortalecer tu mente.', icon: Wind },
      { texto: 'Comparte tu logro con alguien especial. Celebrar juntos multiplica la alegría del momento.', icon: Heart },
    ],
    [
      { texto: 'Haz ejercicio ligero: caminar, yoga o estiramientos. Tu cuerpo está listo para moverse con más energía.', icon: Activity },
      { texto: 'Organiza tu espacio personal. Un entorno ordenado refleja tu mente clara y libre de adicciones.', icon: Target },
      { texto: 'Escribe un mensaje de gratitud a tu yo futuro. Te lo agradecerás más adelante.', icon: BookOpen },
      { texto: 'Disfruta de una comida saludable. Tu paladar está recuperando sensibilidad, saborea cada bocado.', icon: Heart },
    ],
    [
      { texto: 'Crea una lista de actividades que siempre quisiste hacer pero el tabaco te impedía. Empieza por una hoy.', icon: Target },
      { texto: 'Respira hondo 10 veces. Cada respiración es más limpia que la anterior, siente la diferencia.', icon: Wind },
      { texto: 'Revisa tus objetivos personales. Este estado de claridad es perfecto para planificar tu futuro.', icon: Lightbulb },
      { texto: 'Conecta con la naturaleza. Un paseo al aire libre refuerza lo bien que te sientes sin tabaco.', icon: Sparkles },
    ],
  ],
  ansioso: [
    [
      { texto: 'Haz la técnica 4-7-8: inhala 4, mantén 7, exhala 8. Repite 4 veces. Esto activa tu sistema de relajación.', icon: Wind },
      { texto: 'Bebe agua fresca lentamente. El acto consciente de beber reemplaza el ritual del cigarro.', icon: Droplet },
      { texto: 'Escribe tus pensamientos ansiosos en un papel. Verlos escritos los hace más manejables.', icon: BookOpen },
      { texto: 'Recuerda que la ansiedad es temporal. Cada minuto que pasa, estás más cerca de superarla.', icon: AlertCircle },
    ],
    [
      { texto: 'Haz ejercicio ligero: 20 saltos, estiramientos o caminar en el sitio. El movimiento quema la energía de ansiedad.', icon: Activity },
      { texto: 'Llama a un amigo o familiar. Hablar distrae y conecta con el apoyo emocional que necesitas.', icon: Phone },
      { texto: 'Cierra los ojos y visualiza un lugar tranquilo. Usa todos tus sentidos para imaginarlo vívidamente.', icon: Sparkles },
      { texto: 'Haz una lista de 5 cosas que puedes controlar ahora mismo. Enfócate en ellas, no en la ansiedad.', icon: Target },
    ],
    [
      { texto: 'Tómate un momento para masajear tus manos y cuello. El contacto físico calma el sistema nervioso.', icon: Heart },
      { texto: 'Pon música relajante o sonidos de naturaleza. El audio puede cambiar tu estado mental rápidamente.', icon: Music },
      { texto: 'Haz algo manual: dibujar, escribir, organizar. La actividad manual ocupa la mente y las manos.', icon: BookOpen },
      { texto: 'Recuerda: este impulso pasará. Ya has sobrevivido a muchos antes. Este es solo uno más.', icon: AlertCircle },
    ],
  ],
  rojo: [
    [
      { texto: 'PARA TODO. Cuenta hasta 60 lentamente. Si el impulso sigue, cuenta hasta 120. El tiempo es tu aliado.', icon: AlertCircle },
      { texto: 'Mira tu pantalla de ahorro. Ese número representa tu esfuerzo. ¿Un cigarro lo vale? Definitivamente NO.', icon: Coins },
      { texto: 'Haz 10 flexiones o sentadillas AHORA. El ejercicio intenso corta el impulso de forma inmediata.', icon: Activity },
      { texto: 'Escribe "NO" 20 veces en un papel. Leer tu propia negativa fortalece tu decisión.', icon: Target },
    ],
    [
      { texto: 'DUCHA FRÍA. Si puedes, date una ducha de agua fría de 30 segundos. Esto resetea tu sistema nervioso.', icon: Droplet },
      { texto: 'Sal de donde estás. Cambiar de entorno rompe la asociación con el hábito. Camina 5 minutos mínimo.', icon: Activity },
      { texto: 'Llama a alguien AHORA mismo. Di: "Estoy en un momento difícil, necesito hablar 5 minutos". No estás solo.', icon: Phone },
      { texto: 'Visualiza la decepción que sentirías si fumaras. Ahora visualiza el orgullo si resistes. Elige el orgullo.', icon: Lightbulb },
    ],
    [
      { texto: 'El tabaco NO te ayudará. Solo empeorará las cosas. Esto es tu adicción hablando, no tu voz real.', icon: Heart },
      { texto: 'Mira cuántos días llevas sin fumar. No tires eso por un momento difícil. Eres más fuerte que esto.', icon: Calendar },
      { texto: 'Haz una actividad que requiera ambas manos: cocinar, escribir, construir algo. Ocupa tu cuerpo completamente.', icon: Target },
      { texto: 'Este momento pasará en 15-20 minutos. Ya has aguantado más tiempo antes. Aguanta un poco más.', icon: AlertCircle },
    ],
  ],
};

export default function ReflexionScreen() {
  const params = useLocalSearchParams<{ mood: FumoByeMood; t?: string }>();
  const { savedCentsNow, daysSmokeFree, state } = useFumoBye();
  const mood = params.mood as FumoByeMood | undefined;
  const timestamp = params.t ? parseInt(params.t, 10) : Date.now();

  const content = useMemo(() => {
    if (!mood || !(mood in REFLEXION_CONTENT)) {
      return REFLEXION_CONTENT.ansioso;
    }
    const baseContent = REFLEXION_CONTENT[mood];
    const extraSets = EXTRA_CONSEJOS[mood];
    // Usar el timestamp para seleccionar un set diferente cada vez
    const selectedSet = extraSets[Math.floor(timestamp / 1000) % extraSets.length];
    
    // Mezclar consejos base con consejos adicionales
    const allConsejos = [...baseContent.consejos, ...selectedSet];
    const allDistracciones = [...baseContent.distracciones, ...selectedSet];
    
    // Usar el timestamp para seleccionar consejos de forma determinista pero variada
    const seed = Math.floor(timestamp / 10000) % 1000; // Cambia cada 10 segundos
    const consejoOffset = seed % allConsejos.length;
    const distraccionOffset = (seed * 2) % allDistracciones.length;
    
    // Rotar los arrays usando el offset
    const rotatedConsejos = [
      ...allConsejos.slice(consejoOffset),
      ...allConsejos.slice(0, consejoOffset)
    ];
    const rotatedDistracciones = [
      ...allDistracciones.slice(distraccionOffset),
      ...allDistracciones.slice(0, distraccionOffset)
    ];
    
    return {
      ...baseContent,
      consejos: rotatedConsejos.slice(0, 4),
      distracciones: rotatedDistracciones.slice(0, 4),
    };
  }, [mood, timestamp]);

  const ahorroTexto = formatMoneyFromCents(savedCentsNow, state.settings.currency);

  // Icono más representativo según el estado
  const getMoodIcon = () => {
    switch (mood) {
      case 'zen':
        return <CheckCircle2 size={48} color={content.color} strokeWidth={2.5} />;
      case 'ansioso':
        return <Moon size={48} color={content.color} strokeWidth={2.5} />;
      case 'rojo':
        return <AlertTriangle size={48} color={content.color} strokeWidth={2.5} />;
      default:
        return <Circle size={48} color={content.color} strokeWidth={2.5} />;
    }
  };

  return (
    <ZenScreen padded={false} variant="light">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: -10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}>
          <View style={styles.header}>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'timing', duration: 350, delay: 100 }}>
              <View style={[styles.iconContainer, { backgroundColor: `${content.color}15`, borderColor: `${content.color}30` }]}>
                {getMoodIcon()}
              </View>
            </MotiView>
            <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 350, delay: 200 }}>
              <ThemedText style={[styles.title, { color: '#1A1A1A' }]}>{content.title}</ThemedText>
            </MotiView>
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300, delay: 300 }}>
              <ThemedText style={styles.subtitle}>{content.subtitle}</ThemedText>
            </MotiView>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}>
          <View style={[styles.motivacionCard, { borderColor: `${content.color}20` }]}>
            <View style={styles.sectionHeader}>
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'timing', duration: 300, delay: 500 }}>
                <View style={[styles.sectionIcon, { backgroundColor: `${content.color}15` }]}>
                  <Sparkles size={18} color={content.color} strokeWidth={2} />
                </View>
              </MotiView>
              <ThemedText style={styles.motivacionTitle}>Motivación</ThemedText>
            </View>
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300, delay: 600 }}>
              <ThemedText style={styles.motivacionText}>{content.motivacion}</ThemedText>
            </MotiView>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 500 }}>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 300, delay: 650 }}>
                <View style={styles.statItem}>
                  <Calendar size={20} color={content.color} style={styles.statIcon} />
                  <ThemedText style={styles.statLabel}>Días sin fumar</ThemedText>
                  <ThemedText style={styles.statValue}>{daysSmokeFree}</ThemedText>
                </View>
              </MotiView>
              <View style={styles.statDivider} />
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 300, delay: 750 }}>
                <View style={styles.statItem}>
                  <Coins size={20} color={content.color} style={styles.statIcon} />
                  <ThemedText style={styles.statLabel}>Has ahorrado</ThemedText>
                  <ThemedText style={styles.statValue}>{ahorroTexto}</ThemedText>
                </View>
              </MotiView>
            </View>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 800 }}>
          <View style={[styles.card, { borderColor: `${content.color}15` }]}>
            <View style={styles.sectionHeader}>
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'timing', duration: 300, delay: 900 }}>
                <View style={[styles.sectionIcon, { backgroundColor: `${content.color}15` }]}>
                  <Lightbulb size={18} color={content.color} strokeWidth={2} />
                </View>
              </MotiView>
              <ThemedText style={styles.sectionTitle}>Consejos para ti</ThemedText>
            </View>
            <View style={styles.list}>
              {content.consejos.map((consejo, i) => {
                const IconComponent = consejo.icon;
                return (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, translateX: -15 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 300, delay: 900 + i * 80 }}>
                    <View style={styles.listItem}>
                      <View style={[styles.iconWrapper, { backgroundColor: `${content.color}12` }]}>
                        <IconComponent size={18} color={content.color} strokeWidth={2} />
                      </View>
                      <ThemedText style={styles.listText}>{consejo.texto}</ThemedText>
                    </View>
                  </MotiView>
                );
              })}
            </View>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 1000 }}>
          <View style={[styles.card, { borderColor: `${content.color}15` }]}>
            <View style={styles.sectionHeader}>
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'timing', duration: 300, delay: 1100 }}>
                <View style={[styles.sectionIcon, { backgroundColor: `${content.color}15` }]}>
                  <Target size={18} color={content.color} strokeWidth={2} />
                </View>
              </MotiView>
              <ThemedText style={styles.sectionTitle}>Distráete con esto</ThemedText>
            </View>
            <View style={styles.list}>
              {content.distracciones.map((distraccion, i) => {
                const IconComponent = distraccion.icon;
                return (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, translateX: -15 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 300, delay: 1200 + i * 80 }}>
                    <View style={styles.listItem}>
                      <View style={[styles.iconWrapper, { backgroundColor: `${content.color}12` }]}>
                        <IconComponent size={18} color={content.color} strokeWidth={2} />
                      </View>
                      <ThemedText style={styles.listText}>{distraccion.texto}</ThemedText>
                    </View>
                  </MotiView>
                );
              })}
            </View>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 1400 }}>
          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              {
                borderColor: `${content.color}30`,
                backgroundColor: `${content.color}10`,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}>
            <ThemedText style={[styles.closeBtnText, { color: content.color }]}>Listo, sigo adelante</ThemedText>
          </Pressable>
        </MotiView>
      </ScrollView>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerContent: { padding: 24, paddingTop: 80, paddingBottom: 40, gap: 24 },
  header: { alignItems: 'center', marginBottom: 16, gap: 14 },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    textAlign: 'center', 
    lineHeight: 40, 
    includeFontPadding: false, 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(0, 0, 0, 0.6)', 
    textAlign: 'center', 
    fontWeight: '500', 
    lineHeight: 22 
  },
  motivacionCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivacionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1A1A1A', 
    letterSpacing: -0.3, 
    lineHeight: 26, 
    includeFontPadding: false 
  },
  motivacionText: { 
    fontSize: 15, 
    lineHeight: 24, 
    color: 'rgba(0, 0, 0, 0.75)', 
    fontWeight: '500' 
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { 
    fontSize: 13, 
    color: 'rgba(0, 0, 0, 0.6)', 
    marginBottom: 8, 
    fontWeight: '600', 
    lineHeight: 18 
  },
  statValue: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#1A1A1A', 
    lineHeight: 34, 
    includeFontPadding: false 
  },
  statDivider: { 
    width: 1, 
    height: 50, 
    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
    marginHorizontal: 20 
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1A1A1A', 
    letterSpacing: -0.3, 
    lineHeight: 26, 
    includeFontPadding: false 
  },
  list: { gap: 16 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  listText: { 
    flex: 1, 
    fontSize: 15, 
    lineHeight: 24, 
    color: 'rgba(0, 0, 0, 0.75)', 
    fontWeight: '500', 
    paddingTop: 2 
  },
  statIcon: { marginBottom: 8 },
  closeBtn: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    marginTop: 8,
  },
  closeBtnText: { 
    fontSize: 17, 
    fontWeight: '800', 
    letterSpacing: -0.2, 
    lineHeight: 22, 
    includeFontPadding: false 
  },
});

