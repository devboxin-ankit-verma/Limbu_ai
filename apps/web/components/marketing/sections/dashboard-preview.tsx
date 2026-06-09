"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BAR_DATA,
  DONUT_DATA,
  KPI_METRICS,
  LINE_CHART_DATA,
} from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

export function DashboardPreview() {
  return (
    <section className="m-section m-section-alt">
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading
            label="Analytics"
            title="Full Business Profile"
            description="Track views, clicks, calls, and reviews — all from one unified dashboard."
          />
        </ScrollReveal>

        <div className="m-dashboard-kpis">
          {KPI_METRICS.map((kpi, i) => (
            <ScrollReveal key={kpi.label} delay={(i % 3) as 0 | 1 | 2}>
              <div className="m-kpi-card">
                <div className="m-kpi-label">{kpi.label}</div>
                <div className="m-kpi-value">{kpi.value}</div>
                <div className="m-kpi-change">{kpi.change}</div>
                <div className="m-kpi-spark">
                  {kpi.spark.map((h, idx) => (
                    <span key={idx} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="m-dashboard-charts">
          <ScrollReveal>
            <div className="m-chart-card">
              <h4>Profile Views & Clicks</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={[...LINE_CHART_DATA]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#FACC15"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>

          <div className="m-chart-row">
            <ScrollReveal delay={1}>
              <div className="m-chart-card">
                <h4>Traffic Sources</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[...DONUT_DATA]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {DONUT_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className="m-chart-card">
                <h4>Weekly Engagement</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[...BAR_DATA]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#FACC15" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
