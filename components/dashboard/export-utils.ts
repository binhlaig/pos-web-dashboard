import type { TransactionItem } from "@/lib/dashboard-data";

export function exportTransactionsCSV(rows: TransactionItem[]) {
  const headers = ["ID", "Customer", "Type", "Amount", "Shop", "Time"];
  const body = rows.map((r) => [
    r.id,
    r.customer,
    r.type,
    String(r.amount),
    r.shop,
    r.time,
  ]);

  const csv = [headers, ...body]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();

  URL.revokeObjectURL(url);
}