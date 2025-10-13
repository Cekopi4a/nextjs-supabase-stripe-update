import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts that support Cyrillic (Bulgarian)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Roboto",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #2563eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 3,
  },
  infoSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 700,
    width: 120,
    color: "#334155",
  },
  infoValue: {
    color: "#475569",
  },
  sessionContainer: {
    marginBottom: 25,
    borderLeft: "3 solid #06b6d4",
    paddingLeft: 15,
  },
  sessionHeader: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0891b2",
    marginBottom: 10,
  },
  sessionInfo: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 10,
  },
  exerciseTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0f2fe",
    padding: 8,
    fontWeight: 700,
    fontSize: 10,
    color: "#0c4a6e",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
    padding: 8,
    fontSize: 10,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: "1 solid #e2e8f0",
    padding: 8,
    fontSize: 10,
  },
  col1: { width: "40%" },
  col2: { width: "15%", textAlign: "center" },
  col3: { width: "15%", textAlign: "center" },
  col4: { width: "15%", textAlign: "center" },
  col5: { width: "15%", textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#94a3b8",
    borderTop: "1 solid #e2e8f0",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: "#94a3b8",
  },
  notes: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderLeft: "3 solid #f59e0b",
    fontSize: 10,
  },
  notesLabel: {
    fontWeight: 700,
    color: "#92400e",
    marginBottom: 3,
  },
  notesText: {
    color: "#78350f",
  },
});

interface Exercise {
  exercise_id: string;
  sets: number;
  reps_min?: number;
  reps_max?: number;
  reps?: number;
  weight_kg?: number;
  rest_seconds: number;
  notes?: string;
  exercise?: {
    name?: string;
    primary_muscles?: string[];
    equipment?: string;
  };
}

interface Session {
  id: string;
  session_name: string;
  day_of_week: number;
  estimated_duration: number;
  rest_between_sets: number;
  notes?: string;
  exercises?: Exercise[];
}

interface Program {
  id: string;
  name: string;
  description?: string;
  duration_weeks: number;
  difficulty_level: string;
  program_type: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  client?: {
    full_name: string;
    email: string;
  };
  trainer?: {
    full_name: string;
    email: string;
  };
  sessions?: Session[];
}

interface ProgramPDFDocumentProps {
  program: Program;
}

export const ProgramPDFDocument: React.FC<ProgramPDFDocumentProps> = ({
  program,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG");
  };

  const getDayName = (dayNumber: number) => {
    const days = [
      "Неделя",
      "Понеделник",
      "Вторник",
      "Сряда",
      "Четвъртък",
      "Петък",
      "Събота",
    ];
    return days[dayNumber] || "";
  };

  const formatReps = (exercise: Exercise) => {
    if (exercise.reps_min && exercise.reps_max) {
      return `${exercise.reps_min}-${exercise.reps_max}`;
    }
    if (exercise.reps) {
      return exercise.reps.toString();
    }
    return "-";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{program.name}</Text>
          {program.description && (
            <Text style={styles.subtitle}>{program.description}</Text>
          )}
          <Text style={styles.subtitle}>
            Експортирано на: {formatDate(new Date().toISOString())}
          </Text>
        </View>

        {/* Program Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Клиент:</Text>
            <Text style={styles.infoValue}>
              {program.client?.full_name || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Треньор:</Text>
            <Text style={styles.infoValue}>
              {program.trainer?.full_name || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Продължителност:</Text>
            <Text style={styles.infoValue}>
              {program.duration_weeks} седмици
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ниво:</Text>
            <Text style={styles.infoValue}>{program.difficulty_level}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Тип програма:</Text>
            <Text style={styles.infoValue}>{program.program_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Начална дата:</Text>
            <Text style={styles.infoValue}>{formatDate(program.start_date)}</Text>
          </View>
          {program.end_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Крайна дата:</Text>
              <Text style={styles.infoValue}>{formatDate(program.end_date)}</Text>
            </View>
          )}
        </View>

        {/* Workout Sessions */}
        {program.sessions?.map((session, sessionIndex: number) => (
          <View key={session.id} style={styles.sessionContainer} break={sessionIndex > 0}>
            <Text style={styles.sessionHeader}>
              {session.session_name} - {getDayName(session.day_of_week)}
            </Text>
            <Text style={styles.sessionInfo}>
              Продължителност: ~{session.estimated_duration} мин | Почивка между
              сетове: {session.rest_between_sets}сек
            </Text>

            {session.notes && (
              <View style={styles.notes}>
                <Text style={styles.notesLabel}>Бележки:</Text>
                <Text style={styles.notesText}>{session.notes}</Text>
              </View>
            )}

            {/* Exercises Table */}
            <View style={styles.exerciseTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Упражнение</Text>
                <Text style={styles.col2}>Сетове</Text>
                <Text style={styles.col3}>Повторения</Text>
                <Text style={styles.col4}>Тегло (kg)</Text>
                <Text style={styles.col5}>Почивка (s)</Text>
              </View>

              {session.exercises?.map((ex, index: number) => (
                <View
                  key={ex.exercise_id || index}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={styles.col1}>
                    {ex.exercise?.name || "Неизвестно упражнение"}
                  </Text>
                  <Text style={styles.col2}>{ex.sets}</Text>
                  <Text style={styles.col3}>{formatReps(ex)}</Text>
                  <Text style={styles.col4}>
                    {ex.weight_kg ? `${ex.weight_kg}` : "-"}
                  </Text>
                  <Text style={styles.col5}>{ex.rest_seconds}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer}>
          Генерирано от Fitness Training App | {formatDate(new Date().toISOString())}
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Страница ${pageNumber} от ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
