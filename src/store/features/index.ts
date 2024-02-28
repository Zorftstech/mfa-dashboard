import { StateCreator } from 'zustand';

export type FeaturesStateType = {
  categories: any;
  setCategories: (arg: any) => void;
  subcategories: any;
  setSubcategories: (arg: any) => void;
  isLoading: boolean;
  setLoading: (arg: boolean) => void;
};

const featuresSlice: StateCreator<FeaturesStateType, [['zustand/devtools', never]], []> = (
  set,
) => ({
  categories: [],
  subcategories: [],
  isLoading: false,
  setLoading: (arg) => {
    set({ isLoading: arg });
  },
  setSubcategories: (arg) => {
    set({ subcategories: arg });
  },
  setCategories: (arg) => {
    set({ categories: arg });
  },
});

export default featuresSlice;
