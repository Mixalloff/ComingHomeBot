interface IApartmentsListResponse {
  data: IApartmentItem[],
  meta: any,
}

interface IApartmentMedia {
  imagekit: string[];
  vr: {
    id: string;
  };
}

interface IApartmentItem {
  available: boolean;
  availableByArrangement: boolean;
  availableFrom: string; // yyyy-mm-dd
  availableTo: string | null;
  baths: string;
  bedrooms: string;
  cid:string;
  city: string;
  cityHandles: string[];
  district: string;
  districtHandles: string[]; 
  extraHandles: string[];
  handle: string;
  latitudeObfuscated: number;
  longitudeObfuscated: number;
  media: IApartmentMedia;
  neighborhood: string;
  neighborhoodHandles: string[];
  order: string;
  periodMin: string;
  personsMax: number;
  postCode: string;
  published: boolean;
  rent: number;
  rooms: string;
  squaremeter: number;
  street: string;
  subtitle: string;
  title: string;
  transportHandles: string[] | null;
  oldCid?: string;
}
