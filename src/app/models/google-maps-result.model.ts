export class GymCenters {
    id: number;
    name: string;
    latitude: number; 
    longitude: number; 
  
    constructor(object?: any) {
      this.id = object && object.id || null;
      this.name = object && object.name || null;
      this.latitude = object && object.latitude || null; 
      this.longitude = object && object.longitude || null; 
    }
  }
  