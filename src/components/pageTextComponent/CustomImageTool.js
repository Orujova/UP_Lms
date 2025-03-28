import React from "react";
import { createRoot } from "react-dom/client";
import ImageContainer from "../ImageContainer";

export class CustomImageTool {
  static get toolbox() {
    return {
      title: "Image",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>`,
    };
  }

  // Add this static method to indicate read-only support
  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, api, readOnly, config }) {
    this.api = api;
    this.readOnly = readOnly || false;
    this.config = config || {};
    this.data = {
      url: data.url || "",
      caption: data.caption || "",
      withBorder: data.withBorder !== undefined ? data.withBorder : false,
      withBackground:
        data.withBackground !== undefined ? data.withBackground : false,
      stretched: data.stretched !== undefined ? data.stretched : false,
      alignment: data.alignment || "center",
      width: data.width || "100%",
    };

    this.wrapper = undefined;
    this.settings = [
      {
        name: "withBorder",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        </svg>`,
        label: "Add border",
      },
      {
        name: "stretched",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"/>
          <polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>`,
        label: "Stretch image",
      },
      {
        name: "withBackground",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18"/>
        </svg>`,
        label: "Add background",
      },
    ];

    // Add custom styles if not already added
    this._addCustomStyles();
    this.isLoading = false;
  }

  _addCustomStyles() {
    if (!document.querySelector("#image-tool-styles")) {
      const styles = document.createElement("style");
      styles.id = "image-tool-styles";
      styles.textContent = `
        .cdx-image-tool {
          position: relative;
          margin-bottom: 1rem;
          clear: both;
        }
        .cdx-image-tool__image-wrapper {
          position: relative;
        }
        .resize-wrapper {
          position: relative;
          padding-bottom: 10px;
        }
        .resize-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          cursor: se-resize;
          background: linear-gradient(135deg, transparent 50%, #0AAC9E 50%);
          border-radius: 0 0 2px 0;
        }
        .cdx-image-tool__caption {
          margin-top: 10px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8f9fa;
          position: relative;
          clear: both;
        }
        .cdx-image-tool__caption::before {
          content: 'Caption';
          position: absolute;
          top: -8px;
          left: 10px;
          background: white;
          padding: 0 4px;
          font-size: 12px;
          color: #64748b;
        }
        .cdx-image-tool__caption-input {
          width: 100%;
          border: none;
          background: none;
          outline: none;
          padding: 4px 0;
          font-size: 14px;
          min-height: 24px;
          resize: none;
        }
        .image-alignment-left {
          float: left;
          margin: 0 1rem 1rem 0;
          max-width: 50%;
        }
        .image-alignment-right {
          float: right;
          margin: 0 0 1rem 1rem;
          max-width: 50%;
        }
        .image-alignment-center {
          float: none;
          margin: 0 auto 1rem auto;
          display: block;
          max-width: 100%;
        }
        .cdx-image-tool.image-alignment-center .resize-wrapper {
          margin: 0 auto;
        }
        .image-loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          min-height: 150px;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          background-color: #f9fafb;
          padding: 1rem;
        }
        .image-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e6e6e6;
          border-top: 3px solid #0AAC9E;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .image-loading-text {
          font-size: 14px;
          color: #4b5563;
          margin-top: 8px;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  renderSettings() {
    // Don't render settings in readOnly mode
    if (this.readOnly) return document.createElement("div");

    const wrapper = document.createElement("div");
    wrapper.classList.add("flex", "flex-col", "gap-3", "p-2");

    // Regular toggle buttons container
    const toggleContainer = document.createElement("div");
    toggleContainer.classList.add("flex", "items-center", "gap-3");

    // Add regular toggle buttons
    this.settings.forEach((tune) => {
      const button = document.createElement("button");
      button.classList.add(
        "flex",
        "items-center",
        "justify-center",
        "p-2",
        "rounded",
        "hover:bg-gray-100",
        "transition"
      );
      button.innerHTML = tune.icon;
      button.title = tune.label;

      if (this.data[tune.name]) {
        button.classList.add("text-[#0AAC9E]", "bg-[#E6F7F5]");
      }

      button.addEventListener("click", () => {
        this._toggleTune(tune.name);

        if (this.data[tune.name]) {
          button.classList.add("text-[#0AAC9E]", "bg-[#E6F7F5]");
        } else {
          button.classList.remove("text-[#0AAC9E]", "bg-[#E6F7F5]");
        }
      });

      toggleContainer.appendChild(button);
    });

    wrapper.appendChild(toggleContainer);

    // Alignment buttons container with label
    const alignmentSection = document.createElement("div");
    alignmentSection.classList.add("flex", "flex-col", "gap-2", "mt-3");

    const alignmentLabel = document.createElement("span");
    alignmentLabel.textContent = "Image alignment";
    alignmentLabel.classList.add("text-sm", "text-gray-600");
    alignmentSection.appendChild(alignmentLabel);

    const alignmentGroup = document.createElement("div");
    alignmentGroup.classList.add(
      "flex",
      "gap-1",
      "bg-gray-100",
      "rounded",
      "p-1"
    );

    const alignmentIcons = {
      left: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="12" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>`,
      center: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="6" y1="12" x2="18" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>`,
      right: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="12" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>`,
    };

    ["left", "center", "right"].forEach((align) => {
      const button = document.createElement("button");
      button.type = "button"; // Explicitly set button type
      button.classList.add(
        "flex",
        "flex-1",
        "items-center",
        "justify-center",
        "p-2",
        "rounded",
        "hover:bg-gray-200",
        "transition"
      );

      if (this.data.alignment === align) {
        button.classList.add("text-[#0AAC9E]", "bg-white");
      }

      button.innerHTML = alignmentIcons[align];
      button.title = `Align ${align}`;

      button.addEventListener("click", () => {
        this.data.alignment = align;
        this._updatePreview();

        // Update active state
        alignmentGroup.querySelectorAll("button").forEach((btn) => {
          btn.classList.remove("text-[#0AAC9E]", "bg-white");
        });
        button.classList.add("text-[#0AAC9E]", "bg-white");
      });

      alignmentGroup.appendChild(button);
    });

    alignmentSection.appendChild(alignmentGroup);
    wrapper.appendChild(alignmentSection);

    return wrapper;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("cdx-block", "image-tool-block");

    if (this.isLoading) {
      this._showLoadingIndicator();
      return this.wrapper;
    }

    if (this.data && this.data.url) {
      this._createImage(this.data.url);
      return this.wrapper;
    }

    // In readOnly mode, don't show the select image button if no image
    if (this.readOnly) {
      const message = document.createElement("div");
      message.classList.add(
        "w-full",
        "p-4",
        "border",
        "border-gray-200",
        "rounded-lg",
        "text-gray-500",
        "text-center"
      );
      message.textContent = "No image selected";
      this.wrapper.appendChild(message);
      return this.wrapper;
    }

    const selectImageButton = document.createElement("button");
    selectImageButton.type = "button"; // Explicitly set button type
    selectImageButton.classList.add(
      "w-full",
      "p-4",
      "border-2",
      "border-dashed",
      "border-gray-300",
      "rounded-lg",
      "text-gray-500",
      "hover:text-gray-600",
      "hover:border-gray-400",
      "transition"
    );
    selectImageButton.innerHTML = `
      <div class="flex flex-col items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Click to select image</span>
      </div>
    `;

    selectImageButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._showImageSelector();
    });

    this.wrapper.appendChild(selectImageButton);
    return this.wrapper;
  }

  _showLoadingIndicator() {
    // Clear the wrapper before adding the loading indicator
    while (this.wrapper.firstChild) {
      this.wrapper.removeChild(this.wrapper.firstChild);
    }

    const loadingContainer = document.createElement("div");
    loadingContainer.classList.add("image-loading-container");

    const spinner = document.createElement("div");
    spinner.classList.add("image-loading-spinner");

    const loadingText = document.createElement("div");
    loadingText.classList.add("image-loading-text");
    loadingText.textContent = "Loading image...";

    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(loadingText);

    this.wrapper.appendChild(loadingContainer);
  }

  _toggleTune(tune) {
    this.data[tune] = !this.data[tune];
    this._updatePreview();
  }

  _createImage(url) {
    // Clear the wrapper before adding new content
    while (this.wrapper.firstChild) {
      this.wrapper.removeChild(this.wrapper.firstChild);
    }

    // Show loading indicator first
    this.isLoading = true;
    this._showLoadingIndicator();

    const container = document.createElement("div");
    container.classList.add("cdx-image-tool");

    // Remove any existing alignment classes
    container.classList.remove(
      "image-alignment-left",
      "image-alignment-right",
      "image-alignment-center"
    );

    // Add new alignment class
    container.classList.add(`image-alignment-${this.data.alignment}`);

    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("cdx-image-tool__image-wrapper");

    // Create resizable wrapper
    const resizableWrapper = document.createElement("div");
    resizableWrapper.classList.add("resize-wrapper");
    resizableWrapper.style.width = this.data.width;
    resizableWrapper.style.minWidth = "200px";

    // Only make resizable if not in readOnly mode
    if (!this.readOnly) {
      resizableWrapper.style.resize = "horizontal";
      resizableWrapper.style.overflow = "hidden";
    }

    const image = document.createElement("img");

    // Set up image load and error handlers before setting src
    image.onload = () => {
      // Image loaded successfully, remove loading state
      this.isLoading = false;

      // Clear the wrapper again before adding actual content
      while (this.wrapper.firstChild) {
        this.wrapper.removeChild(this.wrapper.firstChild);
      }

      // Now add the image and related elements
      if (this.data.withBorder)
        imageWrapper.classList.add("border", "border-gray-300", "rounded");
      if (this.data.withBackground)
        imageWrapper.classList.add("bg-gray-100", "p-2");
      if (this.data.stretched) image.classList.add("w-full");

      // Only add click event in non-readOnly mode
      if (!this.readOnly) {
        image.addEventListener("click", () => {
          this._showImageSelector();
        });
      }

      // Handle resize only in non-readOnly mode
      if (!this.readOnly) {
        let initialWidth;
        resizableWrapper.addEventListener("mousedown", (e) => {
          initialWidth = resizableWrapper.offsetWidth;
        });

        resizableWrapper.addEventListener("mouseup", (e) => {
          if (initialWidth !== resizableWrapper.offsetWidth) {
            this.data.width = resizableWrapper.style.width;
          }
        });
      }

      // Caption section
      const captionContainer = document.createElement("div");
      captionContainer.classList.add("cdx-image-tool__caption");

      if (this.readOnly && !this.data.caption) {
        // Don't show caption in readOnly mode if empty
        captionContainer.style.display = "none";
      }

      if (this.readOnly) {
        // In readOnly mode, show caption as text
        const captionText = document.createElement("div");
        captionText.classList.add("py-1", "px-0");
        captionText.textContent = this.data.caption || "";
        captionContainer.appendChild(captionText);
      } else {
        // In edit mode, show caption as textarea
        const caption = document.createElement("textarea");
        caption.classList.add("cdx-image-tool__caption-input");
        caption.placeholder = "Write a caption for this image...";
        caption.value = this.data.caption || "";
        caption.readOnly = this.readOnly;

        caption.addEventListener("input", (event) => {
          event.stopPropagation();
          this.data.caption = event.target.value;
          // Auto-resize textarea
          caption.style.height = "auto";
          caption.style.height = caption.scrollHeight + "px";
        });

        captionContainer.appendChild(caption);

        // Initialize caption height
        setTimeout(() => {
          caption.style.height = "auto";
          caption.style.height = caption.scrollHeight + "px";
        }, 0);
      }

      // Assemble the components
      resizableWrapper.appendChild(image);
      imageWrapper.appendChild(resizableWrapper);
      container.appendChild(imageWrapper);

      // Only show caption if it exists or in edit mode
      if (!this.readOnly || this.data.caption) {
        container.appendChild(captionContainer);
      }

      this.wrapper.appendChild(container);

      // Notify the editor about changes
      // if (this.api && this.api.blocks) {
      //   this.api.blocks.update();
      // }
    };

    // Handle image load error
    image.onerror = () => {
      // Remove loading state
      this.isLoading = false;

      // Clear the wrapper before showing error
      while (this.wrapper.firstChild) {
        this.wrapper.removeChild(this.wrapper.firstChild);
      }

      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.classList.add(
        "p-4",
        "bg-red-50",
        "border",
        "border-red-200",
        "text-red-500",
        "rounded-lg",
        "text-center"
      );
      errorMessage.textContent = "Failed to load image";

      const retryButton = document.createElement("button");
      retryButton.classList.add(
        "mt-2",
        "px-4",
        "py-2",
        "bg-red-100",
        "hover:bg-red-200",
        "text-red-700",
        "rounded"
      );
      retryButton.textContent = "Select another image";
      retryButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._showImageSelector();
      });

      errorMessage.appendChild(document.createElement("br"));
      errorMessage.appendChild(retryButton);

      this.wrapper.appendChild(errorMessage);

      // Notify the editor about changes
      // if (this.api && this.api.blocks) {
      //   this.api.blocks.update();
      // }
    };

    // Start loading the image
    image.src = url;
    image.classList.add("w-full", "rounded");
  }

  _showImageSelector() {
    // Don't show selector in readOnly mode
    if (this.readOnly) return;

    const modalContainer = document.createElement("div");
    modalContainer.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    document.body.appendChild(modalContainer);

    const modalContent = document.createElement("div");
    modalContent.className = "bg-white rounded-lg p-6 max-w-4xl w-full mx-4";
    modalContainer.appendChild(modalContent);

    // Create root for React rendering
    const root = createRoot(modalContent);

    // Function to close the modal
    const closeModal = () => {
      root.unmount();
      if (document.body.contains(modalContainer)) {
        document.body.removeChild(modalContainer);
      }
    };

    // Render ImageContainer component
    root.render(
      <ImageContainer
        onImageSelect={(image) => {
          let imageUrl = "";
          if (image && image.newsImageUrls && image.newsImageUrls.length > 0) {
            imageUrl = image.newsImageUrls[0].replace(
              "https://100.42.179.27:7198/imagecontainer/",
              "https://bravoadmin.uplms.org/uploads/imagecontainer/"
            );
          } else if (typeof image === "string") {
            imageUrl = image;
          }

          if (imageUrl) {
            this.data.url = imageUrl;
            this._createImage(imageUrl);
          }

          closeModal();

          // Notify the editor about changes
          // if (this.api && this.api.blocks) {
          //   this.api.blocks.update();
          // }
        }}
        onCancel={() => {
          closeModal();
        }}
      />
    );

    // Close modal when clicking outside
    modalContainer.addEventListener("click", (e) => {
      if (e.target === modalContainer) {
        closeModal();
      }
    });
  }

  save(blockContent) {
    return this.data;
  }

  validate(savedData) {
    if (!savedData.url || !savedData.url.trim()) {
      return false;
    }
    return true;
  }

  _updatePreview() {
    if (this.data.url) {
      this._createImage(this.data.url);

      // Let the editor know the content has been updated
      // if (this.api && this.api.blocks) {
      //   this.api.blocks.update();
      // }
    }
  }

  // Paste handling
  onPaste(event) {
    switch (event.type) {
      case "tag": {
        const img = event.detail.data;

        if (img.src) {
          this.data.url = img.src;
          this._createImage(this.data.url);
          return true;
        }
        break;
      }
      case "pattern": {
        const { data: text } = event.detail;

        // Check if pasted content is an image URL
        const urlPattern =
          /https?:\/\/\S+\.(gif|jpe?g|tiff?|png|webp|bmp)(\?\S+)?$/i;
        const matched = text.match(urlPattern);

        if (matched) {
          this.data.url = matched[0];
          this._createImage(this.data.url);
          return true;
        }
        break;
      }
      case "file": {
        const { file } = event.detail;

        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();

          reader.onload = (loadEvent) => {
            this.data.url = loadEvent.target.result;
            this._createImage(this.data.url);
          };

          reader.readAsDataURL(file);
          return true;
        }
        break;
      }
    }

    return false;
  }

  // This static getter enables undo/redo functionality
  static get enableLineBreaks() {
    return false;
  }

  // For more accurate content sanitizing
  static get sanitize() {
    return {
      url: true,
      caption: true,
      withBorder: false,
      withBackground: false,
      stretched: false,
      alignment: false,
      width: false,
    };
  }
}
