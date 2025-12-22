import { Link } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "./_styles/category.styles";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const categoryIcons = {
  job: (color: string, size: number) => <AntDesign name="solution" size={size} color={color} />,
  partner: (color: string, size: number) => <MaterialCommunityIcons name="handshake" size={size} color={color} />,
  product: (color: string, size: number) => <FontAwesome5 name="box-open" size={size} color={color} />,
  pet: (color: string, size: number) => <MaterialCommunityIcons name="dog" size={size} color={color} />,
  something: (color: string, size: number) => <AntDesign name="question-circle" size={size} color={color} />,
};

export default function Category() {
  const params = useLocalSearchParams<{ action?: string }>();
  const actionText =
    params.action === "need" ? "I need a" : "I provide a";

  const categories = [
    {
      id: "job",
      label: "Job",
      icon: categoryIcons.job,
      description: "Find or offer jobs",
      color: "#FFF3E0",
    },
    ...(params.action === "need"
      ? [
          {
            id: "partner",
            label: "Partner",
            icon: categoryIcons.partner,
            description: "Find or become a partner",
            color: "#FCE4EC",
          },
        ]
      : []),
    {
      id: "product",
      label: "Product",
      icon: categoryIcons.product,
      description: "Buy or sell products",
      color: "#E3F2FD",
    },
    {
      id: "pet",
      label: "Pet",
      icon: categoryIcons.pet,
      description: "Find or adopt pets",
      color: "#F1F8E9",
    },
    {
      id: "something",
      label: "Something else",
      icon: categoryIcons.something,
      description: "Browse other items",
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
                <View
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.color },
                  ]}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardIcon}>{category.icon('#333', 32)}</View>
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
