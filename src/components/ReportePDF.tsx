import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  text: { fontSize: 12 },
});

export default function ReportePDF({ config }: { config: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Portada */}
        <View style={styles.section}>
          <Text style={styles.title}>{config.titulo}</Text>
          <Text style={styles.text}>Autor: {config.autor}</Text>
          <Text style={styles.text}>Fecha: {config.fecha}</Text>
        </View>

        {/* Parámetros seleccionados */}
        <View style={styles.section}>
          <Text style={styles.title}>Parámetros</Text>
          {config.parametros.map((p: string) => (
            <Text key={p} style={styles.text}>- {p}</Text>
          ))}
        </View>

        {/* Secciones activadas */}
        <View style={styles.section}>
          <Text style={styles.title}>Secciones</Text>
          {config.secciones.map((s: string) => (
            <Text key={s} style={styles.text}>✔ {s}</Text>
          ))}
        </View>

        {/* Página final */}
        <View style={styles.section}>
          <Text style={styles.title}>Contacto</Text>
          <Text style={styles.text}>{config.contacto}</Text>
        </View>
      </Page>
    </Document>
  );
}