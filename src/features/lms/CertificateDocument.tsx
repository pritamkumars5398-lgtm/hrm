import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  frame: { flex: 1, borderWidth: 3, borderColor: '#059669', padding: 40, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 11, letterSpacing: 3, color: '#059669', marginBottom: 18 },
  heading: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 24 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  name: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 20 },
  course: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#047857', marginBottom: 6, textAlign: 'center' },
  meta: { fontSize: 11, color: '#64748b', marginTop: 28 },
})

export default function CertificateDocument({
  recipient,
  courseTitle,
  category,
  issuedOn,
}: {
  recipient: string
  courseTitle: string
  category: string
  issuedOn: string
}) {
  return (
    <Document title={`Certificate - ${courseTitle}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <Text style={styles.eyebrow}>KEYSTONE LMS ACADEMY</Text>
          <Text style={styles.heading}>Certificate of Completion</Text>
          <Text style={styles.label}>This certifies that</Text>
          <Text style={styles.name}>{recipient}</Text>
          <Text style={styles.label}>has successfully completed</Text>
          <Text style={styles.course}>{courseTitle}</Text>
          <Text style={styles.meta}>
            Category: {category}   ·   Issued: {issuedOn}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
