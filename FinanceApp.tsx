import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export default function FinanceApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({ amount: "", date: "", description: "" });

  useEffect(() => {
    // Load transactions from localStorage (mock DB for now)
    const data = localStorage.getItem("transactions");
    if (data) setTransactions(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!form.amount || !form.date || !form.description) return;
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(form.amount),
      date: form.date,
      description: form.description,
    };
    setTransactions([newTransaction, ...transactions]);
    setForm({ amount: "", date: "", description: "" });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const monthlyData = Object.values(
    transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString("default", { month: "short", year: "numeric" });
      acc[month] = acc[month] || { name: month, total: 0 };
      acc[month].total += t.amount;
      return acc;
    }, {} as Record<string, { name: string; total: number }>)
  );

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Personal Finance Visualizer</h1>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">Add Transaction</Button>
        </DialogTrigger>
        <DialogContent>
          <h2 className="text-lg font-semibold mb-2">New Transaction</h2>
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <Button onClick={addTransaction}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions yet.</p>
      ) : (
        <div className="space-y-2">
          {transactions.map(t => (
            <Card key={t.id} className="flex justify-between items-center p-2">
              <CardContent className="p-0">
                <p className="font-semibold">{t.description}</p>
                <p className="text-sm text-gray-600">{t.date}</p>
              </CardContent>
              <div className="flex items-center gap-4">
                <span className="font-bold">${t.amount.toFixed(2)}</span>
                <Button variant="outline" onClick={() => deleteTransaction(t.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Monthly Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}