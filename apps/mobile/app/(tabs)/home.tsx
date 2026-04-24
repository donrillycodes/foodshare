import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { ngoApi, foodNeedApi, updateApi } from "../../lib/api";
import {
  COLORS,
  formatCurrency,
  formatRelativeTime,
  truncate,
  formatCategory,
} from "../../lib/utils";
import type { NGO, FoodNeed, NGOUpdate, PaginatedResponse } from "../../types";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    data: ngosData,
    isLoading: ngosLoading,
    refetch: refetchNgos,
  } = useQuery({
    queryKey: ["featured-ngos"],
    queryFn: async () => {
      const response = await ngoApi.getAll({ limit: 5 });
      return response.data.data as PaginatedResponse<NGO>;
    },
  });

  const {
    data: needsData,
    isLoading: needsLoading,
    refetch: refetchNeeds,
  } = useQuery({
    queryKey: ["urgent-needs"],
    queryFn: async () => {
      const response = await foodNeedApi.getAll({ isUrgent: true, limit: 3 });
      return response.data.data as PaginatedResponse<FoodNeed>;
    },
  });

  const {
    data: updatesData,
    isLoading: updatesLoading,
    refetch: refetchUpdates,
  } = useQuery({
    queryKey: ["recent-updates"],
    queryFn: async () => {
      const response = await updateApi.getAll({ limit: 5 });
      return response.data.data as PaginatedResponse<NGOUpdate>;
    },
  });

  const isRefreshing = false;

  const handleRefresh = async () => {
    await Promise.all([refetchNgos(), refetchNeeds(), refetchUpdates()]);
  };

  const ngos = ngosData?.items ?? [];
  const urgentNeeds = needsData?.items ?? [];
  const updates = updatesData?.items ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.green}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName} 👋</Text>
            <Text style={styles.headerSubtitle}>
              Make a difference in Winnipeg today
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/(tabs)/activity")}
          >
            <Text style={styles.notificationEmoji}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/discover")}
            activeOpacity={0.8}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E8F5EE" }]}
            >
              <Text style={styles.quickActionEmoji}>❤️</Text>
            </View>
            <Text style={styles.quickActionLabel}>Donate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/discover")}
            activeOpacity={0.8}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}
            >
              <Text style={styles.quickActionEmoji}>📦</Text>
            </View>
            <Text style={styles.quickActionLabel}>Pledge Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/activity")}
            activeOpacity={0.8}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#EFF6FF" }]}
            >
              <Text style={styles.quickActionEmoji}>📋</Text>
            </View>
            <Text style={styles.quickActionLabel}>My Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/discover")}
            activeOpacity={0.8}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#F5F3FF" }]}
            >
              <Text style={styles.quickActionEmoji}>🏢</Text>
            </View>
            <Text style={styles.quickActionLabel}>NGOs</Text>
          </TouchableOpacity>
        </View>

        {/* Urgent needs */}
        {urgentNeeds.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🚨 Urgent Needs</Text>
              <TouchableOpacity
                onPress={() => router.push("/discover?tab=needs")}
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {needsLoading ? (
              <ActivityIndicator color={COLORS.green} />
            ) : (
              urgentNeeds.map((need) => (
                <TouchableOpacity
                  key={need.id}
                  style={styles.urgentCard}
                  onPress={() => router.push(`/food-need/${need.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.urgentCardContent}>
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentBadgeText}>URGENT</Text>
                    </View>
                    <Text style={styles.urgentTitle}>{need.title}</Text>
                    <Text style={styles.urgentNgo}>{need.ngo.name}</Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(
                                (need.quantityFulfilled /
                                  need.quantityRequired) *
                                  100,
                                100,
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {need.quantityFulfilled}/{need.quantityRequired}{" "}
                        {need.unit}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Featured NGOs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏢 Featured NGOs</Text>
            <TouchableOpacity onPress={() => router.push("/discover")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {ngosLoading ? (
            <ActivityIndicator color={COLORS.green} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {ngos.map((ngo) => (
                <TouchableOpacity
                  key={ngo.id}
                  style={styles.ngoCard}
                  onPress={() => router.push(`/ngo/${ngo.slug}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.ngoLogo}>
                    <Text style={styles.ngoLogoText}>{ngo.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.ngoName} numberOfLines={2}>
                    {ngo.name}
                  </Text>
                  <Text style={styles.ngoCategory}>
                    {formatCategory(ngo.category)}
                  </Text>
                  <Text style={styles.ngoCity}>{ngo.city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent updates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Latest Updates</Text>
          </View>

          {updatesLoading ? (
            <ActivityIndicator color={COLORS.green} />
          ) : (
            updates.map((update) => (
              <TouchableOpacity
                key={update.id}
                style={styles.updateCard}
                onPress={() => router.push(`/update/${update.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.updateContent}>
                  <View style={styles.updateHeader}>
                    <View style={styles.updateNgoLogo}>
                      <Text style={styles.updateNgoLogoText}>
                        {update.ngo.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.updateMeta}>
                      <Text style={styles.updateNgoName}>
                        {update.ngo.name}
                      </Text>
                      <Text style={styles.updateTime}>
                        {formatRelativeTime(
                          update.publishedAt ?? update.createdAt,
                        )}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.updateTitle}>{update.title}</Text>
                  {update.summary && (
                    <Text style={styles.updateSummary}>
                      {truncate(update.summary, 100)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.grayMd,
  },
  notificationEmoji: {
    fontSize: 18,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.gray,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.green,
    fontWeight: "500",
  },
  urgentCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    overflow: "hidden",
  },
  urgentCardContent: {
    padding: 16,
  },
  urgentBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  urgentBadgeText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  urgentNgo: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.grayLt,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  ngoCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
    alignItems: "center",
    gap: 6,
  },
  ngoLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.greenLt,
    alignItems: "center",
    justifyContent: "center",
  },
  ngoLogoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.green,
  },
  ngoName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
  },
  ngoCategory: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: "500",
  },
  ngoCity: {
    fontSize: 11,
    color: COLORS.gray,
  },
  updateCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
    overflow: "hidden",
  },
  updateContent: {
    padding: 16,
  },
  updateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  updateNgoLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.greenLt,
    alignItems: "center",
    justifyContent: "center",
  },
  updateNgoLogoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.green,
  },
  updateMeta: {
    flex: 1,
  },
  updateNgoName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
  },
  updateTime: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  updateSummary: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 20,
  },
});
