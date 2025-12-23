"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ComponentSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if select mode is enabled
    const mode = searchParams.get("mode");
    const htmlElement = document.documentElement;

    // Manage data-select-mode attribute on <html>
    if (mode === "select") {
      htmlElement.setAttribute("data-select-mode", "true");
    } else {
      htmlElement.removeAttribute("data-select-mode");
      return;
    }

    // Mark elements as highlightable (only outermost elements with same data-component-id)
    const updateHighlightableElements = () => {
      const allElements = document.querySelectorAll("[data-component-id]");

      allElements.forEach((el) => {
        const componentId = el.getAttribute("data-component-id");
        if (!componentId) return;

        // Filter out layout.tsx/ts/jsx/js and page.tsx/ts/jsx/js components
        if (
          componentId.endsWith("/layout") ||
          componentId.endsWith("/page") ||
          /\/(layout|page)\.(tsx?|jsx?)$/.test(componentId)
        ) {
          el.classList.remove("highlightable");
          return;
        }

        // Check if there's a parent with the same data-component-id
        let hasParentWithSameId = false;
        let parent = el.parentElement;
        while (parent) {
          if (parent.getAttribute("data-component-id") === componentId) {
            hasParentWithSameId = true;
            break;
          }
          parent = parent.parentElement;
        }

        // Add/remove highlightable class based on whether it's the outermost
        if (hasParentWithSameId) {
          el.classList.remove("highlightable");
        } else {
          el.classList.add("highlightable");
        }
      });
    };

    // Initial update
    updateHighlightableElements();

    // Watch for DOM changes and update highlightable elements
    const observer = new MutationObserver(() => {
      updateHighlightableElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const selectedComponentId = searchParams.get("component-selection");

    // Update selected component class (supports multiple selections)
    const updateSelectedComponent = () => {
      // Remove previous selection
      document.querySelectorAll(".component-selected").forEach((el) => {
        el.classList.remove("component-selected");
      });

      // Add selection to current components (comma-separated IDs)
      const selectedIds = selectedComponentId
        ? selectedComponentId.split(",").filter(Boolean)
        : [];

      selectedIds.forEach((id) => {
        // Find the outermost element with the same data-component-id
        const elements = Array.from(
          document.querySelectorAll(`[data-component-id="${id}"]`)
        );
        const selectedElement = elements.find((el) => {
          // Check if there's a parent with the same data-component-id
          let parent = el.parentElement;
          while (parent) {
            if (parent.getAttribute("data-component-id") === id) {
              return false; // Not the outermost
            }
            parent = parent.parentElement;
          }
          return true; // This is the outermost
        });
        if (selectedElement) {
          selectedElement.classList.add("component-selected");
        }
      });
    };

    updateSelectedComponent();

    // Handle click events
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Skip if click is within ModeSelectToggle
      if (target.closest('[data-mode-toggle="true"]')) {
        return;
      }

      // Prevent default behavior to block navigation/form submission
      event.preventDefault();
      event.stopPropagation();

      // Find if clicked element or its parent has data-component-id
      let componentElement = target.closest("[data-component-id]");

      // Filter out layout/page components
      if (componentElement) {
        const componentId = componentElement.getAttribute("data-component-id");
        if (
          componentId &&
          (componentId.endsWith("/layout") ||
            componentId.endsWith("/page") ||
            /\/(layout|page)\.(tsx?|jsx?)$/.test(componentId))
        ) {
          componentElement = null; // Treat as non-component click
        }
      }

      // If found, get the outermost element with the same data-component-id
      if (componentElement) {
        const componentId = componentElement.getAttribute("data-component-id");
        if (componentId) {
          // Traverse up to find the outermost element with the same ID
          let parent = componentElement.parentElement;
          while (parent) {
            const parentId = parent.getAttribute("data-component-id");
            if (parentId === componentId) {
              componentElement = parent;
              parent = parent.parentElement;
            } else {
              break;
            }
          }
        }
      }

      // Create new URL params
      const params = new URLSearchParams(searchParams.toString());

      if (componentElement) {
        // Component clicked - toggle in/out of selection
        const componentId = componentElement.getAttribute("data-component-id");
        if (componentId) {
          const currentSelection = params.get("component-selection");
          const currentSelections = currentSelection
            ? currentSelection.split(",").filter(Boolean)
            : [];

          if (currentSelections.includes(componentId)) {
            // Already selected - remove from selection
            const newSelections = currentSelections.filter(
              (id) => id !== componentId
            );
            if (newSelections.length > 0) {
              params.set("component-selection", newSelections.join(","));
            } else {
              params.delete("component-selection");
            }
          } else {
            // Not selected - add to selection
            currentSelections.push(componentId);
            params.set("component-selection", currentSelections.join(","));
          }
        }
      } else {
        // Non-component clicked - do nothing (maintain selection)
        return;
      }

      // Update URL
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    };

    // Add click listener
    document.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick);
      observer.disconnect();
      htmlElement.removeAttribute("data-select-mode");
    };
  }, [searchParams, router]);

  // Send postMessage to parent window when component selection changes
  useEffect(() => {
    const componentSelection = searchParams.get("component-selection");
    const selectedIds = componentSelection
      ? componentSelection.split(",").filter(Boolean)
      : [];

    if (selectedIds.length > 0) {
      // Get filepaths for all selected components
      const filepaths = selectedIds
        .map((id) => {
          const elements = Array.from(
            document.querySelectorAll(`[data-component-id="${id}"]`)
          );
          const selectedElement = elements.find((el) => {
            // Find the outermost element with the same data-component-id
            let parent = el.parentElement;
            while (parent) {
              if (parent.getAttribute("data-component-id") === id) {
                return false;
              }
              parent = parent.parentElement;
            }
            return true;
          });
          return selectedElement?.getAttribute("data-component-filepath");
        })
        .filter(Boolean) as string[];

      if (filepaths.length > 0) {
        window.parent.postMessage(
          {
            type: "components-selected",
            filepaths: filepaths.join(","),
          },
          "*"
        );
      }
    } else {
      // All components deselected - notify parent
      window.parent.postMessage(
        {
          type: "component-deselected",
        },
        "*"
      );
    }
  }, [searchParams]);

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "clear-component-selection") {
        // Clear component selection but keep select mode active
        const params = new URLSearchParams(searchParams.toString());
        params.delete("component-selection");
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });
      } else if (event.data?.type === "toggle-select-mode") {
        const params = new URLSearchParams(searchParams.toString());
        const currentMode = params.get("mode");

        if (currentMode === "select") {
          // mode=selectを削除（トグルオフ）
          params.delete("mode");
        } else {
          // mode=selectを追加（トグルオン）
          params.set("mode", "select");
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });
      } else if (event.data?.type === "sync-selected-components") {
        // Sync component selection from parent (replace existing selection)
        const params = new URLSearchParams(searchParams.toString());
        const components = event.data.components; // カンマ区切り文字列

        if (components && components.length > 0) {
          params.set("component-selection", components);
        } else {
          params.delete("component-selection");
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [searchParams, router]);

  return null;
}
