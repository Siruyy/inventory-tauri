import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useProducts, NewProduct } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<
    Omit<NewProduct, "category_id"> & { category_id: string }
  >({
    name: "",
    description: "",
    sku: "",
    category_id: "",
    unit_price: 0,
    current_stock: 0,
    minimum_stock: 0,
    location: "",
  });

  const { addProduct } = useProducts();
  const { categories } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: NewProduct = {
      ...formData,
      category_id: parseInt(formData.category_id),
      description: formData.description || null,
      location: formData.location || null,
    };
    addProduct(newProduct, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          name: "",
          description: "",
          sku: "",
          category_id: "",
          unit_price: 0,
          current_stock: 0,
          minimum_stock: 0,
          location: "",
        });
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Inventory</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-medium">
                SKU
              </label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="unit_price" className="text-sm font-medium">
                Unit Price
              </label>
              <Input
                id="unit_price"
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="current_stock" className="text-sm font-medium">
                Current Stock
              </label>
              <Input
                id="current_stock"
                name="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="minimum_stock" className="text-sm font-medium">
                Minimum Stock
              </label>
              <Input
                id="minimum_stock"
                name="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
