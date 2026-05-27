import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from "expo-router"
import { useNavigation } from "@react-navigation/native"
import { View, Text, ScrollView, Pressable, Alert, Switch } from "react-native"
import { useEffect, useCallback } from "react"
import Feather from "@expo/vector-icons/Feather"
import { useSetAtom, useAtomValue } from "jotai"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MyPostType } from "@/src/types/post.type"
import { authFetchAtom } from "@/src/store/auth-store"
import { inputStyles } from "@/src/styles/input.styles"
import { editPostStyles } from "@/src/styles/edit-post.styles"
import CustomInput from "@/src/components/CustomInput"
import { colors } from "@/src/utils/colors"
import useCustomHeader from "@/src/utils/useCustomHeader"
import ImageCarousel from "@/src/components/ImageCarousel"
import { settingsAtom } from "@/src/store/create-post-store"
import { getAttachmentAtom } from "@/src/store/general-store"
import React from "react"
import {
  editPostFormAtom,
  editPostHasChangesAtom,
  editPostLoadingAtom,
  resetEditPostAtom,
} from "@/src/store/edit-post-store"

export default function EditPost() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const getAttachment = useSetAtom(getAttachmentAtom)
  const settings = useAtomValue(settingsAtom)
  const formState = useAtomValue(editPostFormAtom)
  const setFormState = useSetAtom(editPostFormAtom)
  const loading = useAtomValue(editPostLoadingAtom)
  const setLoading = useSetAtom(editPostLoadingAtom)
  const hasChanges = useAtomValue(editPostHasChangesAtom)
  const setHasChanges = useSetAtom(editPostHasChangesAtom)
  const resetEditPost = useSetAtom(resetEditPostAtom)

  const { data: post } = useQuery({
    queryKey: [`post-${id}`],
    queryFn: fetchPost,
  })

  async function fetchPost() {
    const res = await authFetch(`/api/posts/my-posts/${id}`)
    const data: MyPostType = await res.json()
    return data
  }

  useEffect(() => {
    resetEditPost()

    return () => {
      resetEditPost()
    }
  }, [resetEditPost])

  useEffect(() => {
    if (!post) return

    setFormState(prev => ({
      ...prev,
      title: post.title,
      description: post.description,
      publicPost: post.publicPost,
      location: post.location || null,
      existingImages: post.images || [],
      distance: post.distance || 5000,
    }))
    setHasChanges(false)
  }, [post, setFormState, setHasChanges])

  useFocusEffect(
    useCallback(() => {
      if (settings.location && settings.closeCity) {
        setFormState(prev => ({
          ...prev,
          location: settings.location,
          closeCity: settings.closeCity,
        }))
        setHasChanges(true)
      }
    }, [settings.location, settings.closeCity])
  )

  async function pickImages() {
    const attachments = await getAttachment(false, "library", true)
    if (attachments.length > 0) {
      setFormState(prev => ({
        ...prev,
        newImages: [...prev.newImages, ...attachments],
      }))
      setHasChanges(true)
    }
  }

  async function handleSave() {
    if (!formState.title.trim() || !formState.description.trim()) {
      Alert.alert("Error", "Title and description are required")
      return
    }
    setLoading(true)

    try {
      const formData = new FormData()
      const metadata = {
        title: formState.title,
        description: formState.description,
        publicPost: formState.publicPost,
        distance: formState.distance,
        location: formState.location || null,
        existingImages: formState.existingImages,
        removedImages: formState.removedImages,
      }
      formData.append("metadata", JSON.stringify(metadata))

      for (const newImage of formState.newImages) {
        const filename = `image-${Date.now()}.${newImage.mimeType?.split("/")[1] || "jpg"}`
        formData.append("images", {
          uri: newImage.uri,
          name: filename,
          type: newImage.mimeType || "image/jpeg",
        } as any)
      }

      const response = await authFetch(`/api/posts/${id}`, {
        method: "PATCH",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to update post:", { status: response.status, error: errorData })
        Alert.alert("Error", "Failed to update post")
        setLoading(false)
        return
      }

      await queryClient.invalidateQueries({ queryKey: [`post-${id}`] })
      await queryClient.invalidateQueries({ queryKey: ["my-posts"] })

      resetEditPost()
      router.back()
    } catch (error) {
      console.error("Error saving post:", error)
      Alert.alert("Error", "An unexpected error occurred")
      setLoading(false)
    }
  }

  async function handleLocationPress() {
    router.push("/map-selector")
  }

  const navigation = useNavigation()
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", e => {
      if (e.data.action.type === "POP" || e.data.action.type === "GO_BACK") {
        if (hasChanges) {
          e.preventDefault()
          Alert.alert(
            "Discard Changes",
            "Your changes will be lost. Are you sure you want to discard your changes?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Discard",
                onPress: () => {
                  resetEditPost()
                  navigation.goBack()
                },
                style: "destructive",
              },
            ]
          )
        }
      }
    })

    return unsubscribe
  }, [hasChanges, navigation])

  const detailOptions = useCustomHeader({
    title: "Edit Post",
    isEditMode: true,
    onSave: handleSave,
    onBackPress: () => {
      router.back()
      return true
    },
    canSave: hasChanges && !loading,
  })

  const hasImages = formState.existingImages.length > 0 || formState.newImages.length > 0

  return (
    <>
      <Stack.Screen options={detailOptions} />
      <View style={{ flex: 1, backgroundColor: colors.light }}>
        <ScrollView
          style={editPostStyles.scrollView}
          contentContainerStyle={editPostStyles.gaptainer}
          keyboardShouldPersistTaps="handled"
        >
          <CustomInput
            title="Title"
            headerStyles={{ fontSize: 16, fontWeight: "600" }}
            value={formState.title}
            onChangeText={text => {
              setFormState(prev => ({ ...prev, title: text }))
              setHasChanges(true)
            }}
            editable={!loading}
            mandatory
          />

          <CustomInput
            title="Description"
            headerStyles={{ fontSize: 16, fontWeight: "600" }}
            value={formState.description}
            multiline
            onChangeText={text => {
              setFormState(prev => ({ ...prev, description: text }))
              setHasChanges(true)
            }}
            editable={!loading}
            mandatory
          />

          <View>
            <Text style={inputStyles.header}>Location (Optional)</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Pressable onPress={handleLocationPress} disabled={loading}>
                  <Text style={inputStyles.input}>
                    {formState.closeCity || "Tap to select location"}
                  </Text>
                </Pressable>
              </View>
              {formState.location && formState.closeCity && (
                <Pressable
                  style={editPostStyles.locationClearButton}
                  onPress={() => {
                    setFormState(prev => ({ ...prev, location: null, closeCity: "" }))
                    setHasChanges(true)
                  }}
                  disabled={loading}
                >
                  <Feather name="x" size={24} color={colors.darkGray} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Images */}
          <View>
            <Text style={inputStyles.header}>Images (Optional)</Text>

            {hasImages ? (
              <>
                <ImageCarousel
                  images={[...formState.existingImages, ...formState.newImages.map(img => img.uri)]}
                  pageType={"edit"}
                  editable
                />
                <Pressable
                  onPress={pickImages}
                  disabled={loading}
                  style={editPostStyles.addMoreImagesButton}
                >
                  <Feather name="plus" size={24} color={colors.purple} />
                  <Text style={{ color: colors.purple, fontSize: 16, fontWeight: "500" }}>
                    Add More Images
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={pickImages}
                disabled={loading}
                style={editPostStyles.uploadImageButton}
              >
                <Feather name="upload" size={40} color={colors.purple} />
                <Text style={{ marginTop: 10, color: colors.dark, fontSize: 16 }}>
                  Upload Images
                </Text>
              </Pressable>
            )}
          </View>

          <View style={editPostStyles.gaptainer}>
            <View style={editPostStyles.lastPageRowContainer}>
              <View style={editPostStyles.lastPageRowLabelContainer}>
                <Text style={editPostStyles.lastPageQuestion}>Public Post</Text>
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Public Post",
                      "Toggle this option to make your post visible to other users.\n\nYou can change this setting anytime."
                    )
                  }
                >
                  <Feather name="info" size={20} color={colors.gray} />
                </Pressable>
              </View>
              <Switch
                trackColor={{ true: colors.purple }}
                thumbColor={colors.light}
                onValueChange={value => {
                  setFormState(prev => ({ ...prev, publicPost: value }))
                  setHasChanges(true)
                }}
                value={formState.publicPost}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  )
}
