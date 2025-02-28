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

import "./pageTextComponent.scss";

const PageTextComponent = ({ onChange, desc = null, readOnly = false }) => {
  const editorInstance = useRef(null);
  const editorInitialized = useRef(false);

  useEffect(() => {
    // Clean up previous instance if it exists
    if (editorInstance.current && editorInstance.current.destroy) {
      try {
        editorInstance.current.destroy();
        editorInstance.current = null;
        editorInitialized.current = false;
      } catch (error) {
        console.error("Error destroying editor:", error);
      }
    }

    // Create a new instance if not already initialized
    if (!editorInitialized.current) {
      const editor = new EditorJS({
        readOnly,
        holder: "editorjs",
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
              // Additional configurations if needed
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
        data: desc,
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
        },
        onChange: async () => {
          if (readOnly) return; // Don't trigger onChange in readOnly mode

          try {
            const data = await editorInstance.current.save();
            onChange(JSON.stringify(data));
          } catch (error) {
            console.error("Error saving editor data:", error);
          }
        },
      });

      editorInstance.current = editor;
      editorInitialized.current = true;
    }

    return () => {
      if (editorInstance.current && editorInstance.current.destroy) {
        try {
          editorInstance.current.destroy();
          editorInstance.current = null;
        } catch (error) {
          console.error("Error destroying editor:", error);
        }
      }
    };
  }, [readOnly]); // Add readOnly to dependency array

  useEffect(() => {
    if (
      editorInstance.current &&
      desc &&
      desc.blocks &&
      Array.isArray(desc.blocks)
    ) {
      editorInstance.current.isReady
        .then(() => {
          // Clear the editor first to prevent conflicts
          return editorInstance.current.clear();
        })
        .then(() => {
          // Add a small delay to ensure DOM is updated
          return new Promise((resolve) => setTimeout(resolve, 50));
        })
        .then(() => {
          try {
            editorInstance.current.render(desc);
          } catch (error) {
            console.error("Error rendering editor content:", error);
          }
        })
        .catch((error) => {
          console.error("Editor initialization error:", error);
        });
    }
  }, [desc]);

  return <div id="editorjs" className="p-4"></div>;
};

export default PageTextComponent;
