import Link from "next/link";
export function FactoryPlaceholder({ title }: { title: string }) {
  return <section className="mx-auto max-w-4xl space-y-5">
    <h1 className="text-2xl font-bold">{title}</h1>
    <div className="rounded-2xl border border-dashed p-8">
      <h2 className="font-semibold">လုပ်ဆောင်ချက် မရရှိသေးပါ</h2>
      <p className="mt-3 text-sm text-muted-foreground">ဤလုပ်ဆောင်ချက်ကို ပြင်ဆင်နေဆဲ ဖြစ်ပါသည်။</p>
      <Link className="mt-6 inline-block text-sm underline" href="/factory">Factory Overview သို့ ပြန်သွားရန</Link>
    </div>
  </section>;
}
