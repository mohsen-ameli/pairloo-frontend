import { Link, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "@/src/styles/category.styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "@/src/utils/colors";

export default function Category() {
  const params = useLocalSearchParams<{ action?: string }>();
  const actionText = params.action === "need" ? "I need a" : "I provide a";

  const categories = [
    {
      id: "job",
      label: "Job",
      icon: <AntDesign name="solution" size={32} color={colors.dark} />,
      description: params.action === "need" ? "Get hired" : "Find talent",
    },
    ...(params.action === "need"
      ? [
          {
            id: "partner",
            label: "Partner",
            icon: (
              <MaterialCommunityIcons
                name="handshake"
                size={32}
                color={colors.dark}
              />
            ),
            description: "Find a partner",
          },
        ]
      : []),
    {
      id: "product",
      label: "Product",
      icon: <FontAwesome5 name="box-open" size={32} color={colors.dark} />,
      description: params.action === "need" ? "Buy products" : "Sell products",
    },
    {
      id: "pet",
      label: "Pet",
      icon: <MaterialCommunityIcons name="dog" size={32} color={colors.dark} />,
      description: params.action === "need" ? "Adopt a pet" : "Find a home",
    },
    {
      id: "something",
      label: "Something else",
      icon: <AntDesign name="question-circle" size={32} color={colors.dark} />,
      description: "General request",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{actionText}...</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              push
              href={{
                pathname: "/[id]",
                params: {
                  action: params.action,
                  category: category.id,
                  id: category.id,
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.touchableWrapper}>
                <View style={styles.categoryCard}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardIcon}>{category.icon}</View>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>{category.label}</Text>
                      <Text style={styles.cardSubtitle}>
                        {category.description}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20, color: colors.dark }}>
                      <MaterialIcons
                        name="navigate-next"
                        size={24}
                        color={colors.dark}
                      />
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
