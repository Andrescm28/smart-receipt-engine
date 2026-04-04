import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Banknote, Split, AlertCircle, CheckCircle2 } from 'lucide-react';

export type PaymentMethod = 'cash' | 'card' | 'split';

export interface PaymentResult {
  paymentType: PaymentMethod;
  cashReceived: number;
  cardReceived: number;
  totalPaid: number;
  changeAmount: number;
}

interface PaymentSectionProps {
  total: number;
  disabled: boolean;
  onConfirmPayment: (result: PaymentResult) => void;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const PaymentSection = ({ total, disabled, onConfirmPayment }: PaymentSectionProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);

  const calculations = useMemo(() => {
    if (paymentMethod === 'cash') {
      const change = round2(Math.max(0, cashAmount - total));
      const remaining = round2(Math.max(0, total - cashAmount));
      return { totalPaid: cashAmount, change, remaining, isValid: cashAmount >= total && cashAmount > 0 };
    }
    if (paymentMethod === 'card') {
      const isValid = round2(cardAmount) === round2(total) && cardAmount > 0;
      return { totalPaid: cardAmount, change: 0, remaining: round2(Math.max(0, total - cardAmount)), isValid };
    }
    // split
    const sumPaid = round2(cashAmount + cardAmount);
    const remaining = round2(Math.max(0, total - sumPaid));
    const cardExceedsShare = cardAmount > round2(total - cashAmount) && cashAmount < total;
    const change = sumPaid > total ? round2(sumPaid - total) : 0;
    // Change only valid from cash
    const cashChangeValid = change > 0 ? cashAmount >= round2(total - cardAmount) + change : true;
    const isValid = sumPaid >= total && cashAmount >= 0 && cardAmount >= 0 && !cardExceedsShare && cashChangeValid && (cashAmount > 0 || cardAmount > 0);
    return { totalPaid: sumPaid, change, remaining, isValid, cardExceedsShare };
  }, [paymentMethod, cashAmount, cardAmount, total]);

  const handleConfirm = () => {
    if (!calculations.isValid || disabled) return;
    onConfirmPayment({
      paymentType: paymentMethod,
      cashReceived: paymentMethod === 'card' ? 0 : round2(cashAmount),
      cardReceived: paymentMethod === 'cash' ? 0 : round2(cardAmount),
      totalPaid: round2(calculations.totalPaid),
      changeAmount: round2(calculations.change),
    });
    setCashAmount(0);
    setCardAmount(0);
  };

  const handleMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
    setCashAmount(0);
    setCardAmount(0);
  };

  const quickAmounts = useMemo(() => {
    if (total <= 0) return [];
    return [Math.ceil(total), Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20]
      .filter((v, i, a) => v >= total && a.indexOf(v) === i)
      .slice(0, 4);
  }, [total]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Método de Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method selector */}
        <RadioGroup value={paymentMethod} onValueChange={handleMethodChange} className="grid grid-cols-3 gap-2">
          <div>
            <RadioGroupItem value="cash" id="pay-cash" className="peer sr-only" />
            <Label
              htmlFor="pay-cash"
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 cursor-pointer transition-all text-center
                ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/40'}`}
            >
              <Banknote className="h-5 w-5" />
              <span className="text-xs font-medium">Efectivo</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="card" id="pay-card" className="peer sr-only" />
            <Label
              htmlFor="pay-card"
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 cursor-pointer transition-all text-center
                ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/40'}`}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs font-medium">Tarjeta</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="split" id="pay-split" className="peer sr-only" />
            <Label
              htmlFor="pay-split"
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 cursor-pointer transition-all text-center
                ${paymentMethod === 'split' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/40'}`}
            >
              <Split className="h-5 w-5" />
              <span className="text-xs font-medium">Dividido</span>
            </Label>
          </div>
        </RadioGroup>

        <Separator />

        {/* Total display */}
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Total a pagar</span>
          <span className="text-xl font-bold">${total.toFixed(2)}</span>
        </div>

        {/* Cash input */}
        {(paymentMethod === 'cash' || paymentMethod === 'split') && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              {paymentMethod === 'split' ? 'Monto en efectivo' : 'Paga con'}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={cashAmount || ''}
                onChange={(e) => setCashAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="pl-7 text-lg font-semibold"
              />
            </div>
            {paymentMethod === 'cash' && quickAmounts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {quickAmounts.map((amount) => (
                  <Button key={amount} variant="outline" size="sm" className="text-xs" onClick={() => setCashAmount(amount)}>
                    ${amount.toFixed(2)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Card input */}
        {(paymentMethod === 'card' || paymentMethod === 'split') && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {paymentMethod === 'split' ? 'Monto en tarjeta' : 'Monto con tarjeta'}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={cardAmount || ''}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  setCardAmount(val);
                }}
                placeholder="0.00"
                className="pl-7 text-lg font-semibold"
              />
            </div>
            {paymentMethod === 'card' && (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setCardAmount(total)}>
                Pagar total: ${total.toFixed(2)}
              </Button>
            )}
            {paymentMethod === 'split' && (calculations as any).cardExceedsShare && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                La tarjeta excede el saldo restante después del efectivo
              </p>
            )}
          </div>
        )}

        {/* Split summary */}
        {paymentMethod === 'split' && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efectivo:</span>
                <span className="font-medium">${cashAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarjeta:</span>
                <span className="font-medium">${cardAmount.toFixed(2)}</span>
              </div>
              {calculations.remaining > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Pendiente:</span>
                  <span className="font-semibold">${calculations.remaining.toFixed(2)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Change display */}
        <div className={`p-3 rounded-lg text-center transition-colors ${
          calculations.isValid && total > 0
            ? 'bg-green-50 border border-green-200'
            : calculations.totalPaid > 0 && !calculations.isValid
              ? 'bg-red-50 border border-red-200'
              : 'bg-muted/30 border border-border'
        }`}>
          <p className="text-xs text-muted-foreground uppercase font-medium">Cambio</p>
          <p className={`text-2xl font-bold ${
            calculations.isValid && total > 0
              ? 'text-green-600'
              : calculations.totalPaid > 0 && !calculations.isValid
                ? 'text-destructive'
                : 'text-muted-foreground'
          }`}>
            ${calculations.change.toFixed(2)}
          </p>
          {calculations.totalPaid > 0 && calculations.remaining > 0 && (
            <p className="text-xs text-destructive mt-1">Monto insuficiente</p>
          )}
          {calculations.isValid && total > 0 && (
            <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Pago completo
            </p>
          )}
        </div>

        {/* Confirm */}
        <Button
          onClick={handleConfirm}
          className="w-full"
          disabled={disabled || !calculations.isValid || total <= 0}
        >
          {paymentMethod === 'split' ? (
            <><Split className="h-4 w-4 mr-2" /> Confirmar Pago Dividido</>
          ) : paymentMethod === 'card' ? (
            <><CreditCard className="h-4 w-4 mr-2" /> Confirmar Pago con Tarjeta</>
          ) : (
            <><Banknote className="h-4 w-4 mr-2" /> Confirmar Pago en Efectivo</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
