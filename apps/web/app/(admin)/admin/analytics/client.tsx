import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, BarChart2 } from 'lucide-react'

export function AnalyticsDashboardClient({ metrics, contentMetrics }: { metrics: any[], contentMetrics: any[] }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-blue-500" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Track your platform performance and user engagement.</p>
        </div>
        <a href="/admin/analytics/export">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white border-none rounded-xl px-6 py-6 font-black uppercase tracking-widest text-xs">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.eventType} className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{m.eventType}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black tracking-tighter">{m.count.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content ID</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Total Count</TableHead>
                <TableHead className="text-muted-foreground/50">&lt; 10s</TableHead>
                <TableHead className="text-muted-foreground/50">10s - 30s</TableHead>
                <TableHead className="text-muted-foreground/50">30s - 60s</TableHead>
                <TableHead className="text-muted-foreground/50">&gt; 60s</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentMetrics.map((cm, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs">{cm.contentId}</TableCell>
                  <TableCell>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {cm.eventType}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">{cm.count}</TableCell>
                  <TableCell className="text-muted-foreground">{cm.watchSecsLt10}</TableCell>
                  <TableCell className="text-muted-foreground">{cm.watchSecs10to30}</TableCell>
                  <TableCell className="text-muted-foreground">{cm.watchSecs30to60}</TableCell>
                  <TableCell className="text-muted-foreground">{cm.watchSecsGt60}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
