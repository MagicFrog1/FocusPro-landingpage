import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';

export default function TerminosScreen() {
  return (
    <ZenScreen variant="light">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Términos y Condiciones
          </ThemedText>
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.closeButton}>
            <X size={24} color="#5A3E33" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>1. Aceptación de los Términos</ThemedText>
          <ThemedText style={styles.text}>
            Al descargar, instalar o utilizar la aplicación Fumi, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, no debe utilizar la aplicación.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>2. Descripción del Servicio</ThemedText>
          <ThemedText style={styles.text}>
            Fumi es una aplicación móvil diseñada para ayudar a los usuarios a dejar de fumar mediante el seguimiento de su progreso, cálculo de ahorros y proporcionar información motivacional. La aplicación NO es un servicio médico y NO proporciona asesoramiento médico profesional.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>3. Información de Salud y Recomendaciones</ThemedText>
          <ThemedText style={styles.text}>
            <ThemedText style={styles.bold}>IMPORTANTE:</ThemedText> La información proporcionada en esta aplicación sobre salud y bienestar es únicamente informativa y educativa. No constituye asesoramiento médico, diagnóstico o tratamiento.
          </ThemedText>
          <ThemedText style={styles.text}>
            Las métricas de salud (función pulmonar, oxígeno en sangre, energía, etc.) son estimaciones basadas en datos científicos generales y NO deben considerarse como evaluaciones médicas precisas o diagnósticos.
          </ThemedText>
          <ThemedText style={styles.text}>
            <ThemedText style={styles.bold}>NO SOMOS MÉDICOS NI PROFESIONALES DE LA SALUD.</ThemedText> Siempre consulte con un médico u otro profesional de la salud calificado para cualquier asesoramiento médico, diagnóstico o tratamiento.
          </ThemedText>
          <ThemedText style={styles.text}>
            Si experimenta síntomas graves, dificultad para respirar, dolor en el pecho, o cualquier otro problema de salud, busque atención médica inmediata. No dependa de esta aplicación para emergencias médicas.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>4. Suscripciones Premium</ThemedText>
          <ThemedText style={styles.text}>
            Fumi ofrece suscripciones premium con funcionalidades adicionales:
          </ThemedText>
          <ThemedText style={styles.text}>
            • Suscripción mensual: 3,99€/mes{'\n'}
            • Suscripción anual: 39,99€/año (equivalente a 3,33€/mes)
          </ThemedText>
          <ThemedText style={styles.text}>
            Las suscripciones se renovarán automáticamente a menos que se cancele al menos 24 horas antes del final del período actual. Puede cancelar su suscripción en cualquier momento a través de la configuración de su cuenta en App Store o Google Play.
          </ThemedText>
          <ThemedText style={styles.text}>
            El pago se cargará a su cuenta de App Store o Google Play al confirmar la compra. Los precios pueden variar según la región y están sujetos a cambios con previo aviso.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>5. Restauración de Compras</ThemedText>
          <ThemedText style={styles.text}>
            Si ha realizado una compra premium anteriormente, puede restaurar sus compras utilizando la función "Restaurar compras" dentro de la aplicación. Esto le permitirá recuperar el acceso a las funciones premium en nuevos dispositivos o después de reinstalar la aplicación.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>6. Privacidad y Datos</ThemedText>
          <ThemedText style={styles.text}>
            Respetamos su privacidad. Los datos almacenados localmente en su dispositivo (progreso, configuraciones, etc.) pertenecen a usted. Al utilizar la aplicación, acepta nuestro uso de datos según se describe en nuestra Política de Privacidad.
          </ThemedText>
          <ThemedText style={styles.text}>
            La aplicación puede recopilar información sobre su uso de la aplicación para mejorar nuestros servicios. Esta información se utiliza de forma anónima y agregada.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>7. Precisión de la Información</ThemedText>
          <ThemedText style={styles.text}>
            Nos esforzamos por mantener la información precisa y actualizada, pero no garantizamos la exactitud, integridad o actualidad de toda la información proporcionada. Los cálculos de ahorro y métricas de salud son estimaciones y pueden variar según circunstancias individuales.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>8. Limitación de Responsabilidad</ThemedText>
          <ThemedText style={styles.text}>
            Fumi se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que la aplicación funcionará sin interrupciones o errores.
          </ThemedText>
          <ThemedText style={styles.text}>
            En ningún caso seremos responsables por daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de usar la aplicación.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>9. Uso de la Aplicación</ThemedText>
          <ThemedText style={styles.text}>
            Usted se compromete a utilizar la aplicación de manera responsable y legal. No debe utilizar la aplicación para ningún propósito ilegal o no autorizado.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>10. Modificaciones de los Términos</ThemedText>
          <ThemedText style={styles.text}>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Le notificaremos sobre cambios significativos. El uso continuado de la aplicación después de dichos cambios constituye su aceptación de los nuevos términos.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>11. Contacto</ThemedText>
          <ThemedText style={styles.text}>
            Si tiene preguntas sobre estos términos, puede contactarnos a través de los canales de soporte de la aplicación.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.lastUpdated}>
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </ThemedText>
        </View>
      </ScrollView>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#5A3E33',
    letterSpacing: -0.5,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(90, 62, 51, 0.1)',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5A3E33',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#5A3E33',
    opacity: 0.85,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '900',
    opacity: 1,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#5A3E33',
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

