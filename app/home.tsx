import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homepage</Text>

      <Text style={styles.text}>👤 Họ tên: Phạm Thị Kim Ngân</Text>
      <Text style={styles.text}>🎓 MSSV: 23110128</Text>
      <Text style={styles.text}>🏫 Lớp: 23110CLCST3</Text>
      <Text style={styles.text}>📧 Email: 23110128@student.hcmute.edu.vn</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 6,
  },
});
