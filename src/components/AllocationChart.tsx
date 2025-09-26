import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface AllocationChartProps {
  allocations: {
    equity: number;
    gold: number;
    bonds: number;
  };
}

export const AllocationChart = ({ allocations }: AllocationChartProps) => {
  const data: AllocationData[] = [
    {
      name: "Equity (S&P 500)",
      value: allocations.equity,
      color: "hsl(var(--equity))",
    },
    {
      name: "Gold",
      value: allocations.gold,
      color: "hsl(var(--gold))",
    },
    {
      name: "Bonds",
      value: allocations.bonds,
      color: "hsl(var(--bonds))",
    },
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};