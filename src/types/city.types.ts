export interface City {
  _id: string
  name: string
  country_name: string
  state_name: string
  population: number
  location: {
    type: string
    coordinates: [number, number] // [longitude, latitude]
  }
  timezone: string
  score: number
}
