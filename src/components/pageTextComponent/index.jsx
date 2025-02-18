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

//style
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
          if (editor) {
            new DragDrop(editor); // Ensure editor is fully initialized before attaching DragDrop
          }
        },
        onChange: async () => {
          const data = await editorInstance.current.save();
          onChange(JSON.stringify(data)); // Convert to string and pass to parent
        },
      });

      editorInstance.current = editor;
    }
  }, [desc, onChange, readOnly]);

  useEffect(() => {
    if (
      editorInstance.current &&
      desc &&
      desc.blocks &&
      Array.isArray(desc.blocks)
    ) {
      editorInstance.current.isReady.then(() => {
        editorInstance.current.render(desc);
      });
    } else {
      console.warn("Invalid desc format, render() was not called.");
    }
  }, [desc]);

  return <div id="editorjs" className="p-4"></div>;
};

export default PageTextComponent;
