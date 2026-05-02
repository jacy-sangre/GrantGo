"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegionForm() {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        toast.success("Region tag action scaffolded.");
        setValue("");
      }}
    >
      <div className="flex-1 space-y-1">
        <Label htmlFor="region_name">Region Name</Label>
        <Input id="region_name" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Region name" />
      </div>
      <Button type="submit">Add Region</Button>
    </form>
  );
}
