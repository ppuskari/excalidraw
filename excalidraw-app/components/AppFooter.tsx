import { Footer } from "@excalidraw/excalidraw/index";
import { ToolButton } from "@excalidraw/excalidraw/components/ToolButton";
import { Tooltip } from "@excalidraw/excalidraw/components/Tooltip";
import React from "react";

import { isExcalidrawPlusSignedUser } from "../app_constants";

import { DebugFooter, isVisualDebuggerEnabled } from "./DebugCanvas";
import { EncryptedIcon } from "./EncryptedIcon";

const perfIcon = (
  <svg
    aria-hidden="true"
    focusable="false"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const AppFooter = React.memo(
  ({
    onChange,
    showPerfOverlay,
    onTogglePerfOverlay,
  }: {
    onChange: () => void;
    showPerfOverlay: boolean;
    onTogglePerfOverlay: () => void;
  }) => {
    return (
      <Footer>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
          }}
        >
          {isVisualDebuggerEnabled() && <DebugFooter onChange={onChange} />}
          <Tooltip label="Performance overlay (Alt+P)" long>
            <ToolButton
              type="button"
              icon={perfIcon}
              aria-label="Toggle performance overlay"
              aria-keyshortcuts="Alt+P"
              selected={showPerfOverlay}
              onClick={onTogglePerfOverlay}
              size="small"
            />
          </Tooltip>
          {!isExcalidrawPlusSignedUser && <EncryptedIcon />}
        </div>
      </Footer>
    );
  },
);
