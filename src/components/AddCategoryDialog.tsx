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
import { open } from "@tauri-apps/plugin-dialog";
import { formatFilePath } from "../utils/fileUtils";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>("");
  const [displayIcon, setDisplayIcon] = useState<string>("");
  const { addCategory } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory: NewCategory = {
      name,
      description: description || null,
      icon: icon || null,
    };
    addCategory.mutate(newCategory, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setDescription("");
        setIcon("");
        setDisplayIcon("");
      },
    });
  };

  const handleImageSelect = async () => {
    try {
      // Open file dialog to select an image
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
          },
        ],
      });

      // If user selected a file, update the icon
      if (selected && !Array.isArray(selected)) {
        // Store the file path directly
        setIcon(selected);
        console.log("Selected image path:", selected);

        // Format the file path for display - properly await the Promise
        try {
          const formattedPath = await formatFilePath(selected);
          setDisplayIcon(formattedPath);
        } catch (error) {
          console.error("Error formatting image path:", error);
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
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
          {/* Image Upload Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-32 h-32 bg-[#383C3D] rounded-lg overflow-hidden flex items-center justify-center">
              {displayIcon ? (
                <img
                  src={displayIcon}
                  alt="Category Icon"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-[#666] text-xs text-center p-2">
                  No image selected
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleImageSelect}
              className="text-[#FAC1D9] hover:text-[#e0a9c1] hover:bg-transparent"
            >
              Add Picture/Icon
            </Button>
          </div>

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
