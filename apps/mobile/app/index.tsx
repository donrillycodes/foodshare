import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { COLORS } from "../lib/utils";

export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
      return;
    }

    // Block NGO and Admin users — they belong on the web dashboard
    if (user?.role !== "DONOR") {
      router.replace("/(auth)/wrong-role");
      return;
    }

    router.replace("/(tabs)/home");
  }, [isLoading, isAuthenticated, user]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color={COLORS.green} />
    </View>
  );
}
