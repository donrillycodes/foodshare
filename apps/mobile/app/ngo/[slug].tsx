import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native";
import { COLORS } from "../../lib/utils";

export default function NGOProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>NGO Profile — Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16, color: COLORS.gray },
});
