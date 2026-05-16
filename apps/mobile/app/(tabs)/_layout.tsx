import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SPACE } from "../../lib/utils";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
  icon: IoniconName;
  iconFocused: IoniconName;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, iconFocused, label, focused }: TabIconProps) {
  const color = focused ? COLORS.primary : COLORS.textSub;
  return (
    <View style={styles.tabIcon}>
      <Ionicons name={focused ? iconFocused : icon} size={24} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="home-outline"
              iconFocused="home"
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="search-outline"
              iconFocused="search"
              label="Discover"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="receipt-outline"
              iconFocused="receipt"
              label="Activity"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="person-outline"
              iconFocused="person"
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
    paddingBottom: SPACE.sm,
    paddingTop: SPACE.sm,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: {
    fontSize: FONT.xs,
    fontWeight: "500",
  },
});
