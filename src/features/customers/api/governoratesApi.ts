import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { Governorate, PaginatedResponse } from '../types';

const MOCK_GOVERNORATES: Governorate[] = [
  { id: '972d654c-a4e9-4c78-b241-88bdeb83eb21', name: 'حلب' },
  { id: '515bf8af-a384-42c3-bdc7-8c32ac3b6dfd', name: 'حماة' },
  { id: '40c287da-2ccf-4483-ac86-eda41813e5cc', name: 'حمص' },
  { id: 'a20c76de-acec-48bc-9353-762d1c1f89e6', name: 'دمشق' },
  { id: '6086c696-b779-420c-86b2-7e8ca2e3a064', name: 'طرطوس' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const reportDebug = (hypothesisId: string, location: string, msg: string, data?: Record<string, unknown>) =>
  fetch("http://10.123.72.83:7777/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "customer-governorate-400",
      runId: "pre-fix",
      hypothesisId,
      location,
      msg,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});

export const governoratesApi = {
  getGovernorates: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Governorate>> => {
    try {
      // #region debug-point E:get-governorates-request
      reportDebug("E", "governoratesApi.ts:31", "[DEBUG] requesting governorates page", {
        page,
        limit,
        mock: USE_MOCK_API,
      });
      // #endregion
      if (USE_MOCK_API) {
        await delay(500);
        return {
          data: MOCK_GOVERNORATES.slice((page - 1) * limit, page * limit),
          pagination: {
            total: MOCK_GOVERNORATES.length,
            page,
            limit,
            pages: Math.max(1, Math.ceil(MOCK_GOVERNORATES.length / limit)),
          },
        };
      }

      const response = await apiClient.get(`/governorates?page=${page}&limit=${limit}`);
      const body = response.data?.body || response.data?.data || {};
      const data = body?.data || [];
      const pagination = body?.pagination || {
        total: data.length,
        page,
        limit,
        pages: 1,
      };

      return { data, pagination };
    } catch (error: any) {
      console.error("getGovernorates Error:", error);
      return {
        data: MOCK_GOVERNORATES.slice((page - 1) * limit, page * limit),
        pagination: {
          total: MOCK_GOVERNORATES.length,
          page,
          limit,
          pages: Math.max(1, Math.ceil(MOCK_GOVERNORATES.length / limit)),
        },
      };
    }
  },

  updateMyGovernorate: async (governorateId: string): Promise<{ id: string; governorate_id: string }> => {
    const response = await apiClient.patch('/customers/me/governorate', {
      governorate_id: governorateId,
    });

    return response.data?.data || response.data?.body || response.data;
  },
};
