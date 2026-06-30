import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Calculator, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CashCutProps {
  onClose: () => void;
}

const denominations = [
  { key: 'b20000', label: '₡20,000', value: 20000 },
  { key: 'b10000', label: '₡10,000', value: 10000 },
  { key: 'b5000', label: '₡5,000', value: 5000 },
  { key: 'b2000', label: '₡2,000', value: 2000 },
  { key: 'b1000', label: '₡1,000', value: 1000 },
  { key: 'c500', label: '₡500', value: 500 },
  { key: 'c100', label: '₡100', value: 100 },
  { key: 'c50', label: '₡50', value: 50 },
  { key: 'c25', label: '₡25', value: 25 },
];

const CashCut = ({ onClose }: CashCutProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [sales, setSales] = useState({ cash: 0, card: 0, total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      // Find last cash cut for this cashier
      const { data: lastCut } = await supabase
        .from('cash_cuts')
        .select('closed_at')
        .eq('cashier_id', user.id)
        .order('closed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const since = lastCut?.closed_at ?? new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total, payment_method')
        .eq('cashier_id', user.id)
        .eq('status', 'paid')
        .gte('created_at', since);

      const ids = (invoices ?? []).map((i) => i.id);
      let cash = 0;
      let card = 0;
      if (ids.length) {
        const { data: pays } = await supabase
          .from('payment_details')
          .select('method, amount')
          .in('invoice_id', ids);
        (pays ?? []).forEach((p: any) => {
          if (p.method === 'cash') cash += Number(p.amount);
          else if (p.method === 'card') card += Number(p.amount);
        });
      }
      const total = (invoices ?? []).reduce((s, i: any) => s + Number(i.total), 0);
      setSales({ cash, card, total, count: invoices?.length ?? 0 });
      setLoading(false);
    };
    load();
  }, [user]);

  const counted = denominations.reduce((s, d) => s + (counts[d.key] || 0) * d.value, 0);
  const difference = counted - sales.cash;

  const generate = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('cash_cuts').insert({
      cashier_id: user.id,
      system_cash: sales.cash,
      system_card: sales.card,
      system_total: sales.total,
      counted_cash: counted,
      difference,
      invoice_count: sales.count,
      denominations: counts as any,
    });
    setSaving(false);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Corte generado', description: `Diferencia: ₡${difference.toFixed(2)}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6" /> Corte de Caja</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="h-4 w-4" />{new Date().toLocaleString()}</div>
          </div>

          {loading ? <p className="text-center text-gray-500 py-8">Cargando ventas...</p> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Conteo de Efectivo</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {denominations.map((d) => (
                    <div key={d.key} className="flex items-center justify-between">
                      <Label className="w-20">{d.label}</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" min="0" value={counts[d.key] || 0} onChange={(e) => setCounts({ ...counts, [d.key]: parseInt(e.target.value) || 0 })} className="w-20 text-center" />
                        <span className="w-24 text-right text-sm text-gray-600">{((counts[d.key] || 0) * d.value).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold"><span>Total contado:</span><span>{counted.toLocaleString()}</span></div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Ventas del Turno</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between"><span>Transacciones:</span><span className="font-semibold">{sales.count}</span></div>
                    <div className="flex justify-between"><span>Total ventas:</span><span className="font-semibold">{sales.total.toFixed(2)}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span>Efectivo:</span><span className="font-semibold">{sales.cash.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tarjeta:</span><span className="font-semibold">{sales.card.toFixed(2)}</span></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Comparación</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between"><span>Esperado en caja:</span><span className="font-semibold">{sales.cash.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Contado:</span><span className="font-semibold">{counted.toFixed(2)}</span></div>
                    <Separator />
                    <div className={`flex justify-between text-lg font-bold ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      <span>Diferencia:</span>
                      <span>{difference > 0 ? '+' : ''}{difference.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={generate} disabled={saving || loading} className="bg-orange-600 hover:bg-orange-700">
              <DollarSign className="h-4 w-4 mr-2" /> {saving ? 'Guardando...' : 'Generar Corte'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashCut;
