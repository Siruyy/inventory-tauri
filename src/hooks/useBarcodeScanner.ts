import { useEffect, useState } from "react";

interface BarcodeResult {
  barcode: string;
  quantity: number;
}

interface UseBarcodeOptions {
  // Time window in ms to collect keystrokes (default: 100ms)
  timeout?: number;
  // Minimum length of a barcode (default: 4)
  minLength?: number;
  // Maximum length of a barcode (default: 50)
  maxLength?: number;
  // Whether to stop propagation of keydown events (default: true)
  stopPropagation?: boolean;
  // Whether to prevent default behavior on keydown events (default: true)
  preventDefault?: boolean;
  // Callback for when a barcode is scanned
  onBarcodeScanned: (barcode: string, quantity?: number) => void;
  // Character that triggers the scan (usually Enter key) (default: "Enter")
  scanEndKey?: string;
  // Whether the scanner is enabled (default: true)
  enabled?: boolean;
  // Whether to support quantity prefix like "2*" (default: true)
  supportQuantityPrefix?: boolean;
  // Whether to ignore input from text fields (default: true)
  ignoreTextFields?: boolean;
  // Element ID for a quantity field (optional)
  quantityFieldId?: string;
}

export function useBarcodeScanner({
  timeout = 100,
  minLength = 4,
  maxLength = 50,
  stopPropagation = true,
  preventDefault = true,
  onBarcodeScanned,
  scanEndKey = "Enter",
  enabled = true,
  supportQuantityPrefix = true,
  ignoreTextFields = true,
  quantityFieldId,
}: UseBarcodeOptions) {
  const [barcode, setBarcode] = useState<string>("");
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);
  const [manualQuantity, setManualQuantity] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let timeoutRef: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the event target is an input field and we should ignore it
      if (ignoreTextFields) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          // If this is our designated quantity field and the key is a number or "*", capture it
          if (quantityFieldId && target.id === quantityFieldId) {
            // Only handle numbers and asterisk in the quantity field
            if (/^\d$/.test(e.key) || e.key === "*") {
              // Let the input field handle it normally
              return;
            }
          } else {
            // For other input fields, don't intercept keystrokes
            return;
          }
        }
      }

      const currentTime = Date.now();

      // If key press happened after timeout ms since last key, reset barcode
      if (currentTime - lastKeyTime > timeout && barcode.length > 0) {
        setBarcode("");
      }

      // Update the last key time
      setLastKeyTime(currentTime);

      // If the scanner's "Enter" key was pressed and we have barcode data
      if (e.key === scanEndKey && barcode.length >= minLength) {
        if (barcode.length <= maxLength) {
          // Parse quantity prefix if present (e.g., "2*12345678")
          if (supportQuantityPrefix) {
            const match = barcode.match(/^(\d+)\*(.*)/);
            if (match) {
              const quantity = parseInt(match[1]);
              const actualBarcode = match[2];

              // Only process if the actual barcode is valid
              if (
                actualBarcode.length >= minLength &&
                actualBarcode.length <= maxLength
              ) {
                console.log(
                  `Scanned barcode with quantity: ${quantity}x ${actualBarcode}`
                );
                onBarcodeScanned(actualBarcode, quantity);
                setBarcode(""); // Reset the barcode buffer

                if (stopPropagation) e.stopPropagation();
                if (preventDefault) e.preventDefault();
                return;
              }
            }
          }

          // Check for manual quantity
          if (manualQuantity !== null) {
            console.log(
              `Scanned barcode with manual quantity: ${manualQuantity}x ${barcode}`
            );
            onBarcodeScanned(barcode, manualQuantity);
            setManualQuantity(null); // Reset the manual quantity
          } else {
            // Regular barcode (no quantity prefix)
            console.log(`Scanned barcode: ${barcode}`);
            onBarcodeScanned(barcode);
          }
        }
        setBarcode(""); // Reset the barcode buffer either way

        if (stopPropagation) e.stopPropagation();
        if (preventDefault) e.preventDefault();
        return;
      }

      // Ignore function keys, tab key, etc.
      if (e.key.length > 1) return;

      // Add the key to the barcode buffer
      setBarcode((prev) => prev + e.key);

      // Clear any existing timeout
      if (timeoutRef) clearTimeout(timeoutRef);

      // Set a new timeout to reset the barcode buffer after timeout ms
      timeoutRef = setTimeout(() => {
        setBarcode("");
      }, timeout);

      if (stopPropagation) e.stopPropagation();
      if (preventDefault) e.preventDefault();
    };

    // Add the keydown event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up by removing the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef) clearTimeout(timeoutRef);
    };
  }, [
    barcode,
    lastKeyTime,
    timeout,
    minLength,
    maxLength,
    stopPropagation,
    preventDefault,
    onBarcodeScanned,
    scanEndKey,
    enabled,
    supportQuantityPrefix,
    ignoreTextFields,
    quantityFieldId,
    manualQuantity,
  ]);

  return {
    barcode,
    resetBarcode: () => setBarcode(""),
    setQuantity: (quantity: number | null) => setManualQuantity(quantity),
  };
}
