/**
 * Utility functions for handling news data, particularly EditorJS content
 */

/**
 * Parses and normalizes Editor.js data from different possible formats
 * @param {string|object} descriptionData - Raw description data which could be in various formats
 * @returns {object}
 */
export const normalizeEditorData = (descriptionData) => {
  // If no data provided, return empty EditorJS structure
  if (!descriptionData) {
    return {
      time: Date.now(),
      blocks: [],
      version: "2.30.5",
    };
  }

  // If it's already an object with blocks, return it
  if (typeof descriptionData === "object" && descriptionData.blocks) {
    return descriptionData;
  }

  try {
    // Handle double-serialized JSON (string within string)
    if (typeof descriptionData === "string") {
      // First try parsing it once
      let parsed;
      try {
        parsed = JSON.parse(descriptionData);
      } catch (parseError) {
        console.error("First level parsing error:", parseError);
        // If parsing fails, create a paragraph block with the raw text
        return {
          time: Date.now(),
          blocks: [
            {
              id: Math.random().toString(36).substring(2, 9),
              type: "paragraph",
              data: {
                text: descriptionData,
              },
            },
          ],
          version: "2.30.5",
        };
      }

      // If result is still a string, try parsing again (double serialized)
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) {
          // If second parsing fails, treat the first result as plain text
          return {
            time: Date.now(),
            blocks: [
              {
                id: Math.random().toString(36).substring(2, 9),
                type: "paragraph",
                data: {
                  text: parsed,
                },
              },
            ],
            version: "2.30.5",
          };
        }
      }

      // Ensure it has expected EditorJS structure
      if (parsed && typeof parsed === "object") {
        if (parsed.blocks) {
          return parsed;
        } else {
          // If parsed is an object but doesn't have blocks, wrap it
          return {
            time: Date.now(),
            blocks: [
              {
                id: Math.random().toString(36).substring(2, 9),
                type: "paragraph",
                data: {
                  text: JSON.stringify(parsed),
                },
              },
            ],
            version: "2.30.5",
          };
        }
      }
    }
  } catch (error) {
    console.error("Error parsing editor data:", error);
  }

  // Create a deep copy of the input to avoid reference issues
  let safeData;

  try {
    safeData = JSON.parse(JSON.stringify(descriptionData));
  } catch (e) {
    safeData = {};
  }

  // Fallback to empty structure if parsing fails
  return {
    time: Date.now(),
    blocks: safeData.blocks || [],
    version: "2.30.5",
  };
};

/**
 * Properly serializes EditorJS data for saving to API
 * @param {object|string} editorData - Editor data to be serialized
 * @returns {string} Properly serialized data for API storage
 */
export const serializeEditorData = (editorData) => {
  // Already a string? Return as is if it's valid JSON
  if (typeof editorData === "string") {
    try {
      // Check if it's valid JSON
      JSON.parse(editorData);
      return editorData;
    } catch (e) {
      // If not valid JSON, wrap it in a proper structure
      return JSON.stringify({
        time: Date.now(),
        blocks: [
          {
            id: Math.random().toString(36).substring(2, 9),
            type: "paragraph",
            data: {
              text: editorData,
            },
          },
        ],
        version: "2.30.5",
      });
    }
  }

  // If it's not an object or doesn't have blocks, create a proper structure
  if (!editorData || typeof editorData !== "object" || !editorData.blocks) {
    return JSON.stringify({
      time: Date.now(),
      blocks: editorData && Array.isArray(editorData) ? editorData : [],
      version: "2.30.5",
    });
  }

  // Make a deep copy to avoid reference issues
  let dataCopy;
  try {
    dataCopy = JSON.parse(JSON.stringify(editorData));
  } catch (e) {
    console.error("Error copying editor data:", e);
    dataCopy = {
      time: Date.now(),
      blocks: [],
      version: "2.30.5",
    };
  }

  // Ensure each block has an ID to prevent issues
  if (Array.isArray(dataCopy.blocks)) {
    dataCopy.blocks = dataCopy.blocks.map((block) => {
      if (!block.id) {
        block.id = Math.random().toString(36).substring(2, 9);
      }
      return block;
    });
  }

  // Proper serialization
  return JSON.stringify(dataCopy);
};

/**
 * Safely handles editor data changes in Create/Edit News forms
 * @param {string|object} value - The value from EditorJS
 * @param {Function} setDescription - State setter function
 */
export const handleDescriptionChange = (value, setDescription) => {
  try {
    // Check if value is already a string
    if (typeof value === "string") {
      setDescription(value);
    } else if (typeof value === "object") {
      // If it's an object, convert to string
      setDescription(JSON.stringify(value));
    } else {
      console.warn("Unexpected description format:", value);
      setDescription(value ? String(value) : "");
    }
  } catch (error) {
    console.error("Error processing description:", error);
    // Provide a fallback value in case of error
    setDescription(
      JSON.stringify({
        time: Date.now(),
        blocks: [
          {
            id: Math.random().toString(36).substring(2, 9),
            type: "paragraph",
            data: { text: "Error processing content. Please try again." },
          },
        ],
        version: "2.30.5",
      })
    );
  }
};

/**
 * Prepares form data for API submission, handling EditorJS data properly
 * @param {Object} formData - The form data object
 * @param {string|object} description - The EditorJS description data
 * @returns {FormData} - Ready-to-submit FormData object
 */
export const prepareNewsFormData = (formData, description) => {
  // Ensure description is properly formatted
  let processedDescription = description;

  if (typeof description === "string") {
    try {
      // Check if it's already valid JSON
      JSON.parse(description);
    } catch (err) {
      // If not valid JSON, wrap it in a proper EditorJS structure
      processedDescription = JSON.stringify({
        time: Date.now(),
        blocks: [
          {
            id: Math.random().toString(36).substring(2, 9),
            type: "paragraph",
            data: {
              text: description,
            },
          },
        ],
        version: "2.30.5",
      });
    }
  } else if (typeof description === "object") {
    processedDescription = JSON.stringify(description);
  }

  // Create a proper FormData object
  const formDataToSend = new FormData();

  // Append basic form fields
  formDataToSend.append("Title", formData.title.trim());
  formDataToSend.append("SubTitle", formData.subtitle.trim());
  formDataToSend.append("Description", processedDescription);
  formDataToSend.append("Priority", formData.priority);
  formDataToSend.append("TargetGroup", "TargetGroup");
  formDataToSend.append("NewsCategoryId", formData.newsCategoryId);
  formDataToSend.append("TargetGroupId", formData.targetGroupId);
  formDataToSend.append("HasNotification", formData.hasNotification);
  formDataToSend.append("HasComment", formData.hasComment);
  formDataToSend.append("HasLike", formData.hasLike);

  // Add files
  formData.newsImages.forEach((image) => {
    if (image.file) {
      formDataToSend.append("NewsImages", image.file);
    }
  });

  formData.attachments.forEach((attachment) => {
    if (attachment.file) {
      formDataToSend.append("Attachments", attachment.file);
    }
  });

  return formDataToSend;
};

/**
 * Parses description data from API responses
 * @param {Object} data - API response data
 * @returns {Object|null} - Parsed EditorJS data or null
 */
export const parseDescriptionFromAPI = (data) => {
  if (!data || !data.description) return null;

  try {
    // If it's a string, try to parse it
    if (typeof data.description === "string") {
      return JSON.parse(data.description);
    }
    // If it's already an object, return it
    return data.description;
  } catch (error) {
    console.error("Error parsing description from API:", error);
    return null;
  }
};
