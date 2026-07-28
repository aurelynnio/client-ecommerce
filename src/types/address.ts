import { User } from './user';

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

export interface AddressFormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

// Props types - move to component files ideally but keeping here for now if used across multiple
export interface AddressDialogProps {
  open: boolean;
  onClose: () => void;
  editingAddress: Address | null;
  onSuccess: () => void;
  user?: User | null;
}

export interface AddressTabProps {
  user?: User | null;
}

export interface ProfileTabProps {
  user?: User | null;
}
