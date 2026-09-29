"use client";

import { useMutation } from "@tanstack/react-query";
import { analyticsApi } from "./api";

export const useTrackEvent = () => useMutation({ mutationFn: analyticsApi.track });
