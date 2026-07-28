import { authFetchAtom } from "@/src/store/auth-store"
import { chatStyles } from "@/src/styles/chat.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { useRef, useState } from "react"
import { View, Text, TouchableOpacity, TextInput, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import StarRating from "react-native-star-rating-widget"
import Toast from "react-native-toast-message"

export default function reviewUser() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [rating, setRating] = useState(3.5)
  const authFetch = useSetAtom(authFetchAtom)
  const review = useRef("")

  async function submitReview() {
    const res = await authFetch("/api/users/review", {
      method: "POST",
      body: JSON.stringify({
        userId: id,
        rating,
        review: review.current,
      }),
    })
    if (!res.ok) {
      Toast.show({
        type: "error",
        text1: "Error submitting review",
      })
      return
    }
    Toast.show({
      type: "success",
      text1: "Review submitted successfully",
    })
    router.back()
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.light,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 25,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={chatStyles.modalTitle}>Write a Review</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.lightGray,
            borderRadius: 20,
          }}
        >
          <Feather name="x" size={24} color={colors.darkGray} />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={{ color: colors.darkGray, marginBottom: 5 }}>Drag to rate</Text>
        <StarRating
          rating={rating}
          onChange={setRating}
          starSize={48}
          color={colors.purple}
          step="quarter"
        />
      </View>
      <TextInput
        placeholder="Write your review here..."
        placeholderTextColor={colors.muted}
        style={{
          paddingTop: 10,
          minHeight: 200,
          width: "100%",
          marginTop: 20,
          paddingHorizontal: 10,
          textAlignVertical: "top",
          color: colors.dark,
          fontSize: 16,
          borderWidth: 1,
          borderColor: colors.gray,
          borderRadius: 5,
        }}
        onChangeText={text => (review.current = text)}
        multiline
        autoFocus
      />
      <Pressable
        onPress={submitReview}
        style={{
          marginTop: 20,
          paddingVertical: 10,
          paddingHorizontal: 30,
          backgroundColor: colors.purple,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: colors.light, fontWeight: "bold" }}>Submit</Text>
      </Pressable>
    </SafeAreaView>
  )
}
