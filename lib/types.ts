export type Route = {
  id: string;
  fromCity: string;
  toCity: string;
  createdAt: string;
  _count?: { buses: number };
};

export type Bus = {
  id: string;
  busNumber: string;
  driverName: string;
  createdAt: string;
  route: Route;
};

export type Schedule = {
  id: string;
  departureTime: string;
  createdAt: string;
  bus: Bus;
};
