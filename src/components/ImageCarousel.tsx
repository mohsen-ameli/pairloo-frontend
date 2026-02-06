import { Dimensions, Platform, View } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel"
import { SlideItem } from "./SlideItem"
import { Dispatch, useEffect, useRef, useState } from "react"
import { colors } from "@/src/utils/colors"
import { SetStateAction } from "jotai"

export default function ImageCarousel({
  images,
  setImages,
  widthOffset = 0,
  editable = false,
}: {
  images: string[]
  setImages?: Dispatch<SetStateAction<string[]>>
  widthOffset?: number
  editable?: boolean
}) {
  const ref = useRef<ICarouselInstance>(null)
  const progress = useSharedValue<number>(0)
  const [width, setWidth] = useState(Dimensions.get("window").width - widthOffset)

  useEffect(() => {
    setWidth(Dimensions.get("window").width - widthOffset)
  }, [widthOffset])

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    })
  }

  if (images.length === 1) {
    return (
      <View style={{ width: "auto", height: 250, borderRadius: 15, overflow: "hidden" }}>
        <SlideItem
          index={0}
          source={{ uri: images[0] }}
          setImages={setImages}
          editable={editable}
        />
      </View>
    )
  }

  return (
    <View style={{ alignItems: "center", paddingBottom: 20, height: 280 }}>
      <Carousel
        autoPlayInterval={2000}
        data={images}
        loop={true}
        pagingEnabled={true}
        snapEnabled={true}
        width={width}
        style={{
          width,
          height: 250,
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
          <SlideItem
            index={index}
            source={{ uri: item }}
            setImages={setImages}
            editable={editable}
          />
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
