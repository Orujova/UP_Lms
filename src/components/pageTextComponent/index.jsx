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

  useEffect(() => {
    if (!editorInstance.current) {
      const editor = new EditorJS({
        readOnly,
        holder: "editorjs",
        tools: {
          header: Header,
          image: CustomImageTool,
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
          title: Title,
          list: List,
          paragraph: Paragraph,
          marker: Marker,
        },
        data: desc,
        onReady: () => {
          // Initialize DragDrop after a short delay to ensure editor is ready
          setTimeout(() => {
            try {
              new DragDrop(editor);
            } catch (error) {
              console.warn('DragDrop initialization failed:', error);
            }
          }, 100);
        },
        onChange: async () => {
          try {
            const data = await editorInstance.current.save();
            onChange(JSON.stringify(data));
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        },
      });

      editorInstance.current = editor;
    }

    return () => {
      if (editorInstance.current && editorInstance.current.destroy) {
        try {
          editorInstance.current.destroy();
          editorInstance.current = null;
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (
      editorInstance.current &&
      desc &&
      desc.blocks &&
      Array.isArray(desc.blocks)
    ) {
      editorInstance.current.isReady.then(() => {
        try {
          editorInstance.current.render(desc);
        } catch (error) {
          console.error('Error rendering editor content:', error);
        }
      });
    }
  }, [desc]);

  return <div id="editorjs" className="p-4"></div>;
};

export default PageTextComponent;