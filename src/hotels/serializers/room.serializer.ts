import { Room } from '../entities/room.entity';

export type RoomAvailabilityResponse = {
  id: string;
  hotelId: string;
  type: string;
  bedType: string;
  bedCount: number;
  maxOccupancy: number;
  squareFootage: number;
  pricePerNight: number;
  totalPrice: number;
  amenities: string[];
  availableDates: string[];
};

export function serializeAvailableRoom(
  room: Room,
  requestedDates: string[],
): RoomAvailabilityResponse {
  return {
    id: room.id,
    hotelId: room.hotelId,
    type: room.type,
    bedType: room.bedType,
    bedCount: room.bedCount,
    maxOccupancy: room.maxOccupancy,
    squareFootage: room.squareFootage,
    pricePerNight: room.pricePerNight,
    totalPrice: room.pricePerNight * requestedDates.length,
    amenities: (room.amenities ?? []).map((amenity) => amenity.label),
    availableDates: requestedDates,
  };
}
