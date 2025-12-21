import { Link, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "./_styles/category.styles";

const categoryIcons = {
  job: "💼",
  partner: "🤝",
  product: "📦",
  pet: "🐾",
  something: "❓",
};

const categoryDescriptions = {
  job: "Find or offer jobs",
  partner: "Find or become a partner",
  product: "Buy or sell products",
  pet: "Find or adopt pets",
  something: "Browse other items",
};

export default function Category() {
  const params = useLocalSearchParams<{ action?: string }>();
  const router = useRouter();

  const actionText =
    params.action === "need" ? "I need a" : "I provide a";

  const categories = [
    {
      id: "job",
      label: "Job",
      icon: categoryIcons.job,
      description: categoryDescriptions.job,
      color: "#FFF3E0",
    },
    ...(params.action === "need"
      ? [
          {
            id: "partner",
            label: "Partner",
            icon: categoryIcons.partner,
            description: categoryDescriptions.partner,
            color: "#FCE4EC",
          },
        ]
      : []),
    {
      id: "product",
      label: "Product",
      icon: categoryIcons.product,
      description: categoryDescriptions.product,
      color: "#E3F2FD",
    },
    {
      id: "pet",
      label: "Pet",
      icon: categoryIcons.pet,
      description: categoryDescriptions.pet,
      color: "#F1F8E9",
    },
    {
      id: "something",
      label: "Something else",
      icon: categoryIcons.something,
      description: categoryDescriptions.something,
      color: "#EDE7F6",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{actionText}...</Text>
        <Text style={styles.headerSubtitle}>
          Select a category to continue
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              push
              href={{
                pathname: `/${category.id}`,
                params: {
                  action: params.action,
                  category: category.id,
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.touchableWrapper}>
                <View
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.color },
                  ]}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.cardIcon}>{category.icon}</Text>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>{category.label}</Text>
                      <Text style={styles.cardSubtitle}>
                        {category.description}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20, color: "#ccc" }}>›</Text>
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
