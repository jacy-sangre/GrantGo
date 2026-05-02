import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Providers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-brand">0</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Regions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-brand">0</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scholarships</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-brand">0</CardContent>
        </Card>
      </div>
    </section>
  );
}
