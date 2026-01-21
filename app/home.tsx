import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.name}>Phạm Thị Kim Ngân</Text>
        <Text style={styles.role}>💻 Sinh viên Công nghệ Thông tin</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Info */}
        <Text style={styles.info}>🎓 MSSV: 23110128</Text>
        <Text style={styles.info}>🏫 Lớp: 23110CLCST3</Text>
        <Text style={styles.info}>
          📧 Email: 23110128@student.hcmute.edu.vn
        </Text>

        {/* Bio */}
        <View style={styles.bioBox}>
          <Text style={styles.bioTitle}>🌸 Tiểu sử</Text>
          <Text style={styles.bioText}>
            Mình là sinh viên yêu thích lập trình,
            thích thiết kế giao diện đẹp và học hỏi công nghệ mới.
            Mình mong muốn trở thành một lập trình viên.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE6F0",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E75480",
    textAlign: "center",
  },

  role: {
    fontSize: 16,
    color: "#FF85A2",
    textAlign: "center",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#FFD1DC",
    marginVertical: 16,
  },

  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },

  bioBox: {
    backgroundColor: "#FFF0F6",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },

  bioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E75480",
    marginBottom: 6,
  },

  bioText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
