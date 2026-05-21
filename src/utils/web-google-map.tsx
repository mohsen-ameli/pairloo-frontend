import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { memo, useCallback } from "react"

function WebGoogleMap({
  cameraPosition,
  zoomControl = true,
}: {
  cameraPosition: { coordinates: { lat: number; lng: number }; zoom: number }
  zoomControl?: boolean
}) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY! })

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setCenter(cameraPosition.coordinates)
    map.setZoom(cameraPosition.zoom)
  }, [])

  if (!isLoaded) return <></>

  return (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "100%",
      }}
      options={{
        zoomControl,
        disableDefaultUI: true,
        draggableCursor: "default",
        draggingCursor: "default",
        gestureHandling: "greedy",
      }}
      onLoad={onLoad}
    />
  )
}

export default memo(WebGoogleMap)
