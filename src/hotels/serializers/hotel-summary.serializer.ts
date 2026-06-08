import { Hotel } from '../entities/hotel.entity';

export type HotelSummaryResponse = {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  starRating: number;
  overallRating: number;
  reviewCount: number;
  lowestPricePerNight: number | null;
  amenities: string[];
};

export function serializeHotelSummary(hotel: Hotel): HotelSummaryResponse {
  const roomPrices = (hotel.rooms ?? []).map((room) => room.pricePerNight);

  return {
    id: hotel.id,
    name: hotel.name,
    city: hotel.addressCity,
    state: hotel.addressState,
    country: hotel.addressCountry,
    starRating: hotel.starRating,
    overallRating: hotel.overallRating,
    reviewCount: hotel.reviewCount,
    lowestPricePerNight: roomPrices.length > 0 ? Math.min(...roomPrices) : null,
    amenities: (hotel.amenities ?? []).map((amenity) => amenity.label),
  };
}
