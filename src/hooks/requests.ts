import { processError } from "helper/error";
import { useState } from "react";
import { axiosRequest } from "services";


export function useCreate<T extends object>(params: string) {
    const [loading, setLoading] = useState(false);
  
    async function create(payload: T) {
      try {
        setLoading(true);
        await axiosRequest.post({ url: params, payload: payload });
      } catch (error: any) {
        processError(error);
      } finally {
        setLoading(false);
      }
    }
    return {
      loading,
      create,
    };
  }