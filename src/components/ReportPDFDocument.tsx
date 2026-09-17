import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Cliente, Avaliacao, Resultados } from '../db/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Fontes (opcional: carregue fontes externas se desejar, mas as padrão já são boas)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5', // indigo-600
    paddingBottom: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 5,
  },
  card: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
  },
  value: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  highlightCard: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
  },
  highlightTitle: {
    fontSize: 10,
    color: '#3b82f6',
    textTransform: 'uppercase',
  },
  highlightValue: {
    fontSize: 18,
    color: '#1e3a8a',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.4,
  }
});

interface ReportPDFDocumentProps {
  cliente: Cliente;
  avaliacao: Avaliacao;
  resultado: Resultados;
}

export const ReportPDFDocument = ({ cliente, avaliacao, resultado }: ReportPDFDocumentProps) => {
  const c = resultado?.calculos || {};

  const formatDate = (date: Date) => format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  // Calcula idade exata no momento da avaliacao
  const diffTime = Math.abs(new Date(avaliacao.data_avaliacao).getTime() - new Date(cliente.data_nascimento).getTime());
  const idade = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

  const metasLabel = avaliacao.objetivo === 'emagrecimento' ? 'Emagrecimento (Déficit)' :
                     avaliacao.objetivo === 'hipertrofia' ? 'Hipertrofia (Superávit)' : 'Manutenção';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Avaliação Corporal</Text>
            <Text style={styles.subtitle}>Relatório de Progresso Nutricional e Físico</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>Data da Avaliação</Text>
            <Text style={styles.value}>{formatDate(new Date(avaliacao.data_avaliacao))}</Text>
          </View>
        </View>

        {/* IDENTIFICAÇÃO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Identificação do Paciente</Text>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{cliente.nome}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Idade</Text>
              <Text style={styles.value}>{idade} anos</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Sexo</Text>
              <Text style={styles.value}>{cliente.sexo === 'M' ? 'Masculino' : 'Feminino'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Altura</Text>
              <Text style={styles.value}>{cliente.altura_cm} cm</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Peso Atual</Text>
              <Text style={styles.value}>{Number(avaliacao.peso_kg || 0).toFixed(1)} kg</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Peso Ideal (Devine)</Text>
              <Text style={styles.value}>{c.ibwDevine ? `${c.ibwDevine.toFixed(1)} kg` : '--'}</Text>
            </View>
          </View>
        </View>

        {/* RESULTADOS PRINCIPAIS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Composição Corporal</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>Gordura Corporal (Navy)</Text>
              <Text style={styles.highlightValue}>{c.bfNavy ? `${c.bfNavy.toFixed(1)} %` : '--'}</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>Massa Magra (Boer)</Text>
              <Text style={styles.highlightValue}>{c.massaMagraBoer ? `${c.massaMagraBoer.toFixed(1)} kg` : '--'}</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>Índice de Massa Corporal</Text>
              <Text style={styles.highlightValue}>{c.imc ? c.imc.toFixed(1) : '--'}</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>Relação Cintura-Estatura</Text>
              <Text style={styles.highlightValue}>{c.rce ? c.rce.toFixed(2) : '--'}</Text>
            </View>
          </View>
        </View>

        {/* METABOLISMO E METAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Metabolismo & Metas ({metasLabel})</Text>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.label}>Taxa Metabólica Basal</Text>
              <Text style={styles.value}>{c.bmrKatch ? `${c.bmrKatch.toFixed(0)} kcal` : '--'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Gasto Energético (TDEE)</Text>
              <Text style={styles.value}>{c.tdee ? `${c.tdee.toFixed(0)} kcal` : '--'}</Text>
            </View>
          {Boolean(c.metaCalorica) && (
              <View style={styles.card}>
                <Text style={styles.label}>Meta Diária de Calorias</Text>
                <Text style={[styles.value, { color: '#16a34a' }]}>{Number(c.metaCalorica).toFixed(0)} kcal</Text>
              </View>
            )}
          </View>
          
          {Boolean(c.macros && c.macros.proteina) && (
            <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f8fafc', borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#475569' }}>Sugestão de Macronutrientes:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.label}>Proteínas: <Text style={styles.value}>{Number(c.macros?.proteina || 0).toFixed(0)}g</Text></Text>
                <Text style={styles.label}>Carboidratos: <Text style={styles.value}>{Number(c.macros?.carbo || 0).toFixed(0)}g</Text></Text>
                <Text style={styles.label}>Gorduras: <Text style={styles.value}>{Number(c.macros?.gordura || 0).toFixed(0)}g</Text></Text>
              </View>
            </View>
          )}
        </View>

        {/* ÍNDICES AVANÇADOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Índices Científicos e Risco Clínico</Text>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.label}>Índice de Adiposidade (BAI)</Text>
              <Text style={styles.value}>{c.bai ? `${c.bai.toFixed(1)}%` : '--'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Índice de Redondeza (BRI)</Text>
              <Text style={styles.value}>{c.bri ? c.bri.toFixed(2) : '--'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Índice de Conicidade (CI)</Text>
              <Text style={styles.value}>{c.ci ? c.ci.toFixed(2) : '--'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Rel. Cintura-Quadril</Text>
              <Text style={styles.value}>{c.rcq ? c.rcq.toFixed(2) : '--'}</Text>
            </View>
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este relatório foi gerado automaticamente pelo BioStats e traz estimativas de composição corporal baseadas em equações antropométricas validadas na literatura científica internacional. Os resultados apresentados não configuram diagnóstico médico definitivo e não substituem, em nenhuma hipótese, exames clínicos, laboratoriais ou de imagem padronizados (como DXA ou bioimpedância profissional).
          </Text>
        </View>

      </Page>
    </Document>
  );
};
