export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export type HealthStatusResponse =
  | {
      status: "ok" | "degraded" | "error";
      timestamp: string;
      memory: {
        rssMB: string;
        heapTotalMB: string;
        heapUsedMB: string;
        usagePercent: number;
        externalMB: string;
      };
      system: {
        uptime: number;
        load: number[];
        freeMemMB: string;
        totalMemMB: string;
      };
      redis: Record<string, string>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queues: any;
      errors: string[] | undefined;
      error?: undefined;
    }
  | {
      status: string;
      error: string;
      timestamp?: undefined;
      memory?: undefined;
      system?: undefined;
      redis?: undefined;
      queues?: undefined;
      errors?: undefined;
    };
