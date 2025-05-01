export interface Seat {
  id: string;
  number: number;
  isAvailable: boolean;
  position: {
    row: number;
    column: number;
  };
  type: 'standard' | 'premium' | 'disabled';
  price: number;
}