/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/invoices/create-invoice-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvoice, getVendorCompletedTickets } from "@/actions/invoices";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export function CreateInvoiceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    ticketId: "",
    items: [
      { description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ] as LineItem[],
    tax: 0,
    discount: 0,
    notes: "",
    dueDate: "",
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const result = await getVendorCompletedTickets();
      if (result.success && result.data) {
        setTickets(result.data);
      } else {
        toast.error(result.error || "Failed to load tickets");
      }
    } catch (error) {
      console.error("Failed to load tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + formData.tax - formData.discount;
  };

  const updateItemAmount = (index: number, quantity: number, unitPrice: number) => {
    const amount = quantity * unitPrice;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], quantity, unitPrice, amount };
    setFormData({ ...formData, items: newItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ticketId) {
      toast.error("Please select a ticket");
      return;
    }

    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error("Please fill in all item details correctly");
      return;
    }

    setLoading(true);
    try {
      const result = await createInvoice({
        ticketId: formData.ticketId,
        items: formData.items,
        subtotal: calculateSubtotal(),
        tax: formData.tax,
        discount: formData.discount,
        total: calculateTotal(),
        notes: formData.notes || undefined,
        dueDate: formData.dueDate || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        router.push(`/dashboard/vendor/invoices/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ticket Selection */}
      <div className="space-y-2">
        <Label htmlFor="ticket">
          Maintenance Ticket <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.ticketId}
          onValueChange={(value) => setFormData({ ...formData, ticketId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a completed ticket" />
          </SelectTrigger>
          <SelectContent>
            {loadingTickets ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No completed tickets found
              </div>
            ) : (
              tickets.map((ticket) => (
                <SelectItem key={ticket.id} value={ticket.id}>
                  {ticket.title} - {ticket.property.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the maintenance ticket this invoice is for
        </p>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Line Items <span className="text-red-500">*</span></Label>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="grid gap-4 p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium">Item {index + 1}</span>
                {formData.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input
                  id={`description-${index}`}
                  placeholder="e.g., Plumbing repair - replaced kitchen faucet"
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].description = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItemAmount(index, parseInt(e.target.value) || 0, item.unitPrice)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`unitPrice-${index}`}>Unit Price ($)</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItemAmount(index, item.quantity, parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
                    <span className="font-medium">${item.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculations */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax">Tax ($)</Label>
            <Input
              id="tax"
              type="number"
              min="0"
              step="0.01"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount ($)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="flex justify-between text-lg font-bold pt-4 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date (Optional)</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes or payment instructions..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Invoice
        </Button>
      </div>
    </form>
  );
}


