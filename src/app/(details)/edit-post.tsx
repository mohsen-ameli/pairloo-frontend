import { useRouter, useLocalSearchParams } from "expo-router"
import { useNavigation } from "@react-navigation/native"
import { View, Text, ScrollView, Pressable, Alert, Switch, Platform } from "react-native"
import { useEffect, useRef, useMemo } from "react"
import Feather from "@expo/vector-icons/Feather"
import { useSetAtom, useAtom } from "jotai"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { authFetchAtom } from "@/src/store/auth-store"
import { inputStyles } from "@/src/styles/input.styles"
import CustomInput from "@/src/components/CustomInput"
import { colors } from "@/src/utils/colors"
import CustomButton from "@/src/components/CustomButton"
import ImageCarousel from "@/src/components/ImageCarousel"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { getAttachmentAtom } from "@/src/store/general-store"
import { commonStyles } from "@/src/styles/common.styles"
import React from "react"
import {
  editPostFormAtom,
  editPostHasChangesAtom,
  editPostLoadingAtom,
  EditPostType,
  resetEditPostAtom,
} from "@/src/store/edit-post-store"
import Toast from "react-native-toast-message"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { MAX_POST_IMAGES } from "@/src/utils/constants"
import { createPostStyles } from "@/src/styles/create-post.styles"

