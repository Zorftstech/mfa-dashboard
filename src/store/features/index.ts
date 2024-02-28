import { StateCreator } from 'zustand';

export type FeaturesStateType = {
  categories: any;
  setCategories: (arg: any) => void;
  subcategories: any;
  setSubcategories: (arg: any) => void;
};

const featuresSlice: StateCreator<FeaturesStateType, [['zustand/devtools', never]], []> = (
  set,
) => ({
  categories: [],
  subcategories: [],
  setSubcategories: (arg) => {
    set({ subcategories: arg });
  },
  setCategories: (arg) => {
    set({ categories: arg });
  },
});

export default featuresSlice;
