import { Dimensions, Platform, View } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel"
import { SlideItem } from "./SlideItem"
import { useEffect, useRef, useState } from "react"
import { colors } from "@/src/utils/colors"
import { useSetAtom } from "jotai"
import { bigImageViewAtom } from "../store/chat-store"

export default function ImageCarousel({
  images,
  widthOffset = 0,
  editable = false,
}: {
  images: string[]
  widthOffset?: number
  editable?: boolean
}) {
  const ref = useRef<ICarouselInstance>(null)
  const progress = useSharedValue<number>(0)
  const [width, setWidth] = useState(Dimensions.get("window").width - widthOffset)
  const setImages = useSetAtom(bigImageViewAtom)

  useEffect(() => {
    setImages(
      images.map((att, id) => ({
        uri: att,
        id: id.toString(),
      }))
    )
  }, [images])

  useEffect(() => {
    if (Platform.OS === "web") {
      setWidth(600)
    } else {
      setWidth(Dimensions.get("window").width - widthOffset)
    }
  }, [widthOffset])

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    })
  }

  if (images.length === 1) {
    return <SlideItem index={0} source={{ uri: images[0] }} editable={editable} />
  }

  return (
    <View style={{ alignItems: "center", paddingBottom: 20, height: 500 }}>
      <Carousel
        autoPlayInterval={2000}
        data={images}
        loop={true}
        pagingEnabled={true}
        snapEnabled={true}
        width={width}
        style={{
          width,
          height: 450,
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: Platform.OS === "ios" ? 60 : 65,
          parallaxAdjacentItemScale: 0.75,
        }}
        onProgressChange={(offsetProgress, absoluteProgress) => {
          progress.value = absoluteProgress
        }}
        renderItem={({ index, item }) => (
          <SlideItem index={index} source={{ uri: item }} editable={editable} />
        )}
        ref={ref}
      />

      <Pagination.Basic
        progress={progress}
        data={images}
        dotStyle={{
          backgroundColor: colors.borderGray,
          borderRadius: 50,
          width: 10,
          height: 10,
        }}
        containerStyle={{ gap: 5 }}
        onPress={onPressPagination}
      />
    </View>
  )
}
