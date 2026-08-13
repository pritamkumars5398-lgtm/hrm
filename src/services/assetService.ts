import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type Asset = {
  id: string;
  assetTag: string;
  name: string;
  category:
    | 'Laptop'
    | 'Desktop'
    | 'Monitor'
    | 'Mobile'
    | 'Tablet'
    | 'ID Card'
    | 'Access Card'
    | 'Furniture'
    | 'Vehicle'
    | 'SIM'
    | 'Accessory'
    | 'License';
  assignedTo: string;
  assignedToId?: string | null;
  status: 'AVAILABLE' | 'ASSIGNED' | 'REPAIR' | 'RETIRED';
  serialNumber?: string | null;
};

export class AssetError extends Error {}

export const assetService = {
  async listAssets(): Promise<Asset[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Asset[]>('/assets');
        return data;
      } catch (error) {
        throw new AssetError(apiErrorMessage(error, 'Could not load asset inventory.'));
      }
    }
    return [];
  },

  async listMyAssets(): Promise<Asset[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Asset[]>('/assets/my-assets');
        return data;
      } catch (error) {
        throw new AssetError(apiErrorMessage(error, 'Could not load your assigned assets.'));
      }
    }
    return [];
  },

  async createAsset(payload: {
    name: string;
    category: Asset['category'];
    serialNumber?: string;
    assetTag?: string;
  }): Promise<Asset> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<Asset>('/assets', payload);
        return data;
      } catch (error) {
        throw new AssetError(apiErrorMessage(error, 'Could not add asset.'));
      }
    }
    return {
      id: `ast-${Date.now()}`,
      assetTag:
        payload.assetTag ||
        `AST-${payload.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: payload.name,
      category: payload.category,
      assignedTo: 'Unassigned',
      status: 'AVAILABLE',
      serialNumber: payload.serialNumber || `SN${Math.floor(100000 + Math.random() * 900000)}`,
    };
  },

  async updateAssetStatus(
    id: string,
    status: Asset['status'],
    assignedToId?: string,
  ): Promise<Asset> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<Asset>(`/assets/${id}/status`, {
          status,
          assignedToId,
        });
        return data;
      } catch (error) {
        throw new AssetError(apiErrorMessage(error, 'Could not update asset status.'));
      }
    }
    return {
      id,
      assetTag: 'AST-MOCK',
      name: 'Mock Asset',
      category: 'Laptop',
      assignedTo: 'Unassigned',
      status,
    };
  },

  async deleteAsset(id: string): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.delete(`/assets/${id}`);
      } catch (error) {
        throw new AssetError(apiErrorMessage(error, 'Could not delete asset.'));
      }
    }
  },
};
