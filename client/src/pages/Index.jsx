import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Gauge, Wind, Compass, Zap, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const velocityData = [
  { time: "00:00", speed: 12.4 },
  { time: "00:05", speed: 15.2 },
  { time: "00:10", speed: 18.6 },
  { time: "00:15", speed: 16.8 },
  { time: "00:20", speed: 21.3 },
  { time: "00:25", speed: 19.7 },
];

const altitudeData = [
  { time: "00:00", altitude: 45 },
  { time: "00:05", altitude: 58 },
  { time: "00:10", altitude: 72 },
  { time: "00:15", altitude: 65 },
  { time: "00:20", altitude: 88 },
  { time: "00:25", altitude: 82 },
];

const stats = [
  { title: "Current Speed", value: "19.7 m/s", icon: Gauge, status: "Active" },
  { title: "Acceleration", value: "2.3 m/s²", icon: Zap, status: "Nominal" },
  { title: "Fan Speed", value: "4,250 RPM", icon: Wind, status: "Optimal" },
  { title: "Direction", value: "N 42° E", icon: Compass, status: "Tracking" },
];

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Simulate connection status check
    const interval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.1 ? true : prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Drone Detection System</h1>
            <p className="text-sm text-muted-foreground">Real-time motion analysis and tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-accent"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border/50 bg-card backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</div>
                  <p className="text-xs font-medium text-primary">
                    {stat.status}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="border-border/50 bg-card backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-foreground">Velocity Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={velocityData}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="1 1" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    label={{ value: 'm/s', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="linear"
                    dataKey="speed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVelocity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-foreground">Altitude Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={altitudeData}>
                  <CartesianGrid strokeDasharray="1 1" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    label={{ value: 'meters', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Line 
                    type="linear"
                    dataKey="altitude" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
