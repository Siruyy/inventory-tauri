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
    supplier: "",
  });

  const { addProduct } = useProducts();
  const { categories } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: NewProduct = {
      name: formData.name,
      description: formData.description || "",
      sku: formData.sku,
      category_id: parseInt(formData.category_id),
      unit_price: formData.unit_price,
      current_stock: formData.current_stock,
      minimum_stock: formData.minimum_stock,
      supplier: formData.supplier || "",
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
          supplier: "",
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
        <Button
          style={{
            backgroundColor: "#FAC1D9",
            color: "#333333",
            fontWeight: 500,
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            whiteSpace: "nowrap",
            minWidth: "190px",
            fontSize: "15px",
            maxWidth: "100%",
            overflow: "visible",
          }}
          className="hover:bg-[#e0a9c1]"
        >
          Add New Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#292C2D] border-[#323232] text-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="text-[#FFFFFF]">
            Add New Inventory Item
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#DDDDDD]"
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="sku"
                className="text-sm font-medium text-[#DDDDDD]"
              >
                SKU
              </label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-[#DDDDDD]"
            >
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={2}
              className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium text-[#DDDDDD]"
              >
                Category
              </label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
              >
                <SelectTrigger className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#292C2D] border-[#323232] text-[#FFFFFF]">
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
              <label
                htmlFor="supplier"
                className="text-sm font-medium text-[#DDDDDD]"
              >
                Supplier
              </label>
              <Input
                id="supplier"
                name="supplier"
                value={formData.supplier || ""}
                onChange={handleChange}
                className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="unit_price"
                className="text-sm font-medium text-[#DDDDDD]"
              >
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
                className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="current_stock"
                className="text-sm font-medium text-[#DDDDDD]"
              >
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
                className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="minimum_stock"
                className="text-sm font-medium text-[#DDDDDD]"
              >
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
                className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#323232] text-[#DDDDDD] hover:bg-[#33363A] hover:text-[#FFFFFF]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#FAC1D9] text-[#292C2D] hover:bg-[#e0a9c1]"
            >
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
