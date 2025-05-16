"use client";

import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Delimiter from "@editorjs/delimiter";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Marker from "@editorjs/marker";
import Title from "title-editorjs";
import Table from "@editorjs/table";
import DragDrop from "editorjs-drag-drop";
import { CustomImageTool } from "./CustomImageTool";
import { normalizeEditorData, serializeEditorData } from "@/utils/newsUtils";

import "./pageTextComponent.scss";

const PageTextComponent = ({ onChange, desc = null, readOnly = false }) => {
  const editorInstance = useRef(null);
  const editorInitialized = useRef(false);
  const processedDesc = useRef(null);
  const isFirstRender = useRef(true);
  const lastSavedData = useRef(null);
  const editorContainer = useRef(null);

  // Keep the fixed ID to maintain CSS styling
  const editorId = "editorjs";

  // Process the description once when component mounts or desc changes
  useEffect(() => {
    if (desc) {
      try {
        processedDesc.current = normalizeEditorData(desc);
      } catch (error) {
        console.error("Error normalizing editor data:", error);
        processedDesc.current = {
          time: Date.now(),
          blocks: [],
          version: "2.30.5",
        };
      }
    } else {
      processedDesc.current = {
        time: Date.now(),
        blocks: [],
        version: "2.30.5",
      };
    }
  }, [desc]);

  // Initialize the editor only once
  useEffect(() => {
    // Don't initialize until the container is ready in the DOM
    if (!editorContainer.current) return;

    if (editorInitialized.current) return;

    const initEditor = async () => {
      if (!processedDesc.current) {
        processedDesc.current = {
          time: Date.now(),
          blocks: [],
          version: "2.30.5",
        };
      }

      try {
        // Clear any existing content in the editor container
        editorContainer.current.innerHTML = "";

        const editor = new EditorJS({
          readOnly,
          holder: editorContainer.current,
          minHeight: 300,
          tools: {
            header: {
              class: Header,
              inlineToolbar: true,
              config: {
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            image: {
              class: CustomImageTool,
              config: {
                buttonContent: "Select an Image",
              },
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              shortcut: "CMD+SHIFT+O",
              config: {
                quotePlaceholder: "Enter a quote",
                captionPlaceholder: "Quote's author",
              },
            },
            table: {
              class: Table,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3,
              },
            },
            delimiter: Delimiter,
            title: {
              class: Title,
              config: {
                placeholder: "Enter a title...",
                levels: [1, 2, 3],
                defaultLevel: 1,
              },
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: "unordered",
              },
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            },
            marker: {
              class: Marker,
              shortcut: "CMD+SHIFT+M",
            },
          },
          data: processedDesc.current,
          autofocus: false,
          placeholder: "Click here to write your content...",
          onReady: () => {
            // Initialize DragDrop only if not in readOnly mode
            if (!readOnly) {
              setTimeout(() => {
                try {
                  new DragDrop(editor);
                } catch (error) {
                  console.warn("DragDrop initialization failed:", error);
                }
              }, 100);
            }
            console.log("Editor is ready");
          },
          onChange: async (api, event) => {
            if (readOnly) return; // Don't trigger onChange in readOnly mode

            try {
              // Save current editor state
              const data = await editor.save();

              // Check if data has actually changed to avoid unnecessary updates
              const serialized = serializeEditorData(data);

              // Only update if the content has changed
              if (serialized !== lastSavedData.current) {
                lastSavedData.current = serialized;
                onChange(serialized);
              }
            } catch (error) {
              console.error("Error saving editor data:", error);
            }
          },
        });

        editorInstance.current = editor;
        editorInitialized.current = true;
      } catch (error) {
        console.error("Error initializing editor:", error);
      }
    };

    // Small delay to ensure DOM is fully ready
    const timeoutId = setTimeout(() => {
      initEditor();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (editorInstance.current && editorInstance.current.destroy) {
        try {
          editorInstance.current.destroy();
          editorInstance.current = null;
          editorInitialized.current = false;
        } catch (error) {
          console.error("Error destroying editor:", error);
        }
      }
    };
  }, [readOnly]); // Only reinitialize if readOnly status changes

  // Update editor content when desc changes and editor is already initialized
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      editorInstance.current &&
      editorInitialized.current &&
      processedDesc.current &&
      processedDesc.current.blocks
    ) {
      editorInstance.current.isReady
        .then(() => {
          try {
            // Don't re-render if we're in the middle of editing
            // Only render if the editor doesn't have focus
            const editorHasFocus =
              document.activeElement &&
              editorContainer.current &&
              editorContainer.current.contains(document.activeElement);

            if (!editorHasFocus) {
              editorInstance.current.render(processedDesc.current);
            }
          } catch (error) {
            console.error("Error rendering editor content:", error);
          }
        })
        .catch((error) => {
          console.error("Editor initialization error:", error);
        });
    }
  }, [desc]);

  // Return a div with ref to maintain component identity across renders
  return (
    <div
      id={editorId}
      ref={editorContainer}
      className="border rounded min-h-[300px] p-4 bg-white"
    ></div>
  );
};

export default PageTextComponent;
