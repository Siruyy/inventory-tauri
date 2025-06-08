import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useCategories, NewCategory } from "../hooks/useCategories";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { addCategory } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory: NewCategory = {
      name,
      description: description || null,
    };
    addCategory(newCategory, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setDescription("");
      },
    });
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
          Add New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#292C2D] border-[#323232] text-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="text-[#FFFFFF]">Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-[#DDDDDD]"
            >
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
            />
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
            />
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
              Add Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
