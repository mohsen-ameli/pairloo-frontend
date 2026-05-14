import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from "expo-router"
import { View, Text, ScrollView, Pressable, Alert, Switch, BackHandler } from "react-native"
import { useState, useEffect, useCallback } from "react"
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
import { ImageObject } from "@/src/types/image-object.type"
import ImageCarousel from "@/src/components/ImageCarousel"
import { settingsAtom } from "@/src/store/create-post-store"
import React from "react"
import * as ImagePicker from "expo-image-picker"

export default function EditPost() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const authFetch = useSetAtom(authFetchAtom)
  const queryClient = useQueryClient()
  const settings = useAtomValue(settingsAtom)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [publicPost, setPublicPost] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [closeCity, setCloseCity] = useState("")
  const [distance, setDistance] = useState(5000)
  const [newImages, setNewImages] = useState<ImageObject[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [removedImages, setRemovedImages] = useState<string[]>([])

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
    if (!post) return

    setTitle(post.title)
    setDescription(post.description)
    setPublicPost(post.publicPost)
    setLocation(post.location || null)
    setExistingImages(post.images || [])
    setDistance(post.distance || 5000)
  }, [post])

  useFocusEffect(
    useCallback(() => {
      if (settings.location && settings.closeCity) {
        setLocation(settings.location)
        setCloseCity(settings.closeCity)
        setHasChanges(true)
      }
    }, [settings.location, settings.closeCity])
  )

  async function pickImages() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access the media library is required.")
      return
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
    })

    if (!result.canceled && result.assets.length > 0) {
      const newImagesList: ImageObject[] = []
      for (const asset of result.assets) {
        const localUri = asset.uri
        const mimeType = asset.mimeType || "image/jpeg"
        newImagesList.push({ localUri, mimeType, url: "", key: "" })
      }
      setNewImages(prev => [...prev, ...newImagesList])
      setHasChanges(true)
    }
  }

  async function handleSave() {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Title and description are required")
      return
    }

    setLoading(true)

    try {
      const imagesWithFiles: { file: Blob; mimeType: string }[] = []
      for (const img of newImages) {
        const response = await fetch(img.localUri)
        const blob = await response.blob()
        imagesWithFiles.push({ file: blob, mimeType: img.mimeType })
      }

      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("publicPost", publicPost.toString())
      if (location) {
        formData.append("location", JSON.stringify(location))
      }
      formData.append("distance", distance.toString())

      // Add existing images that weren't removed
      const keptExistingImages = existingImages.filter(img => !removedImages.includes(img))
      keptExistingImages.forEach((img, index) => {
        formData.append(`images[${index}]`, img)
      })

      // Add new images
      imagesWithFiles.forEach((img, index) => {
        formData.append(
          `newImages[${index}]`,
          img.file,
          `image_${index}.${img.mimeType.split("/")[1]}`
        )
      })

      if (removedImages.length > 0) {
        formData.append("removedImages", JSON.stringify(removedImages))
      }

      const res = await authFetch(`/api/posts/${id}`, {
        method: "PATCH",
        body: formData,
      })

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: [`post-${id}`] })
        queryClient.invalidateQueries({ queryKey: ["my-posts"] })
        router.back()
      } else {
        Alert.alert("Error", "Failed to update post. Please try again.")
      }
    } catch (error) {
      console.error("Error saving post:", error)
      Alert.alert("Error", "An error occurred while saving. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleRemoveExistingImage(image: string) {
    setExistingImages(prev => prev.filter(img => img !== image))
    setRemovedImages(prev => [...prev, image])
    setHasChanges(true)
  }

  function handleRemoveNewImage(index: number) {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  function handleImageCarouselRemove(index: number) {
    const totalExisting = existingImages.length

    if (index < totalExisting) {
      handleRemoveExistingImage(existingImages[index])
    } else {
      handleRemoveNewImage(index - totalExisting)
    }
  }

  async function handleLocationPress() {
    router.push("/map-selector")
  }

  const handleBackPress = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Your changes will be lost. Are you sure you want to discard your changes?",
        [
          { text: "Cancel", onPress: () => {}, style: "cancel" },
          {
            text: "Discard",
            onPress: () => router.back(),
            style: "destructive",
          },
        ]
      )
      return true
    } else {
      router.back()
      return true
    }
  }, [hasChanges, router])

  const detailOptions = useCustomHeader({
    title: "Edit Post",
    isEditMode: true,
    onSave: handleSave,
    canSave: hasChanges && !loading,
    onBackPress: handleBackPress,
  })

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress)
      return () => subscription.remove()
    }, [handleBackPress])
  )

  const hasImages = existingImages.length > 0 || newImages.length > 0

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
            value={title}
            onChangeText={text => {
              setTitle(text)
              setHasChanges(true)
            }}
            editable={!loading}
            mandatory
          />

          <CustomInput
            title="Description"
            headerStyles={{ fontSize: 16, fontWeight: "600" }}
            value={description}
            multiline
            onChangeText={text => {
              setDescription(text)
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
                  <Text style={inputStyles.input}>{closeCity || "Tap to select location"}</Text>
                </Pressable>
              </View>
              {location && closeCity && (
                <Pressable
                  style={editPostStyles.locationClearButton}
                  onPress={() => {
                    setLocation(null)
                    setCloseCity("")
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
                  images={[...existingImages, ...newImages.map(img => img.localUri)]}
                  editable
                  onRemove={handleImageCarouselRemove}
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
                  setPublicPost(value)
                  setHasChanges(true)
                }}
                value={publicPost}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  )
}
