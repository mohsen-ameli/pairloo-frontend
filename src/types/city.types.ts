export interface City {
  _id: number
  name: string
  country_name: string
  state_name: string
  population: number
  latitude: number
  longitude: number
  location: {
    type: string
    coordinates: [number, number] // [longitude, latitude]
  }
  timezone: string
  score: number
}