export default function EditPost() {
  const router = useRouter()
  const allowNavigationRef = useRef(false)
  const insets = useSafeAreaInsets()

  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const authFetch = useSetAtom(authFetchAtom)
  const getAttachment = useSetAtom(getAttachmentAtom)
  const resetEditPost = useSetAtom(resetEditPostAtom)
  const [formState, setFormState] = useAtom(editPostFormAtom)
  const [loading, setLoading] = useAtom(editPostLoadingAtom)
  const [hasChanges, setHasChanges] = useAtom(editPostHasChangesAtom)

  const { isError, isPending } = useQuery({ queryKey: [`edit-post-${id}`], queryFn: fetchPost })

  async function fetchPost() {
    const res = await authFetch(`/api/posts/edit-post/${id}`)
    const data: EditPostType = await res.json()

    setFormState(prev => ({
      ...prev,
      title: data.title,
      description: data.description,
      publicPost: data.publicPost,
      images: data.images,
    }))
    setHasChanges(false)

    return data
  }

  useEffect(() => {
    resetEditPost()
  }, [id])

  const images = useMemo(() => {
    return formState.images.filter(img => !img.removed)
  }, [formState.images])

  async function pickImages() {
    setLoading(true)
    const attachments = await getAttachment(false, "library", true, MAX_POST_IMAGES - images.length)
    if (attachments.length > 0) {
      setFormState(prev => ({
        ...prev,
        images: [
          ...prev.images,
          ...attachments.map(att => ({
            key: att.uri,
            url: att.uri,
            file: att.file,
            mimeType: att.mimeType,
            removed: false,
            isExisting: false,
          })),
        ],
      }))
      setHasChanges(true)
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!formState.title.trim() || !formState.description.trim()) {
      Toast.show({ type: "error", text1: "Title and description are required" })
      return
    }
    setLoading(true)

    try {
      const formData = new FormData()
      const metadata = {
        title: formState.title,
        description: formState.description,
        publicPost: formState.publicPost,
        images: formState.images.map(img => ({
          key: img.key,
          removed: img.removed,
          isExisting: img.isExisting,
        })),
      }
      formData.append("metadata", JSON.stringify(metadata))

      for (const img of formState.images) {
        if (img.file) {
          const filename = `image-${Date.now()}.${img.mimeType?.split("/")[1] || "jpg"}`
          formData.append("newImages", {
            uri: img.url,
            name: filename,
            file: img.file,
            type: img.mimeType || "image/jpeg",
          } as any)
        }
      }
      const response = await authFetch(
        `/api/posts/edit-post/${id}`,
        {
          method: "POST",
          body: formData,
        },
        true
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to update post:", { status: response.status, error: errorData })
        Toast.show({
          type: "error",
          text1: "Failed to update post",
          text2: errorData.message || "Please try again",
        })
        resetEditPost()
        return
      }

      await queryClient.invalidateQueries({ queryKey: [`post-${id}`] })
      await queryClient.invalidateQueries({ queryKey: ["my-posts"] })

      Toast.show({ type: "success", text1: "Post updated successfully" })

      allowNavigationRef.current = true
      resetEditPost()
      router.back()
    } catch (error: any) {
      console.error("Error saving post:", error)
      Toast.show({
        type: "error",
        text1: "An unexpected error occurred",
        text2: error.message || "Please try again",
      })
      resetEditPost()
    }
  }

  const navigation = useNavigation()
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", e => {
      // Allow programmatic navigation (e.g. after a successful save) without showing the discard dialog.
      if (allowNavigationRef.current) return

      function discard() {
        allowNavigationRef.current = true
        resetEditPost()
        navigation.goBack()
      }

      if (e.data.action.type === "POP" || e.data.action.type === "GO_BACK") {
        if (hasChanges) {
          e.preventDefault()
          if (Platform.OS === "web") {
            if (
              window.confirm(
                "Your changes will be lost. Are you sure you want to discard your changes?"
              )
            ) {
              discard()
            }
            return
          }
          Alert.alert(
            "Discard Changes",
            "Your changes will be lost. Are you sure you want to discard your changes?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Discard",
                onPress: discard,
                style: "destructive",
              },
            ]
          )
        }
      }
    })

    return unsubscribe
  }, [hasChanges, navigation])

  async function refresh() {
    queryClient.invalidateQueries({ queryKey: [`post-${id}`] })
  }

  if (isPending) {
    return (
      <>
        <View style={commonStyles.generalContainer}>
          <LoadingIndicator loading={true} />
        </View>
      </>
    )
  }

  if (isError) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={commonStyles.errorText}>Error loading posts. Please try again.</Text>
        <Pressable style={commonStyles.retryButton} onPress={refresh}>
          <Text style={commonStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <LoadingIndicator loading={loading} opacity={0.45} />

      <ScrollView
        style={commonStyles.generalContainer}
        contentContainerStyle={[commonStyles.container, { gap: 10 }]}
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

        {/* Images */}
        <View>
          <Text style={inputStyles.header}>
            Images {images.length > 0 && `(${images.length}/${MAX_POST_IMAGES})`}
          </Text>

          {images.length > 0 ? (
            <>
              <ImageCarousel
                images={images.map(img => img.url)}
                keys={images.map(img => img.key)}
                pageType="edit"
                editable
              />
              {images.length < MAX_POST_IMAGES && (
                <Pressable
                  onPress={pickImages}
                  disabled={loading}
                  style={createPostStyles.addMoreImagesButton}
                >
                  <Feather name="plus" size={24} color={colors.purple} />
                  <Text style={{ color: colors.purple, fontSize: 16, fontWeight: "500" }}>
                    Add More Images
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
            <Pressable
              onPress={pickImages}
              disabled={loading}
              style={createPostStyles.uploadImageButton}
            >
              <Feather name="upload" size={40} color={colors.purple} />
              <Text style={{ marginTop: 10, color: colors.dark, fontSize: 16 }}>Upload Images</Text>
            </Pressable>
          )}
        </View>

        <View style={createPostStyles.lastPageRowContainer}>
          <View style={createPostStyles.lastPageRowLabelContainer}>
            <Text style={createPostStyles.lastPageQuestion}>Public Post</Text>
            <Pressable
              onPress={() =>
                Toast.show({
                  type: "info",
                  text1: "Public Post",
                  text2: "Toggle this option to make your post visible to other users.",
                })
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
        <CustomButton
          onPress={handleSave}
          disabled={loading || !hasChanges}
          color={loading ? colors.lightGray : colors.purple}
          fontSize={16}
        >
          {loading ? "Sending..." : "Save Changes"}
        </CustomButton>

        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </>
  )
}
