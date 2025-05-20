"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export interface CreateNewItemFormProps {
  onSubmit: (item: {
    name: string;
    description?: string;
    category?: string;
    condition?: string;
    quantity: number;
    consumable: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export function CreateNewItemForm({
  onSubmit,
  isSubmitting,
  error,
}: CreateNewItemFormProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemCondition, setNewItemCondition] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemConsumable, setNewItemConsumable] = useState(false);

  const handleSubmit = async () => {
    if (!newItemName.trim()) {
      return;
    }

    await onSubmit({
      name: newItemName,
      description: newItemDescription || undefined,
      category: newItemCategory || undefined,
      condition: newItemCondition || undefined,
      quantity: newItemQuantity,
      consumable: newItemConsumable,
    });
  };

  return (
    <div className="grid gap-4 max-h-[60vh] overflow-y-auto pb-4 px-1">
      <div className="grid gap-2">
        <Label htmlFor="name">Item name*</Label>
        <Input
          id="name"
          value={newItemName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewItemName(e.target.value)
          }
          placeholder="What is this item called?"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={newItemDescription}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setNewItemDescription(e.target.value)
          }
          placeholder="Describe this item"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={newItemCategory}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewItemCategory(e.target.value)
            }
            placeholder="Tools, Kitchen, etc."
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="condition">Condition</Label>
          <Select value={newItemCondition} onValueChange={setNewItemCondition}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={newItemQuantity}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewItemQuantity(parseInt(e.target.value) || 1)
            }
          />
        </div>

        <div className="flex items-center gap-2 h-full pt-6">
          <Checkbox
            id="consumable"
            checked={newItemConsumable}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              setNewItemConsumable(checked === true)
            }
          />
          <Label htmlFor="consumable">Consumable item</Label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mt-4">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Item"}
        </Button>
      </div>
    </div>
  );
}
