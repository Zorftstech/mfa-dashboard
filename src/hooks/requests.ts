import axios from 'axios';
import { processError } from 'helper/error';
import { useState, useEffect } from 'react';
import { axiosRequest } from 'services';
import useUserStore from 'store/globalUserStore';

export function useCreate<T extends object>(params: string) {
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();

  async function create(payload: T) {
    try {
      setLoading(true);
      //    await axiosRequest.post({ url: params, payload: payload });

      const response = await axios.post(`https://api0.loystar.co/api/v2/${params}`, payload, {
        headers: {
          client: user?.client,
          'access-token': user?.access_token,
          uid: user?.uid,
        },
      });

      return response?.data;

      // console.log(response.data)
    } catch (error: any) {
      processError(error);

      return null;
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    create,
  };
}

/**

   */

/**
 *
 * @param endpoint
 * @param enable
 * @returns
 */

export function useGetData<TData>(endpoint: string, enable = true) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData | null>(null);

  async function fetchData() {
    if (!enable) return;
    try {
      setLoading(true);
      const response = await axiosRequest.get(endpoint);

      setData(response?.data);
      //   const total = Math.ceil(response?.data?.totalItems / 20);
    } catch (error: any) {
      processError(error);
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [endpoint]);
  return {
    data,
    loading,
    refetch: fetchData,
  };
}

export function useLoystarGetRequest<TData>(endpoint: string, payload: any) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await axiosRequest.post({ url: endpoint, payload });

      setData(response?.data);
    } catch (error: any) {
      processError(error);
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  async function queryData() {
    try {
      const response = await axiosRequest.post({ url: endpoint, payload });

      return response?.data;
    } catch (error: any) {
      processError(error);
      // Handle error
      return [];
    }
  }



  useEffect(() => {
    fetchData();
  }, [endpoint]);
  return {
    data,
    loading,
    refetch: fetchData,
    queryData,
  };
}

export function useDelete() {
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();


  async function deletes(params: string) {
    try {
      setLoading(true);
      await axios.delete(
        `https://api0.loystar.co/api/v2/${params}`,
        
        {
          headers: {
            client: user?.client,
            'access-token': user?.access_token,
            uid: user?.uid,
          },
        },
      );
    } catch (error: any) {
      processError(error);
    } finally {
      setLoading(false);
    }
  }


  async function postDeletes(params: string) {
    try {
      setLoading(true);
      await axios.post(
        `https://api0.loystar.co/api/v2/${params}`,
        {},
        {
          headers: {
            client: user?.client,
            'access-token': user?.access_token,
            uid: user?.uid,
          },
        },
      );
    } catch (error: any) {
      processError(error);
    } finally {
      setLoading(false);
    }
  }
  return {
    deleteLoading :loading,
    postDeletes,
    deletes
  };
}

export function useMutate<T extends object>(params: string) {
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();

  async function mutating(payload: T, infunctionParam?: string) {
    try {
      setLoading(true);
      //    await axiosRequest.post({ url: params, payload: payload });

      const response = await axios.put(
        `https://api0.loystar.co/api/v2/${infunctionParam || params}`,
        payload,
        {
          headers: {
            client: user?.client,
            'access-token': user?.access_token,
            uid: user?.uid,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      processError(error);

      return null;
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    mutating,
  };
}
