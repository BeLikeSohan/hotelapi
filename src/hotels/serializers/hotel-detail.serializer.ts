import { Hotel } from '../entities/hotel.entity';

export type HotelDetailResponse = {
  id: string;
  name: string;
  description: string;
  starRating: number;
  overallRating: number;
  reviewCount: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  amenities: string[];
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellation: string;
  };
};

function serializeTime(time: string): string {
  return time.slice(0, 5);
}

export function serializeHotelDetail(hotel: Hotel): HotelDetailResponse {
  return {
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    starRating: hotel.starRating,
    overallRating: hotel.overallRating,
    reviewCount: hotel.reviewCount,
    address: {
      street: hotel.addressStreet,
      city: hotel.addressCity,
      state: hotel.addressState,
      zipCode: hotel.addressZipCode,
      country: hotel.addressCountry,
    },
    contact: {
      phone: hotel.contactPhone,
      email: hotel.contactEmail,
    },
    amenities: (hotel.amenities ?? []).map((amenity) => amenity.label),
    policies: {
      checkInTime: serializeTime(hotel.checkInTime),
      checkOutTime: serializeTime(hotel.checkOutTime),
      cancellation: hotel.cancellationPolicy,
    },
  };
}
