"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { checkoutApi } from "./api";

export const checkoutKeys = { shipping: ["checkout", "shipping"] as const };

export const useShippingOptions = () => useQuery({ queryKey: checkoutKeys.shipping, queryFn: checkoutApi.shipping, staleTime: 5 * 60_000 });
export const useValidateCoupon = () => useMutation({ mutationFn: checkoutApi.validateCoupon });
export const useCreateSale = () => useMutation({ mutationFn: checkoutApi.createSale });
export const useUploadReceipt = () => useMutation({ mutationFn: checkoutApi.uploadReceipt });
