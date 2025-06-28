import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useCategories, NewCategory } from "../hooks/useCategories";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { formatFilePath } from "../utils/fileUtils";

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

export default function AddCategoryDialog({
  isOpen,
  onClose,
  onCategoryAdded,
}: AddCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const { addCategory } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter a category name.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Invoke the backend command to add a new category
      await invoke("add_category", {
        name: categoryName,
        description: description || null,
        icon: imageUrl || null,
      });

      // Clear inputs and close dialog
      setCategoryName("");
      setDescription("");
      setImageUrl(null);
      onCategoryAdded();
      onClose();
    } catch (error) {
      console.error("Failed to add category:", error);
      alert(`Error adding category: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectImage = async () => {
    try {
      const selected = await openDialog({
        directory: false,
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
          },
        ],
      });
      
      if (selected) {
        setImageUrl(selected as string);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#292C2D] border-[#323232] text-[#FFFFFF]">
        <DialogHeader>
          <DialogTitle className="text-[#FFFFFF]">Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category for your inventory items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-32 h-32 bg-[#383C3D] rounded-lg overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
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
              onClick={handleSelectImage}
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
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
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
              onClick={onClose}
              className="border-[#323232] text-[#DDDDDD] hover:bg-[#33363A] hover:text-[#FFFFFF]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#FAC1D9] text-[#292C2D] hover:bg-[#e0a9c1]"
            >
              {isSubmitting ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
