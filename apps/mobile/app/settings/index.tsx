import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../lib/utils";

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.emoji}>⚙️</Text>
        <Text style={styles.message}>Settings coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayMd,
  },
  back: { color: COLORS.green, fontSize: 15, fontWeight: "500" },
  title: { fontSize: 17, fontWeight: "700", color: COLORS.black },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emoji: { fontSize: 48 },
  message: { fontSize: 16, color: COLORS.gray },
});
