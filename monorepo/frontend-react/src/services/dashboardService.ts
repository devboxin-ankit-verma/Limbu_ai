import { reportService } from './reportService';

function todayRange() {
  const d = new Date();
  const from = new Date(d);
  from.setHours(0, 0, 0, 0);
  const to = new Date(d);
  to.setHours(23, 59, 59, 999);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

export interface DashboardStats {
  buyTurnover: number;
  sellTurnover: number;
  totalTurnover: number;
  activeUsers: number;
  profitLoss: number;
  brokerage: number;
  activeBuy: number;
  activeSell: number;
}

export async function fetchDashboardStats(): Promise<Partial<DashboardStats>> {
  const { dateFrom, dateTo } = todayRange();
  try {
    const [turnoverRaw, pnlRaw, brokerageRaw] = await Promise.all([
      reportService.getTurnover({ dateFrom, dateTo }),
      reportService.getProfitLoss({ dateFrom, dateTo }),
      reportService.getBrokerage({ dateFrom, dateTo }),
    ]);
    const turnover = Array.isArray(turnoverRaw) ? turnoverRaw : [];
    const pnl = Array.isArray(pnlRaw) ? pnlRaw : [];
    const brokerage = brokerageRaw as { totalBrokerage?: number; count?: number } | undefined;
    const totalBrokerage = brokerage?.totalBrokerage ?? 0;
    let buyTurnover = 0;
    let sellTurnover = 0;
    let activeBuy = 0;
    let activeSell = 0;
    turnover.forEach((row) => {
      const r = row as Record<string, unknown>;
      const buy = Number(r.buyTurnover ?? r.buy ?? 0);
      const sell = Number(r.sellTurnover ?? r.sell ?? 0);
      buyTurnover += buy;
      sellTurnover += sell;
      activeBuy += Number(r.activeBuy ?? 0);
      activeSell += Number(r.activeSell ?? 0);
    });
    let profitLoss = 0;
    pnl.forEach((row) => {
      const r = row as Record<string, unknown>;
      profitLoss += Number(r.pnl ?? r.profitLoss ?? 0);
    });
    return {
      buyTurnover,
      sellTurnover,
      totalTurnover: buyTurnover + sellTurnover,
      profitLoss,
      brokerage: totalBrokerage,
      activeBuy,
      activeSell,
    };
  } catch {
    return {};
  }
}
