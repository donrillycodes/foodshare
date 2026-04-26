import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ngoApi, foodNeedApi } from "../../lib/api";
import {
  COLORS,
  formatCategory,
  formatDate,
  getProgress,
  truncate,
} from "../../lib/utils";
import type { NGO, FoodNeed, PaginatedResponse } from "../../types";

export default function NGOProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const { data: ngoData, isLoading: ngoLoading } = useQuery({
    queryKey: ["ngo", slug],
    queryFn: async () => {
      const response = await ngoApi.getOne(slug);
      return response.data.data.ngo as NGO;
    },
  });

  const { data: needsData, isLoading: needsLoading } = useQuery({
  queryKey: ['ngo-needs', ngoData?.slug],
  queryFn: async () => {
    const response = await foodNeedApi.getAll({ limit: 20 });
    const all = response.data.data as PaginatedResponse<FoodNeed>;
    return {
      ...all,
      items: all.items.filter((n) => n.ngo.id === ngoData!.id),
    };
  },
  enabled: !!ngoData?.id,
});

  const ngo = ngoData;
  const needs = needsData?.items ?? [];

  if (ngoLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.green} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!ngo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>NGO not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover image */}
        {ngo.coverUrl && (
          <Image
            source={{ uri: ngo.coverUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* NGO hero */}
        <View style={styles.hero}>
          {ngo.logoUrl ? (
            <Image
              source={{ uri: ngo.logoUrl }}
              style={styles.logoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.logo}>
              <Text style={styles.logoText}>{ngo.name.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.ngoName}>{ngo.name}</Text>
          <Text style={styles.ngoCategory}>
            {formatCategory(ngo.category)} · {ngo.city}, {ngo.province}
          </Text>

          {/* Donate button */}
          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => router.push(`/donate/${ngo.id}` as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.donateButtonText}>❤️ Donate Now</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{ngo.description}</Text>
          {ngo.mission && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                Mission
              </Text>
              <Text style={styles.description}>{ngo.mission}</Text>
            </>
          )}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{ngo.email}</Text>
          </View>
          {ngo.phone && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{ngo.phone}</Text>
            </View>
          )}
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Address</Text>
            <Text style={styles.contactValue}>
              {ngo.address}, {ngo.city}
            </Text>
          </View>
          {ngo.website && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={[styles.contactValue, { color: COLORS.green }]}>
                {ngo.website}
              </Text>
            </View>
          )}
        </View>

        {/* Food needs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Food Needs</Text>
          {needsLoading ? (
            <ActivityIndicator color={COLORS.green} />
          ) : needs.length === 0 ? (
            <Text style={styles.emptyText}>
              No open food needs at the moment
            </Text>
          ) : (
            needs.map((need) => (
              <TouchableOpacity
                key={need.id}
                style={styles.needCard}
                onPress={() => router.push(`/food-need/${need.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.needHeader}>
                  <Text style={styles.needTitle} numberOfLines={1}>
                    {need.title}
                  </Text>
                  {need.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.needSubtitle}>
                  {need.itemName} · {need.quantityFulfilled}/
                  {need.quantityRequired} {need.unit}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getProgress(
                          need.quantityFulfilled,
                          need.quantityRequired,
                        )}%`,
                      },
                    ]}
                  />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backText: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: "500",
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.white,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayMd,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.greenLt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.green,
  },
  ngoName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 6,
  },
  ngoCategory: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  donateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLt,
  },
  contactLabel: {
    fontSize: 13,
    color: COLORS.gray,
    width: 70,
    fontWeight: "500",
  },
  contactValue: {
    fontSize: 13,
    color: COLORS.black,
    flex: 1,
  },
  needCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
  },
  needHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  needTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    color: "#DC2626",
    fontSize: 9,
    fontWeight: "700",
  },
  needSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  progressBar: {
    height: 5,
    backgroundColor: COLORS.grayLt,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 3,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    paddingVertical: 12,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  backLink: {
    fontSize: 15,
    color: COLORS.green,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 40,
  },
  logoImage: {
  width: 80,
  height: 80,
  borderRadius: 40,
  marginBottom: 12,
  },
  coverImage: {
  width: '100%',
  height: 180,
  backgroundColor: COLORS.grayLt,
  },
});
