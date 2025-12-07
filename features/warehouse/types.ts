export interface UIWarehouse {
  id: string;
  name: string;
  location: string;
  capacityUsed: number;
  itemsInTransit: number;
  itemsStored: number;
  staff: number;
  docks: number;
  status: string;
  lastUpdated: string;
}
