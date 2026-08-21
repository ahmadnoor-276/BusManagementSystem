export type Route = {
  id: string;
  fromCity: string;
  toCity: string;
  createdAt: string;
  _count?: { buses: number };
};

export type Driver = {
  id: string;
  name: string;
  gender: string;
  age: number;
  contact: string;
  address: string;
  createdAt: string;
  _count?: { buses: number };
};

export type Bus = {
  id: string;
  busNumber: string;
  createdAt: string;
  route: Route;
  driver: Driver | null;
};

export type Schedule = {
  id: string;
  departureTime: string;
  createdAt: string;
  bus: Bus;
};
