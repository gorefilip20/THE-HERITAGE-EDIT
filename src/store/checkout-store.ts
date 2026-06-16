import { create } from "zustand";
import type { ShippingAddress, ShippingOption, TaxDutyEstimate } from "@/types";

type CheckoutStep = "information" | "shipping" | "payment" | "confirmation";

interface CheckoutState {
  step: CheckoutStep;
  email: string;
  shippingAddress: ShippingAddress | null;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  taxDuty: TaxDutyEstimate | null;
  paymentIntentClientSecret: string | null;
  orderNumber: string | null;
  isProcessing: boolean;

  setStep: (step: CheckoutStep) => void;
  setEmail: (email: string) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setShippingOptions: (options: ShippingOption[]) => void;
  selectShipping: (option: ShippingOption) => void;
  setTaxDuty: (taxDuty: TaxDutyEstimate) => void;
  setPaymentIntentClientSecret: (secret: string) => void;
  setOrderNumber: (orderNumber: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: "information" as CheckoutStep,
  email: "",
  shippingAddress: null,
  shippingOptions: [],
  selectedShipping: null,
  taxDuty: null,
  paymentIntentClientSecret: null,
  orderNumber: null,
  isProcessing: false,
};

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  setShippingAddress: (shippingAddress) => set({ shippingAddress }),
  setShippingOptions: (shippingOptions) => set({ shippingOptions }),
  selectShipping: (selectedShipping) => set({ selectedShipping }),
  setTaxDuty: (taxDuty) => set({ taxDuty }),
  setPaymentIntentClientSecret: (paymentIntentClientSecret) =>
    set({ paymentIntentClientSecret }),
  setOrderNumber: (orderNumber) => set({ orderNumber }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  reset: () => set(initialState),
}));
